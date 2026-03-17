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

    const handleSubmit = async (e) => {
        e.preventDefault(); 
        let errors = [];
        const usernameError = validateUsername(username);
        const passwordError = validatePassword(password);
        const emailError = validateEmail(email);

        if (usernameError) errors.push(usernameError);
        if (passwordError) errors.push(passwordError);
        if (password !== confirmPassword) errors.push("Passwords do not match.");
        if (emailError) errors.push(emailError);

        if (errors.length > 0) {
            setMessage('');
            setErrors(errors);
        } else {
            setErrors([]);

            try {
                const backendEndpoint = 'http://127.0.0.1:5000/register';
                const response = await fetch(backendEndpoint, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({ username, password, email }), 
                });
                const data = await response.json();
                if (data.success){
                    setMessage(data.message);
                    setTimeout(() => navigate("/login"), 1000);
                } else {
                    setErrors([data.message]);
                }
            } catch (error) {
                console.error('Error during form submission:', error);  
                setErrors(["An error occurred during registration."]);
            }
        }
    };

    return (
        <div className="signup-page">
            <div>
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
