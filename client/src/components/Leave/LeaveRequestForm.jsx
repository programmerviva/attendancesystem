import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../../context/AuthContext'; // यदि आप AuthContext का उपयोग कर रहे हैं
import { useNavigate } from 'react-router-dom';
import dayjs from 'dayjs';

function LeaveRequestForm() {
  const [leaveType, setLeaveType] = useState('full'); // 'full', 'half', 'short'
  const [startDate, setStartDate] = useState(dayjs().format('YYYY-MM-DD'));
  const [endDate, setEndDate] = useState(dayjs().format('YYYY-MM-DD'));
  const [reason, setReason] = useState('');
  const [error, setError] = useState(null);
  const { token, user } = useAuth(); // यदि आप AuthContext का उपयोग कर रहे हैं
  const navigate = useNavigate();

  useEffect(() => {
    // यदि उपयोगकर्ता लॉग इन नहीं है, तो लॉगिन पृष्ठ पर रीडायरेक्ट करें
    if (!user) {
      navigate('/login');
    }
  }, [user, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const response = await axios.post(
        '/api/v1/leaves', // Backend API एंडपॉइंट (आपको इसे परिभाषित करना होगा)
        {
          leaveType,
          startDate,
          endDate,
          reason,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`, // यदि आप AuthContext का उपयोग कर रहे हैं
          },
        }
      );

      console.log('Leave request submitted:', response.data);
      // सफलता संदेश दिखाएँ और फ़ॉर्म रीसेट करें
      setLeaveType('full');
      setStartDate(dayjs().format('YYYY-MM-DD'));
      setEndDate(dayjs().format('YYYY-MM-DD'));
      setReason('');
      setError(null);
      alert('Leave request submitted successfully!');
    } catch (err) {
      setError(err.response?.data?.message || 'Could not submit leave request.');
    }
  };

  return (
    <div className="bg-white shadow-lg rounded-lg p-6 max-w-md mx-auto">
      <h2 className="text-2xl font-bold text-blue-600 mb-4">Request Leave</h2>
      {error && <p className="text-red-500 mb-4">{error}</p>}
      <form onSubmit={handleSubmit}>
        <div className="mb-4">
          <label htmlFor="leaveType" className="block text-gray-700">Leave Type:</label>
          <select
            id="leaveType"
            value={leaveType}
            onChange={(e) => setLeaveType(e.target.value)}
            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="full">Full Day</option>
            <option value="half">Half Day</option>
            <option value="short">Short Leave</option>
          </select>
        </div>
        <div className="mb-4">
          <label htmlFor="startDate" className="block text-gray-700">Start Date:</label>
          <input
            type="date"
            id="startDate"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
          />
        </div>
        <div className="mb-4">
          <label htmlFor="endDate" className="block text-gray-700">End Date:</label>
          <input
            type="date"
            id="endDate"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
          />
        </div>
        <div className="mb-4">
          <label htmlFor="reason" className="block text-gray-700">Reason:</label>
          <textarea
            id="reason"
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
            rows="4"
          />
        </div>
        <button
          type="submit"
          className="w-full bg-blue-600 text-white font-bold py-2 rounded-md hover:bg-blue-700 transition duration-200"
        >
          Submit Request
        </button>
      </form>
    </div>
  );
}

export default LeaveRequestForm;