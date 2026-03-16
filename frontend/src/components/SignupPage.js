import { useNavigate } from 'react-router-dom';
import React, { useState } from 'react';

const SignupPage = () => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [email, setEmail] = useState('');
    const [errors, setErrors] = useState([]);
    const [message, setMessage] = useState('');
    const navigate = useNavigate();

     const validateUsername = (username) => {
        if (username.length < 3 || username.length > 20) return "Invalid username (Username must be between 3 and 20 characters long)";
        if (!/^[a-zA-Z]/.test(username)) return "Invalid username (Username must start with a letter)";
        if (!/^[a-zA-Z0-9-_]+$/.test(username)) return "Invalid username (Username can only contain letters, numbers, hyphens, and underscores, no spaces)";
        return null;
    };

    const validatePassword = (password) => {
        if (password.length < 8) return "Invalid password (Password must be at least 8 characters long)";
        if (!/[A-Z]/.test(password)) return "Invalid password (Password must contain at least one uppercase letter)";
        if (!/[a-z]/.test(password)) return "Invalid password (Password must contain at least one lowercase letter)";
        if (!/[0-9]/.test(password)) return "Invalid password (Password must contain at least one number)";
        if (!/[!@#$%^&*()\-_+=\[\]{}|;:'",.<>?/`~]/.test(password)) return "Invalid password (Password must contain at least one special character)";
        if (/\s/.test(password)) return "Invalid password (Password cannot contain spaces)";
        return null;
    };

    const validateEmail = (email) => {
        if (!email.includes("@")) return "Invalid email (Email must contain @)";
        if (!/\.[a-zA-Z]+$/.test(email)) return "Invalid email (Email must contain a domain name (e.g. .com, .net, .io))";
        if (/\s/.test(email)) return "Invalid email (Email cannot contain spaces)";
        return null;
    };

    const handleSubmit = async (e) => { //frontend api calls
    }

    return (
        <div className="signup-page">
            <div className="signup-fields">
                <h2 style={{ color: "white" }}>Please Enter Information</h2>
                <form className="signup-form" /*onSubmit={handleSubmit}*/>
                 <label>First Name:</label>
                        <input className="signup-input"
                        name='username'
                        type='text'
                        required
                        onChange={(e) => setUsername(e.target.value)}
                        />
                        <br />
                   <label>Last Name:</label>
                        <input className="signup-input"
                        name='username'
                        type='text'
                        required
                        onChange={(e) => setUsername(e.target.value)}
                        />
                        <br />      
                    <label>Username:</label>
                        <input className="signup-input"
                        name='username'
                        type='text'
                        required
                        onChange={(e) => setUsername(e.target.value)}
                        />
                        <br />
                    <label>Password:</label >
                    <input className="signup-input"
                    name='password'
                    type='password'
                    required
                    onChange={(e) => setPassword(e.target.value)}
                    />
                    <br />
                    <label>Confirm Password:</label >
                    <input className="signup-input"
                    name='password'
                    type='password'
                    required
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    />
                    <br />
                    <label>Email:</label >
                    <input className="signup-input"
                    name='email'
                    type='text'
                    required
                    onChange={(e) => setEmail(e.target.value)}
                    />
                    <br />
                    <button 
                        className="signup-button"
                        >Sign Up</button>
                </form>
            </div>
        </div>
  );
};

export default SignupPage;