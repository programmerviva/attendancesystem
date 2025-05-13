import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

function LoginPage() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const navigate = useNavigate();
    const { login } = useAuth();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        try {
            const response = await axios.post('http://localhost:5000/api/v1/auth/login', { email, password });
            const token = response.data.token;
            login(token);
            navigate('/attendance');
        } catch (err) {
            setError(err.response?.data?.message || 'Login failed. Please check your credentials.');
            console.error('Login error:', err);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#0f172a] via-[#1e293b] to-[#0f172a] px-4 py-12">
            <div className="relative z-10 w-full max-w-md p-8 rounded-2xl bg-white/10 backdrop-blur-lg shadow-xl border border-white/20 text-white animate-fadeIn">
                <h2 className="text-4xl font-extrabold text-center mb-2">Welcome Back</h2>
                <p className="text-center text-white/70 mb-6">Log in to continue</p>

                {error && (
                    <div className="bg-red-500/20 text-red-300 text-sm text-center py-2 px-4 rounded mb-4">
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-5">
                    <div>
                        <label htmlFor="email" className="block text-sm mb-1">Email address</label>
                        <input
                            type="email"
                            id="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                            className="w-full px-4 py-2 rounded-lg bg-white/20 text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-cyan-400"
                            placeholder="Enter your email"
                        />
                    </div>
                    <div>
                        <label htmlFor="password" className="block text-sm mb-1">Password</label>
                        <input
                            type="password"
                            id="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                            className="w-full px-4 py-2 rounded-lg bg-white/20 text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-cyan-400"
                            placeholder="Enter your password"
                        />
                    </div>
                    <button
                        type="submit"
                        className="w-full py-2 bg-cyan-500 hover:bg-cyan-600 transition rounded-lg font-semibold"
                    >
                        Log In
                    </button>
                </form>

                <p className="text-sm mt-6 text-center text-white/70">
                     
                    <Link to="/forget" className="text-cyan-300 hover:underline">Forget password</Link>
                </p>
            </div>
        </div>
    );
}

export default LoginPage;
