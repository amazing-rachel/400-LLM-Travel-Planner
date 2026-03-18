import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import styles from './Login&Signup.module.css';


const LoginForm = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();
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
        body: JSON.stringify({ username, password })
      });
      const data = await response.json();
      if (data.success) {
        login(data.user);
        setSuccess(data.message);
        // Redirect after 2 seconds
        setTimeout(() => {
          navigate('/user-consent');
        }, 2000);
      } else {
        setError(data.message);  
      }
    } catch (err) {
      setError('Failed to connect to the server. Please try again later.');
    } finally {
      setIsLoading(false);
    }
  };

return (
    <div className={styles.signupPage}>
    <form className={styles.signupForm} onSubmit={handleSubmit}>
       <label>Username:</label>
          <input className={styles.signupInput}
          name='username'
          type='text'
          required
          onChange={(e) => setUsername(e.target.value)}
          />
          <br />
      <label>Password:</label >
          <input className={styles.signupInput}
          name='password'
          type='password'
          required
          onChange={(e) => setPassword(e.target.value)}
          />
      <br />

      {error && (
        <div style={{ 
          color: '#D32F2F', 
          backgroundColor: '#FFEBEE', 
          padding: '10px', 
          borderRadius: '4px',
          marginBottom: '15px'
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
          marginBottom: '15px'
        }}>
          {success}
        </div>
      )}

      <button 
        type="submit" 
        disabled={isLoading}
        className={styles.signupButton}
      >
        {isLoading ? 'Authenticating...' : 'Login'}
      </button>
    </form>
    <nav style={{color: 'white', textAlign: 'center', marginTop: '20px'}}>
      <Link to="/signup">Don't have an account? Sign up.</Link>
    </nav>
     <nav style={{color: 'white', textAlign: 'center', marginTop: '20px'}}>
      <Link to="/admin-login">Are you an Admin user? Click here.</Link>
    </nav>
    </div>
  );
};

export default LoginForm;




