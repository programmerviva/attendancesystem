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
    <div>
      <h2>Sign Up</h2>
      {error && <p style={{ color: 'red' }}>{error}</p>}
      <form onSubmit={handleSubmit}>
        <div>
          <label htmlFor="firstName">First Name:</label>
          <input
            type="text"
            id="firstName"
            value={fullName.first}
            onChange={(e) => setFullName({ ...fullName, first: e.target.value })}
            required
          />
        </div>
        <div>
          <label htmlFor="lastName">Last Name:</label>
          <input
            type="text"
            id="lastName"
            value={fullName.last}
            onChange={(e) => setFullName({ ...fullName, last: e.target.value })}
            required
          />
        </div>
        <div>
          <label htmlFor="email">Email:</label>
          <input
            type="email"
            id="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>
        <div>
          <label htmlFor="password">Password:</label>
          <input
            type="password"
            id="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>
        <div>
          <label htmlFor="role">Role:</label>
          <select id="role" value={role} onChange={(e) => setRole(e.target.value)}>
            <option value="employee">Employee</option>
            <option value="subadmin">Subadmin</option>
          </select>
        </div>
        <button type="submit">Sign Up</button>
      </form>
      <p>Already have an account? <Link to="/login">Log In</Link></p>
    </div>
  );
}

export default SignupPage;