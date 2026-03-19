import React, { useState} from 'react';
import { useNavigate} from 'react-router-dom';
import styles from './TripInput.module.css'

const TripInputPage = () => {
    const [destination, setDestination] = useState('');
    const [budget, setBudget] = useState(100);
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');
    const [activities, setActivities] = useState('');
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const navigate = useNavigate();
    //const [success, setSuccess] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        //setIsLoading(true);
        setError('');
        //setSuccess('');

         if (!destination || !startDate || !endDate) {
            alert("Destination, Start and End dates are required.");
            return;
        }

        const tripData = { destination, startDate, endDate, budget, activities };

        setIsLoading(true);

        try {
        const response = await fetch('http://127.0.0.1:5000/trip-input', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(tripData)
        });

        const data = await response.json();

        if (data.success) {
            console.log(data.itinerary); // REMEMBER TO STORE IT IN DATABASE!
            //setSuccess("Itinerary generated!");
            navigate('/itinerary-results', { state: { ...tripData, itinerary: data.itinerary } });
        } else {
            setError(data.message || "Failed to generate itinerary");  
        }
        } catch (err) {
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
            <input
            type="text"
            id="destination"
            name="destination"
            value={destination}
            onChange={(e) => setDestination(e.target.value)}
            placeholder="e.g. Paris, Tokyo, Banff"
            required
            />
            <label htmlFor="start">Start Date:</label>
            <input type="date" id="start" name="start" value={startDate} onChange={(e) => setStartDate(e.target.value)} required></input>
            <label htmlFor="end">End Date:</label>
            <input type="date" id="end" name="end" value={endDate} onChange={(e) => setEndDate(e.target.value)} min={startDate} required></input>
            <div className={styles.budgetContainer}>
                <p>Budget: ${budget}</p>
                <input type="range" min="100" max="10000" step="50" value={budget}  onChange={(e) => setBudget(Number(e.target.value))} className="slider" id="budget"/>
                <div className={styles.manualBudget}>
                    <span className="currency">$</span>
                    <input type="number" min="100" max="10000" step="50" value={budget} className="manual-budget" onChange={(e) => setBudget(Number(e.target.value))}/>
                </div>
            </div>

            <label htmlFor="activities">Write activities you prefer, dislike, etc</label>
            <textarea id="activities" name="activities"   value={activities} onChange={(e) => setActivities(e.target.value)}></textarea>

            <button onClick={handleSubmit}>Generate Itineraries</button>
        </div>

    </div>
   );
};

export default TripInputPage;