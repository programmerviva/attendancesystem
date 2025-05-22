import React, { useState, useEffect } from 'react';
import axios from 'axios';
import config from '../config';

export default function MyProfile({ user, onClose, onProfileUpdated }) {
  const [form, setForm] = useState({
    mobile: '',
    department: '',
    designation: '',
    address: '',
    city: '',
    state: '',
    country: '',
    postalCode: '',
    joiningDate: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  useEffect(() => {
    if (user) {
      // Convert date from YYYY-MM-DD to DD-MM-YYYY if exists
      let formattedDate = '';
      if (user.joiningDate) {
        const date = new Date(user.joiningDate);
        const day = date.getDate().toString().padStart(2, '0');
        const month = (date.getMonth() + 1).toString().padStart(2, '0');
        const year = date.getFullYear();
        formattedDate = `${day}-${month}-${year}`;
      }

      setForm({
        mobile: user.mobile || '',
        department: user.department || '',
        designation: user.designation || '',
        address: user.address || '',
        city: user.city || '',
        state: user.state || '',
        country: user.country || '',
        postalCode: user.postalCode || '',
        joiningDate: formattedDate,
      });
    }
  }, [user]);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    // Clear any previous error/success messages when user makes changes
    setError(null);
    setSuccess(null);
  };
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const token = localStorage.getItem('token');
      
      // Convert date from DD-MM-YYYY to YYYY-MM-DD
      let formattedDate = undefined;
      if (form.joiningDate) {
        const [day, month, year] = form.joiningDate.split('-');
        if (day && month && year) {
          formattedDate = `${year}-${month}-${day}`;
        }
      }

      const cleanForm = {
        ...form,
        joiningDate: formattedDate
      };

      const res = await axios.patch(
        `${config.API_URL}/api/v1/employee/profile`,
        cleanForm,
        { 
          headers: { 
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );

      setSuccess('Profile updated successfully!');
      if (onProfileUpdated) {
        onProfileUpdated(res.data.data.employee);
      }
    } catch (err) {
      // Show the exact error message from the server if available
      const serverMsg = err.response?.data?.message || err.message || 'Update failed. Please try again.';
      setError(serverMsg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
      <div className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-lg relative border border-gray-200">
        <button onClick={onClose} className="absolute top-3 right-3 text-gray-400 hover:text-gray-700 text-2xl font-bold">&times;</button>
        <h2 className="text-2xl font-bold mb-6 text-center text-blue-700 tracking-wide">Edit My Profile</h2>
        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1">Mobile</label>
            <input type="text" name="mobile" value={form.mobile} onChange={handleChange} className="w-full rounded-lg border border-gray-300 px-4 py-2 text-gray-700 focus:ring-2 focus:ring-blue-400 focus:outline-none" />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1">Department</label>
              <input type="text" name="department" value={form.department} onChange={handleChange} className="w-full rounded-lg border border-gray-300 px-4 py-2 text-gray-700 focus:ring-2 focus:ring-blue-400 focus:outline-none" />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1">Designation</label>
              <input type="text" name="designation" value={form.designation} onChange={handleChange} className="w-full rounded-lg border border-gray-300 px-4 py-2 text-gray-700 focus:ring-2 focus:ring-blue-400 focus:outline-none" />
            </div>
          </div>          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1">Joining Date (DD-MM-YYYY)</label>
            <input 
              type="text" 
              name="joiningDate" 
              value={form.joiningDate} 
              onChange={handleChange}
              placeholder="15-04-2025"
              className="w-full rounded-lg border border-gray-300 px-4 py-2 text-gray-700 focus:ring-2 focus:ring-blue-400 focus:outline-none" 
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1">Address</label>
            <input type="text" name="address" value={form.address} onChange={handleChange} className="w-full rounded-lg border border-gray-300 px-4 py-2 text-gray-700 focus:ring-2 focus:ring-blue-400 focus:outline-none" />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1">City</label>
              <input type="text" name="city" value={form.city} onChange={handleChange} className="w-full rounded-lg border border-gray-300 px-4 py-2 text-gray-700 focus:ring-2 focus:ring-blue-400 focus:outline-none" />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1">State</label>
              <input type="text" name="state" value={form.state} onChange={handleChange} className="w-full rounded-lg border border-gray-300 px-4 py-2 text-gray-700 focus:ring-2 focus:ring-blue-400 focus:outline-none" />
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1">Country</label>
              <input type="text" name="country" value={form.country} onChange={handleChange} className="w-full rounded-lg border border-gray-300 px-4 py-2 text-gray-700 focus:ring-2 focus:ring-blue-400 focus:outline-none" />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1">Postal Code</label>
              <input type="text" name="postalCode" value={form.postalCode} onChange={handleChange} className="w-full rounded-lg border border-gray-300 px-4 py-2 text-gray-700 focus:ring-2 focus:ring-blue-400 focus:outline-none" />
            </div>
          </div>
          {error && <div className="text-red-600 text-sm text-center font-medium">{error}</div>}
          {success && <div className="text-green-600 text-sm text-center font-medium">{success}</div>}
          <button type="submit" className="w-full bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-700 hover:to-blue-600 text-white py-3 rounded-xl font-bold text-lg shadow-md transition-all duration-200 disabled:opacity-60 disabled:cursor-not-allowed" disabled={loading}>
            {loading ? 'Updating...' : 'Update Profile'}
          </button>
        </form>
      </div>
    </div>
  );
}
