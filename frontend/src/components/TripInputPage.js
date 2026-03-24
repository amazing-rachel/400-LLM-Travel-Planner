import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import styles from './TripInput.module.css';
import Select from 'react-select';

const TripInputPage = () => {
    const [destination, setDestination] = useState('');
    const [budget, setBudget] = useState(100);
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');
    const [activities, setActivities] = useState('');
    const [cityResults, setCityResults] = useState([]);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const navigate = useNavigate();

    useEffect(() => {
        if (destination.length < 2) {
            setCityResults([]);
            return;
        }

        const timeout = setTimeout(() => {
            fetch(
                `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(
                    destination
                )}&format=json&addressdetails=1&limit=10`
            )
                .then((res) => res.json())
                .then((data) => {
                    const allowedTypes = [
                        'city',
                        'town',
                        'village',
                        'hamlet',
                        'suburb',
                        'municipality',
                        'administrative',
                        'county',
                    ];

                    const filtered = data.filter((item) =>
                        allowedTypes.includes(item.type)
                    );
                    setCityResults(filtered);
                })
                .catch((err) => console.error(err));
        }, 300);

        return () => clearTimeout(timeout);
    }, [destination]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setSuccess('');

        if (!destination) {
            setError('Destination is required.');
            return;
        }

        if (!startDate || !endDate) {
            setError('Start and End dates are required.');
            return;
        }

        setIsLoading(true);

        try {
            const user = JSON.parse(localStorage.getItem('user'));
            const userId = user?.id;

            const payload = {
                destination,
                startDate,
                endDate,
                budget,
                activities,
            };

            if (userId) {
                payload.user_id = userId;
            } else {
                payload.guest = true;
            }

            const response = await fetch('http://127.0.0.1:5000/trip-input', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload),
            });

            const data = await response.json();

            if (data.success) {
                if (userId) {
                    setSuccess(data.message || 'Itinerary generated successfully.');
                    setTimeout(() => {
                        navigate('/saved-itineraries');
                    }, 800);
                } else {
                    navigate('/itinerary-results', {
                        state: {
                            destination,
                            startDate,
                            endDate,
                            budget,
                            activities,
                            itinerary: data.itinerary,
                        },
                    });
                }
            } else {
                setError(data.message || 'Failed to generate itinerary.');
            }
        } catch (err) {
            console.error('Error fetching itinerary:', err);
            setError('Failed to connect to the server. Please try again later.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className={styles.tripInputPage}>
            <div className={styles.tripInputBox}>
                <h2>Enter your trip details:</h2>

                <label htmlFor="destination">Destination:</label>
                <Select
                    options={Array.from(
                        new Map(
                            cityResults
                                .sort((a, b) => {
                                    const priority = ['city', 'town', 'municipality'];
                                    return priority.indexOf(a.type) - priority.indexOf(b.type);
                                })
                                .map((city) => {
                                    const addr = city.address || {};

                                    const cityName =
                                        addr.city ||
                                        addr.town ||
                                        addr.village ||
                                        addr.municipality ||
                                        addr.county;

                                    const country = addr.country;

                                    const label =
                                        cityName && country
                                            ? `${cityName}, ${country}`
                                            : city.display_name;

                                    return [
                                        label,
                                        {
                                            value: label,
                                            label,
                                        },
                                    ];
                                })
                        ).values()
                    )}
                    onInputChange={(value, action) => {
                        if (action.action === 'input-change') {
                            setDestination(value || '');
                        }
                    }}
                    onChange={(selected) => {
                        setDestination(selected ? selected.value : '');
                    }}
                    placeholder="Enter a city..."
                    isClearable
                    noOptionsMessage={() => 'Type to search cities...'}
                />

                <label htmlFor="start">Start Date:</label>
                <input
                    type="date"
                    id="start"
                    name="start"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    required
                />

                <label htmlFor="end">End Date:</label>
                <input
                    type="date"
                    id="end"
                    name="end"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    min={startDate}
                    required
                />

                <div className={styles.budgetContainer}>
                    <p>Budget: ${budget}</p>
                    <input
                        type="range"
                        min="100"
                        max="500000"
                        step="100"
                        value={budget}
                        onChange={(e) => setBudget(Number(e.target.value))}
                        className="slider"
                        id="budget"
                    />
                    <div className={styles.manualBudget}>
                        <span className="currency">$</span>
                        <input
                            type="number"
                            min="100"
                            max="500000"
                            step="100"
                            value={budget}
                            onChange={(e) => {
                                let value = Number(e.target.value);
                                if (value > 500000) value = 500000;
                                if (value < 100) value = 100;
                                setBudget(value);
                            }}
                            className="manual-budget"
                        />
                    </div>
                </div>

                <label htmlFor="activities">Write activities you prefer, dislike, etc</label>
                <textarea
                    id="activities"
                    name="activities"
                    value={activities}
                    onChange={(e) => setActivities(e.target.value)}
                />

                {error && (
                    <div
                        style={{
                            color: '#D32F2F',
                            backgroundColor: '#FFEBEE',
                            padding: '10px',
                            borderRadius: '4px',
                            marginTop: '15px',
                        }}
                    >
                        {error}
                    </div>
                )}

                {success && (
                    <div
                        style={{
                            color: '#2097ff',
                            backgroundColor: '#d9eafb',
                            padding: '10px',
                            borderRadius: '4px',
                            marginTop: '15px',
                        }}
                    >
                        {success}
                    </div>
                )}

                <button onClick={handleSubmit} disabled={isLoading}>
                    {isLoading ? 'Generating...' : 'Generate Itineraries'}
                </button>
            </div>
        </div>
    );
};

export default TripInputPage;