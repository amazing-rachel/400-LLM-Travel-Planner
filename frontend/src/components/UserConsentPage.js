import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const UserConsentPage = () => {
  const [checked, setChecked] = useState(false);
  const navigate = useNavigate();

  return (
    <div className="consent-page">
        <div className="consent-box">
        <h2>User Consent: GENERATIVE AI USAGE</h2>
        <p>Generative AI usage is required for the system to generate itineraries, and will be used regardless whether or not consent is given. </p>

        <p>Information that you provide, such as Destination, Departure & Return Dates, Preferred Travel Activities*, and Budget* will be used in a prompt to generate trip itineraries. If consent is given, past travel activity preferences will be saved and shown in your User Profile. Past travel activity preferences may be used to generate future trip itineraries.</p>
            
        <p>Consent is NOT mandatory and your preferred activities will not be saved nor used in future itinerary generation. Consent can be updated in User Profile at any time.</p>

        <br />

        <input type="checkbox" id="consent"/> 
        <label for="consent"> I agree to the terms above.</label>

        <p>* information is not required to generate itineraries.</p>

        </div>
        <button onClick={() => navigate('/trip-input')}>Proceed to itinerary generation.</button>
                  

    </div>
  );
};

export default UserConsentPage;