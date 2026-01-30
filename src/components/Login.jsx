import React, { useState, useEffect, useRef } from 'react';
import NET from 'vanta/dist/vanta.net.min';
import * as THREE from 'three';

function Login({ onLogin, onSwitchToRegister, onBackToDashboard }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const vantaRef = useRef(null);
  const [vantaEffect, setVantaEffect] = useState(null);

  useEffect(() => {
    if (!vantaEffect) {
      setVantaEffect(
        NET({
          el: vantaRef.current,
          THREE: THREE,
          mouseControls: true,
          touchControls: true,
          gyroControls: false,
          minHeight: 200.00,
          minWidth: 200.00,
          scale: 1.00,
          scaleMobile: 1.00,
          color: 0x667eea,
          backgroundColor: 0x0f0c29,
          points: 12.00,
          maxDistance: 23.00,
          spacing: 16.00
        })
      );
    }
    return () => {
      if (vantaEffect) vantaEffect.destroy();
    };
  }, [vantaEffect]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const res = await fetch('http://localhost:4000/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (res.ok) {
        localStorage.setItem('token', data.token);
        localStorage.setItem('user', JSON.stringify(data.user));
        onLogin(data.user, data.token);
      } else {
        setError(data.message || 'Login failed');
      }
    } catch (err) {
      setError('Failed to connect to server');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div ref={vantaRef} className="min-h-screen flex items-center justify-center p-8 relative overflow-hidden">
      {/* Back button */}
      {onBackToDashboard && (
        <button 
          onClick={onBackToDashboard}
          className="absolute top-6 left-6 text-white/90 hover:text-white flex items-center gap-2 font-semibold transition-all hover:gap-3 z-20 bg-white/10 backdrop-blur-sm px-4 py-2 rounded-lg hover:bg-white/20"
        >
          <span>←</span> Back to Dashboard
        </button>
      )}

      {/* Animated background pattern */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle,_rgba(255,255,255,0.1)_1px,_transparent_1px)] bg-[length:50px_50px] animate-[moveBackground_20s_linear_infinite]"></div>
      </div>

      <div className="bg-slate-900/95 backdrop-blur-lg rounded-3xl p-12 max-w-md w-full shadow-2xl relative z-10 animate-[slideUp_0.5s_ease-out] border border-slate-700">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-extrabold bg-gradient-to-r from-purple-400 to-indigo-400 bg-clip-text text-transparent mb-2">
            Welcome Back
          </h1>
          <p className="text-slate-400 font-medium">Sign in to continue to Recipe Generator</p>
        </div>
        
        <form onSubmit={handleSubmit} className="flex flex-col gap-5">
          <div className="flex flex-col gap-2">
            <label className="text-sm font-semibold text-slate-300 ml-1">Email</label>
            <input
              type="email"
              className="px-4 py-3.5 border-2 border-slate-600 rounded-xl text-slate-100 bg-slate-800/50 transition-all duration-200 outline-none focus:border-purple-500 focus:ring-4 focus:ring-purple-500/20 placeholder:text-slate-500"
              placeholder="your@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-sm font-semibold text-slate-300 ml-1">Password</label>
            <input
              type="password"
              className="px-4 py-3.5 border-2 border-slate-600 rounded-xl text-slate-100 bg-slate-800/50 transition-all duration-200 outline-none focus:border-purple-500 focus:ring-4 focus:ring-purple-500/20 placeholder:text-slate-500"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={6}
            />
          </div>

          {error && (
            <div className="bg-red-900/30 border border-red-700 text-red-300 px-4 py-3 rounded-lg text-sm font-medium animate-[shake_0.3s_ease]">
              {error}
            </div>
          )}

          <button 
            type="submit" 
            className="px-4 py-4 bg-gradient-to-r from-purple-500 to-indigo-600 text-white rounded-xl font-bold transition-all duration-300 shadow-lg shadow-purple-500/40 hover:-translate-y-0.5 hover:shadow-xl hover:shadow-purple-500/50 disabled:opacity-60 disabled:cursor-not-allowed disabled:transform-none mt-2"
            disabled={loading}
          >
            {loading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>

        <div className="mt-6 text-center text-slate-400 text-sm">
          <p>
            Don't have an account?{' '}
            <button 
              className="text-purple-400 font-semibold hover:text-indigo-400 hover:underline transition-colors"
              onClick={onSwitchToRegister}
            >
              Sign up Now
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}

export default Login;
