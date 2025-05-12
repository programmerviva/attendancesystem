import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext'; // यदि आप AuthContext का उपयोग कर रहे हैं
import { useNavigate } from 'react-router-dom';

function UserManagement() {
  const [users, setUsers] = useState([]);
  const [error, setError] = useState(null);
  const { token, user } = useAuth(); // यदि आप AuthContext का उपयोग कर रहे हैं
  const navigate = useNavigate();
  const [isCreatingUser, setIsCreatingUser] = useState(false);
  const [newUserData, setNewUserData] = useState({
    fullName: { first: '', last: '' },
    email: '',
    mobile: '',
    department: 'IT',
    designation: '',
    role: 'employee',
    password: '',
  });

  useEffect(() => {
    // यदि उपयोगकर्ता लॉग इन नहीं है या एडमिन नहीं है, तो डैशबोर्ड पर रीडायरेक्ट करें
    if (!user || user.role !== 'admin') {
      navigate('/login'); // या कोई अन्य उपयुक्त पृष्ठ
    }
  }, [user, navigate]);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const response = await axios.get('/api/v1/users', { // Backend API एंडपॉइंट (आपको इसे परिभाषित करना होगा)
          headers: {
            Authorization: `Bearer ${token}`, // यदि आप AuthContext का उपयोग कर रहे हैं
          },
        });
        setUsers(response.data.data.users); // Adjust based on your API response structure
      } catch (err) {
        setError(err.response?.data?.message || 'Could not fetch users.');
      }
    };

    fetchUsers();
  }, [token]);

  const handleCreateUser = async () => {
    try {
      const response = await axios.post(
        '/api/v1/auth/signup', // Backend API एंडपॉइंट (आपको इसे परिभाषित करना होगा)
        newUserData,
        {
          headers: {
            Authorization: `Bearer ${token}`, // यदि आप AuthContext का उपयोग कर रहे हैं
          },
        }
      );
      console.log('User created:', response.data);
      // उपयोगकर्ता सूची को अपडेट करें
      fetchUsers();
      setIsCreatingUser(false);
      setNewUserData({
        fullName: { first: '', last: '' },
        email: '',
        mobile: '',
        department: 'IT',
        designation: '',
        role: 'employee',
        password: '',
      });
      alert('User created successfully!');
    } catch (err) {
      setError(err.response?.data?.message || 'Could not create user.');
    }
  };

  const handleDeleteUser = async (userId) => {
    try {
      await axios.delete(`/api/v1/users/${userId}`, { // Backend API एंडपॉइंट (आपको इसे परिभाषित करना होगा)
        headers: {
          Authorization: `Bearer ${token}`, // यदि आप AuthContext का उपयोग कर रहे हैं
        },
      });
      console.log('User deleted:', userId);
      // उपयोगकर्ता सूची को अपडेट करें
      fetchUsers();
      alert('User deleted successfully!');
    } catch (err) {
      setError(err.response?.data?.message || 'Could not delete user.');
    }
  };

  return (
    <div>
      <h2>User Management</h2>
      {error && <p className="error">{error}</p>}

      {/* उपयोगकर्ता सूची */}
      {users.length === 0 ? (
        <p>No users found.</p>
      ) : (
        <table>
          <thead>
            <tr>
              <th>Full Name</th>
              <th>Email</th>
              <th>Mobile</th>
              <th>Department</th>
              <th>Designation</th>
              <th>Role</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {users.map((user) => (
              <tr key={user._id}>
                <td>{user.fullName.first} {user.fullName.last}</td>
                <td>{user.email}</td>
                <td>{user.mobile}</td>
                <td>{user.department}</td>
                <td>{user.designation}</td>
                <td>{user.role}</td>
                <td>
                  <button onClick={() => handleDeleteUser(user._id)}>Delete</button>
                  {/* Edit बटन यहाँ जोड़ें */}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      {/* नया उपयोगकर्ता बनाने का फ़ॉर्म */}
      {isCreatingUser ? (
        <div>
          <h3>Create New User</h3>
          <form onSubmit={(e) => {
            e.preventDefault();
            handleCreateUser();
          }}>
            <div>
              <label htmlFor="firstName">First Name:</label>
              <input
                type="text"
                id="firstName"
                value={newUserData.fullName.first}
                onChange={(e) => setNewUserData({ ...newUserData, fullName: { ...newUserData.fullName, first: e.target.value } })}
              />
            </div>
            <div>
              <label htmlFor="lastName">Last Name:</label>
              <input
                type="text"
                id="lastName"
                value={newUserData.fullName.last}
                onChange={(e) => setNewUserData({ ...newUserData, fullName: { ...newUserData.fullName, last: e.target.value } })}
              />
            </div>
            <div>
              <label htmlFor="email">Email:</label>
              <input
                type="email"
                id="email"
                value={newUserData.email}
                onChange={(e) => setNewUserData({ ...newUserData, email: e.target.value })}
              />
            </div>
            <div>
              <label htmlFor="mobile">Mobile:</label>
              <input
                type="text"
                id="mobile"
                value={newUserData.mobile}
                onChange={(e) => setNewUserData({ ...newUserData, mobile: e.target.value })}
              />
            </div>
            <div>
              <label htmlFor="department">Department:</label>
              <select
                id="department"
                value={newUserData.department}
                onChange={(e) => setNewUserData({ ...newUserData, department: e.target.value })}
              >
                <option value="IT">IT</option>
                <option value="HR">HR</option>
                <option value="Finance">Finance</option>
                {/* अन्य विभाग विकल्प जोड़ें */}
              </select>
            </div>
            <div>
              <label htmlFor="designation">Designation:</label>
              <input
                type="text"
                id="designation"
                value={newUserData.designation}
                onChange={(e) => setNewUserData({ ...newUserData, designation: e.target.value })}
              />
            </div>
            <div>
              <label htmlFor="role">Role:</label>
              <select
                id="role"
                value={newUserData.role}
                onChange={(e) => setNewUserData({ ...newUserData, role: e.target.value })}
              >
                <option value="employee">Employee</option>
                <option value="subadmin">Subadmin</option>
              </select>
            </div>
            <div>
              <label htmlFor="password">Password:</label>
              <input
                type="password"
                id="password"
                value={newUserData.password}
                onChange={(e) => setNewUserData({ ...newUserData, password: e.target.value })}
              />
            </div>
            <button type="submit">Create User</button>
            <button type="button" onClick={() => setIsCreatingUser(false)}>Cancel</button>
          </form>
        </div>
      ) : (
        <button onClick={() => setIsCreatingUser(true)}>Create New User</button>
      )}
    </div>
  );
}

export default UserManagement;