import React, { useState } from 'react';
import { useHistory } from 'react-router-dom';
import { postFetch } from '../../modules/fetch';

import './css/index.css';

const Login = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const history = useHistory();

    const handleLogin = async (e) => {
        e.preventDefault();
        try {

            postFetch({
                url: '/auth/login',
                body: { email, password },
                callback: (data) => {
                    if (data.success) {
                        // Store the authentication token in localStorage
                        localStorage.setItem('authToken', data.token);
                        // Redirect to home page
                        history.push('/home');
                        window.location.href = '/home';
                    } else {
                        // Handle login failure (e.g., show error message)
                        console.log(data);
                        alert('Invalid credentials. Please try again.');
                    }
                },
                onError: (error) => {
                    console.log(error);
                    setError(error);
                }
            })

            
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
