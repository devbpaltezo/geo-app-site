import React from 'react';
import { BrowserRouter as Router, Route, Switch, Redirect } from 'react-router-dom';
import Login from './components/Login';
import Home from './components/Home';

const App = () => {
    // Check if the user is authenticated
    const isAuthenticated = () => {
        // Implement your authentication check logic here
        // For example, check if a token exists in localStorage
        return !!localStorage.getItem('authToken');
    };

    return (
        <Router>
            <Switch>
                <Route exact path="/login">
                    <Login />
                </Route>
                <Route exact path="/home">
                    {isAuthenticated() ? <Home /> : <Redirect to="/login" />}
                </Route>
                <Route exact path="/">
                    <Redirect to={isAuthenticated() ? "/home" : "/login"} />
                </Route>
            </Switch>
        </Router>
    );
};

export default App;