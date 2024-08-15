import React, { useState } from 'react';
import { useHistory } from 'react-router-dom';

import {API_URL} from '../configs/server';

import './styles/Login.css';

const Login = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const history = useHistory();

    const handleLogin = async (e) => {
        e.preventDefault();
        try {
            const response = await fetch(`${API_URL}/auth/login`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ email, password }),
            });
    
            const data = await response.json();
            
            if (data.success) {
                // Store the authentication token in localStorage
                localStorage.setItem('authToken', data.token);
                // Redirect to home page
                history.push('/home');
            } else {
                // Handle login failure (e.g., show error message)
                console.log(data);
                alert('Invalid credentials. Please try again.');
            }
        } catch (error) {
            console.log(error);
            setError(error);
        }
    };

    return (
        <div className="login-container">
            <div className="login-form">
                <h2>Login</h2>
                {error && <p className="error-message">{error}</p>}
                <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Email"
                    className="login-input"
                />
                <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Password"
                    className="login-input"
                />
                <button onClick={handleLogin} className="login-button">
                    Login
                </button>
            </div>
        </div>
    );
};

export default Login;
