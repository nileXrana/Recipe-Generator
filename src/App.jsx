import React, { useState, useEffect } from 'react';
import Login from './components/Login';
import Register from './components/Register';
import RecipeDashboard from './components/RecipeDashboard';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import './App.css';

function App() {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [currentPage, setCurrentPage] = useState('dashboard'); // 'dashboard', 'login', 'register'

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
    setCurrentPage('dashboard');
    toast.success('Login successful! Welcome back!', {
      position: "top-right",
      autoClose: 3000,
      hideProgressBar: false,
      closeOnClick: true,
      pauseOnHover: true,
      draggable: true,
    });
  };

  const handleRegister = (userData, userToken) => {
    setUser(userData);
    setToken(userToken);
    setCurrentPage('dashboard');
    toast.success('Account created successfully! Welcome!', {
      position: "top-right",
      autoClose: 3000,
      hideProgressBar: false,
      closeOnClick: true,
      pauseOnHover: true,
      draggable: true,
    });
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
    setToken(null);
    toast.info('You are signed out!', {
      position: "top-right",
      autoClose: 2000,
      hideProgressBar: false,
      closeOnClick: true,
      pauseOnHover: true,
      draggable: true,
    });
    // Refresh the page after showing toast
    setTimeout(() => {
      window.location.reload();
    }, 2000);
  };

  const handleShowLogin = () => {
    setCurrentPage('login');
  };

  const handleShowRegister = () => {
    setCurrentPage('register');
  };

  const handleBackToDashboard = () => {
    setCurrentPage('dashboard');
  };

  // Render the current page
  if (currentPage === 'login') {
    return (
      <>
        <Login 
          onLogin={handleLogin} 
          onSwitchToRegister={handleShowRegister}
          onBackToDashboard={handleBackToDashboard}
        />
        <ToastContainer />
      </>
    );
  }

  if (currentPage === 'register') {
    return (
      <>
        <Register 
          onRegister={handleRegister} 
          onSwitchToLogin={handleShowLogin}
          onBackToDashboard={handleBackToDashboard}
        />
        <ToastContainer />
      </>
    );
  }

  return (
    <>
      <RecipeDashboard 
        user={user} 
        token={token} 
        onLogout={handleLogout}
        onShowLogin={handleShowLogin}
        onShowRegister={handleShowRegister}
      />
      <ToastContainer />
    </>
  );
}

export default App;
 