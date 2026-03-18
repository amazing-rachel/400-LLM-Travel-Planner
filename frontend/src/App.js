import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import './App.css'; 
import './index.css'; 
import Header from './components/Header';
import Footer from './components/Footer';
import LandingPage from './components/LandingPage';
import AdminDashboard from './components/AdminDashboard';

function AppContent() {
  const themeClass = "landing-page-theme";

  return (
    <div className={`app-wrapper app-bg-container ${themeClass}`}>
      <Header />

      <main className="content-area">
        <Routes>
          <Route path="/" element={<LandingPage />} />

          <Route 
            path="/login" 
            element={
              <div className="auth-page">
                <div className="glass-panel">
                  <h2>Login</h2>
                </div>
              </div>
            } 
          />
          
          <Route 
            path="/signup" 
            element={
              <div className="auth-page">
                <div className="glass-panel">
                  <h2>Sign Up</h2>
                </div>
              </div>
            } 
          />

          <Route 
            path="/trip-input" 
            element={
              <div className="landing-page">
                 <div className="glass-panel">
                  <h2>Plan Your Trip</h2>
                </div>
              </div>
            } 
          />

          <Route path="/admin" element={<AdminDashboard />} />
          
          <Route path="*" element={<div style={{textAlign: 'center', padding: '50px'}}>Page Not Found</div>} />
        </Routes>
      </main>

      <Footer />
    </div>
  );
}

function App() {
  return (
    <Router>
      <AppContent />
    </Router>
  );
}

export default App;