import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import styles from './Consent.module.css';

const UserConsentPage = () => {
    const [checked, setChecked] = useState(false);
    const navigate = useNavigate();
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [success, setSuccess] = useState('');


    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        setError('');
        setSuccess('');

        try {
            // Get the signed-up user from localStorage
            const signupUser = JSON.parse(localStorage.getItem('signupUser'));
            const userId = signupUser?.id;

            if (!userId) {
                setError('User not found. Please sign up again.');
                setIsLoading(false);
                return;
            }

            // Send PUT request to update consent in database
            const response = await fetch(`http://127.0.0.1:5000/consent/${userId}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ consent_given: checked })
            });

            const data = await response.json();

            if (data.success) {
                setSuccess(data.message || 'Consent saved successfully.');

                // Save full user object to localStorage for login
                const fullUser = { ...signupUser, consent: checked };
                localStorage.setItem('user', JSON.stringify(fullUser));
                localStorage.removeItem('signupUser'); // remove temp signup data

                setTimeout(() => {
                    navigate('/login');
                }, 800);
            } else {
                setError(data.message || 'Failed to save consent.');
            }
        } catch (error) {
            console.error("Error sending consent:", error);
            setError('Failed to connect to the server.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className={styles.consentPage}>
            <div className={styles.consentBox}>
                <h2>User Consent: GENERATIVE AI USAGE</h2>
                <p>
                    Generative AI usage is required for the system to generate itineraries,
                    and will be used regardless whether or not consent is given.
                </p>

                <p>
                    Information that you provide, such as Destination, Departure & Return Dates,
                    Preferred Travel Activities*, and Budget* will be used in a prompt to generate
                    trip itineraries. If consent is given, past travel activity preferences will be
                    saved and shown in your User Profile. Past travel activity preferences may be
                    used to generate future trip itineraries.
                </p>

                <p>
                    Consent is NOT mandatory. By not agreeing to the terms, any entered preferred
                    activities will not be saved nor used in future itinerary generation. Consent
                    can be updated in User Profile at any time.
                </p>

                <br />

                <input
                    type="checkbox"
                    id="consent"
                    checked={checked}
                    onChange={(e) => setChecked(e.target.checked)}
                />
                <label htmlFor="consent"> I agree to the terms above.</label>

                <p>* information is not required to generate itineraries.</p>

                {error && (
                    <div style={{
                        color: '#D32F2F',
                        backgroundColor: '#FFEBEE',
                        padding: '10px',
                        borderRadius: '4px',
                        marginTop: '15px'
                    }}>
                        {error}
                    </div>
                )}

                {success && (
                    <div style={{
                        color: '#2E7D32',
                        backgroundColor: '#E8F5E9',
                        padding: '10px',
                        borderRadius: '4px',
                        marginTop: '15px'
                    }}>
                        {success}
                    </div>
                )}
            </div>

            <button onClick={handleSubmit} disabled={isLoading}>
                {isLoading ? 'Submitting...' : 'Proceed to itinerary generation.'}
            </button>
        </div>
    );
};

export default UserConsentPage;