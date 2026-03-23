import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const LandingPage = () => {
  const navigate = useNavigate();
  const { setUser } = useAuth();

const handleGuest = () => {
    // Clear user from context
    setUser(null);
    // Clear user from localStorage
    localStorage.removeItem('user');
    // Navigate to trip input as guest
    navigate('/trip-input');
  };

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
          onClick={handleGuest}
        >
          Continue as Guest
        </button>
      </div>
    </div>
  );
};

export default LandingPage;