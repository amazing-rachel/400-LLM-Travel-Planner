import { Routes, Route } from 'react-router-dom';
import './App.css'; 
import './index.css'; 
import Header from './components/Header';
import Footer from './components/Footer';
import LandingPage from './components/LandingPage';
<<<<<<< HEAD
=======
import AdminDashboard from './components/AdminDashboard';
import SavedItineraries from './components/SavedItineraries';
import ItineraryResult from './components/ItineraryResult';
>>>>>>> origin/LLM_Integration
import TripInputPage from './components/TripInputPage';
import SignupPage from './components/SignupPage';
import LoginPage from './components/LoginPage';
import AdminLoginPage from './components/AdminLoginPage';
import UserConsentPage from './components/UserConsentPage';
<<<<<<< HEAD
import SavedItineraries from './components/SavedItineraries';
=======
import UserProfile from './components/UserProfile';
>>>>>>> origin/LLM_Integration

function AppContent() {
  const themeClass = "landing-page-theme";

  return (
    <div className={`app-wrapper app-bg-container ${themeClass}`}>
      <Header />

      <main className="content-area">
        <Routes>
          <Route path="/" element={<LandingPage />} />


           <Route 
            path="/login" element={<LoginPage />}
          />
          
           <Route 
            path="/signup" element={<SignupPage />}
          />

          <Route 
            path="/trip-input" element={<TripInputPage />}
            />
            
          <Route
           path="/itinerary-results" element={<ItineraryResult />}
          />

          <Route 
            path="/admin-login" element={<AdminLoginPage />}
          />

          <Route 
            path="/user-consent" element={<UserConsentPage />}
          />

          <Route 
            path="/admin" element={<AdminDashboard />} 
          />
          
          <Route 
            path="/profile" element={<UserProfile />}
          />
          
          <Route 
            path="/saved-itineraries" element={<SavedItineraries />} 
          />

          
          <Route path="*" element={<div style={{textAlign: 'center', padding: '50px'}}>Page Not Found</div>} />
        </Routes>
      </main>

      <Footer />
    </div>
  );
}

function App() {
  return (
      <AppContent />
  );
}

export default App;