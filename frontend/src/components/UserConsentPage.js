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
        const response = await fetch('http://127.0.0.1:5000/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({consent:checked})
        });
        const data = await response.json();
        } catch (error) {
            console.error("Error sending consent:", error);
            navigate("/trip-input");
        }
    };

    return (
        <div className={styles.consentPage}>
            <div className={styles.consentBox}>
            <h2>User Consent: GENERATIVE AI USAGE</h2>
            <p>Generative AI usage is required for the system to generate itineraries, and will be used regardless whether or not consent is given. </p>

            <p>Information that you provide, such as Destination, Departure & Return Dates, Preferred Travel Activities*, and Budget* will be used in a prompt to generate trip itineraries. If consent is given, past travel activity preferences will be saved and shown in your User Profile. Past travel activity preferences may be used to generate future trip itineraries.</p>
                
            <p>Consent is NOT mandatory. By not agreeing to the terms, any entered preferred activities will not be saved nor used in future itinerary generation. Consent can be updated in User Profile at any time.</p>

            <br />

            <input type="checkbox" id="consent" checked={checked} onChange={(e) => setChecked(e.target.checked)}/> 
            <label for="consent"> I agree to the terms above.</label>

            <p>* information is not required to generate itineraries.</p>

            </div>
            <button onClick={handleSubmit}>Proceed to itinerary generation.</button>
                    

        </div>
    );
};

export default UserConsentPage;