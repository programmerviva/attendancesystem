import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom';

function SignupPage() {
  const [fullName, setFullName] = useState({ first: '', last: '' });
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('employee'); // Default role
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(''); // Clear any previous errors

    try {
      const response = await axios.post('/api/v1/auth/signup', {
        fullName,
        email,
        password,
        role,
      });

      console.log('Signup successful:', response.data);
      alert('Signup successful! You can now log in.');
      navigate('/login'); // Redirect to login page after signup
    } catch (err) {
      setError(err.response?.data?.message || 'Signup failed. Please try again.');
      console.error('Signup error:', err);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-blue-100 flex items-center justify-center p-4">
      <div className="bg-white shadow-lg rounded-2xl p-8 md:p-10 max-w-md w-full transition-all hover:shadow-2xl">
        <h2 className="text-3xl font-bold text-blue-600 text-center mb-6">Sign Up</h2>
        {error && <p className="text-red-500 mb-4 text-center">{error}</p>}
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="firstName" className="block text-gray-700 font-semibold mb-2">First Name:</label>
            <input
              type="text"
              id="firstName"
              value={fullName.first}
              onChange={(e) => setFullName({ ...fullName, first: e.target.value })}
              required
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label htmlFor="lastName" className="block text-gray-700 font-semibold mb-2">Last Name:</label>
            <input
              type="text"
              id="lastName"
              value={fullName.last}
              onChange={(e) => setFullName({ ...fullName, last: e.target.value })}
              required
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label htmlFor="email" className="block text-gray-700 font-semibold mb-2">Email:</label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label htmlFor="password" className="block text-gray-700 font-semibold mb-2">Password:</label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label htmlFor="role" className="block text-gray-700 font-semibold mb-2">Role:</label>
            <select
              id="role"
              value={role}
              onChange={(e) => setRole(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="employee">Employee</option>
              <option value="subadmin">Subadmin</option>
            </select>
          </div>
          <button
            type="submit"
            className="w-full py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold rounded-lg shadow-md hover:shadow-lg transition-all transform hover:scale-105 active:scale-95"
          >
            Sign Up
          </button>
        </form>
        <p className="text-center mt-4">
          Already have an account? <Link to="/login" className="text-blue-600 font-semibold">Log In</Link>
        </p>
      </div>
    </div>
  );
}

export default SignupPage;