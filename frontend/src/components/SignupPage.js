import { useNavigate } from 'react-router-dom';
import React, { useState } from 'react';
import styles from './Login&Signup.module.css';

const SignupPage = () => {
    const [firstName, setFirstName] = useState('');
    const [lastName, setLastName] = useState('');
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [email, setEmail] = useState('');
    const [errors, setErrors] = useState([]);
    const [message, setMessage] = useState('');
    const navigate = useNavigate();
    

    const validateUsername = (username) => {
        if (username.length < 3 || username.length > 20) {
            return "Invalid username (Username must be between 3 and 20 characters long)";
        }
        if (!/^[a-zA-Z]/.test(username)) {
            return "Invalid username (Username must start with a letter)";
        }
        if (!/^[a-zA-Z0-9-_]+$/.test(username)) {
            return "Invalid username (Username can only contain letters, numbers, hyphens, and underscores, no spaces)";
        }
        return null;
    };

    const validatePassword = (password) => {
        if (password.length < 4) {
            return "Password must be at least 4 characters long";
        }
        return null;
    };

    const validateEmail = (email) => {
        if (!email.includes("@")) return "Invalid email (Email must contain @)";
        if (!/\.[a-zA-Z]+$/.test(email)) return "Invalid email (Email must contain a domain name such as .com or .net)";
        if (/\s/.test(email)) return "Invalid email (Email cannot contain spaces)";
        return null;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        let formErrors = [];
        const usernameError = validateUsername(username);
        const passwordError = validatePassword(password);
        const emailError = validateEmail(email);

        if (!firstName.trim()) formErrors.push("First name is required.");
        if (!lastName.trim()) formErrors.push("Last name is required.");
        if (usernameError) formErrors.push(usernameError);
        if (passwordError) formErrors.push(passwordError);
        if (password !== confirmPassword) formErrors.push("Passwords do not match.");
        if (emailError) formErrors.push(emailError);

        if (formErrors.length > 0) {
            setMessage('');
            setErrors(formErrors);
            return;
        }

        setErrors([]);
        setMessage('');

        try {
            const backendEndpoint = 'http://127.0.0.1:5000/register';
            const response = await fetch(backendEndpoint, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    first_name: firstName,
                    last_name: lastName,
                    username,
                    password,
                    email
                    
                }),
            });

            const data = await response.json();

            if (data.success) {
                // Save user temporarily for consent page
                localStorage.setItem('signupUser', JSON.stringify(data.user));
                navigate("/user-consent"); // go to consent page after signup
            } else {
                setErrors([data.message || "Registration failed."]);
            }
        } catch (error) {
            console.error('Error during form submission:', error);
            setErrors(["An error occurred during registration."]);
        }
    };

    return (
        <div className={styles.signupPage}>
            <div>
                <h2 style={{ color: "white" }}>Please Enter Information</h2>

                <form className={styles.signupForm} onSubmit={handleSubmit}>
                    <label>First Name:</label>
                    <input
                        className={styles.signupInput}
                        name='firstName'
                        type='text'
                        required
                        onChange={(e) => setFirstName(e.target.value)}
                    />
                    <br />

                    <label>Last Name:</label>
                    <input
                        className={styles.signupInput}
                        name='lastName'
                        type='text'
                        required
                        onChange={(e) => setLastName(e.target.value)}
                    />
                    <br />

                    <label>Username:</label>
                    <input
                        className={styles.signupInput}
                        name='username'
                        type='text'
                        required
                        onChange={(e) => setUsername(e.target.value)}
                    />
                    <br />

                    <label>Password:</label>
                    <input
                        className={styles.signupInput}
                        name='password'
                        type='password'
                        required
                        onChange={(e) => setPassword(e.target.value)}
                    />
                    <br />

                    <label>Confirm Password:</label>
                    <input
                        className={styles.signupInput}
                        name='confirmPassword'
                        type='password'
                        required
                        onChange={(e) => setConfirmPassword(e.target.value)}
                    />
                    <br />

                    <label>Email:</label>
                    <input
                        className={styles.signupInput}
                        name='email'
                        type='text'
                        required
                        onChange={(e) => setEmail(e.target.value)}
                    />
                    <br />

                    {errors.length > 0 && (
                        <div style={{
                            color: '#D32F2F',
                            backgroundColor: '#FFEBEE',
                            padding: '10px',
                            borderRadius: '4px',
                            marginBottom: '15px'
                        }}>
                            {errors.map((err, index) => (
                                <div key={index}>{err}</div>
                            ))}
                        </div>
                    )}

                    {message && (
                        <div style={{
                            color: '#2E7D32',
                            backgroundColor: '#E8F5E9',
                            padding: '10px',
                            borderRadius: '4px',
                            marginBottom: '15px'
                        }}>
                            {message}
                        </div>
                    )}

                    <button
                        type="submit"
                        className={styles.signupButton}
                    >
                        Sign Up
                    </button>
                </form>
            </div>
        </div>
    );
};

export default SignupPage;