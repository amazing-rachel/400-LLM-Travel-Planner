import { useNavigate } from 'react-router-dom';

const LandingPage = () => {
  const navigate = useNavigate();

  return (
    <div className="landing-page">
      <h1>Welcome to the LLM Travel Planner!</h1>
      <p>Create the perfect itinerary for your next trip, tailored to your interests and budget.</p>
      
      <div className="button-group">
        <button 
          className="main-btn" 
          style={{ backgroundColor: '#2097ff', color: 'white' }}
          onClick={() => navigate('/login')}
        >
          Login
        </button>
        
        <button 
          className="main-btn" 
          style={{ backgroundColor: '#2097ff', color: 'white' }}
          onClick={() => navigate('/signup')}
        >
          Sign Up
        </button>
        
        <button 
          className="main-btn" 
          style={{ backgroundColor: '#2097ff', color: 'white' }}
          onClick={() => navigate('/trip-input')}
        >
          Continue as Guest
        </button>
      </div>
    </div>
  );
};

export default LandingPage;