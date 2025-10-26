import React, { useState, useEffect } from 'react';
import Login from './components/Login';
import Register from './components/Register';
import RecipeDashboard from './components/RecipeDashboard';
import './App.css';

function App() {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [showLogin, setShowLogin] = useState(true);

  useEffect(() => {
    // Check if user is already logged in
    const storedToken = localStorage.getItem('token');
    const storedUser = localStorage.getItem('user');
    
    if (storedToken && storedUser) {
      setToken(storedToken);
      setUser(JSON.parse(storedUser));
    }
  }, []);

  const handleLogin = (userData, userToken) => {
    setUser(userData);
    setToken(userToken);
  };

  const handleRegister = (userData, userToken) => {
    setUser(userData);
    setToken(userToken);
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
    setToken(null);
  };

  // Show dashboard if user is logged in
  if (user && token) {
    return <RecipeDashboard user={user} token={token} onLogout={handleLogout} />;
  }

  // Show login or register
  if (showLogin) {
    return <Login onLogin={handleLogin} onSwitchToRegister={() => setShowLogin(false)} />;
  } else {
    return <Register onRegister={handleRegister} onSwitchToLogin={() => setShowLogin(true)} />;
  }
}

export default App; 