 
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
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-blue-100 flex items-center justify-center p-4">
      <div className="bg-white shadow-lg rounded-2xl p-8 md:p-10 max-w-lg w-full transition-all hover:shadow-2xl">
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center bg-gradient-to-r from-blue-600 to-purple-600 w-16 h-16 rounded-full mb-4 shadow-lg">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          </div>
          <h2 className="text-3xl font-bold text-blue-600">Leave Application</h2>
          <p className="text-gray-600 mt-2">Fill your leave details carefully</p>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-100 border border-red-300 rounded-lg flex items-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-red-600 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 14h4v4h-4zm0-8h4v4h-4z" />
            </svg>
            <span className="text-red-600">{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Leave Type */}
          <div>
            <label className="block text-gray-700 font-semibold mb-2">Leave Type</label>
            <div className="grid grid-cols-3 gap-3">
              {['full', 'half', 'short'].map((type) => (
                <button
                  key={type}
                  type="button"
                  onClick={() => setLeaveType(type)}
                  className={`p-3 rounded-lg border transition-all ${leaveType === type 
                    ? 'border-blue-500 bg-blue-100 shadow-inner' 
                    : 'border-gray-300 hover:border-blue-300'}`}
                >
                  <span className={`font-medium ${leaveType === type ? 'text-blue-600' : 'text-gray-600'}`}>
                    {type.charAt(0).toUpperCase() + type.slice(1)}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Date Fields */}
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <label className="block text-gray-700 font-semibold mb-2">Start Date</label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full px-4 py-3 rounded-lg border-2 border-gray-300 bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all"
              />
            </div>
            <div>
              <label className="block text-gray-700 font-semibold mb-2">End Date</label>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="w-full px-4 py-3 rounded-lg border-2 border-gray-300 bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all"
              />
            </div>
          </div>

          {/* Reason */}
          <div>
            <label className="block text-gray-700 font-semibold mb-2">Reason</label>
            <textarea
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              className="w-full px-4 py-3 rounded-lg border-2 border-gray-300 bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all min-h-[140px]"
              placeholder="Briefly describe your reason..."
            />
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            className="w-full py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold rounded-lg shadow-md hover:shadow-lg transition-all transform hover:scale-105 active:scale-95"
          >
            <span className="inline-flex items-center justify-center gap-2">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-8.707l-3-3a1 1 0 00-1.414 1.414L10.586 9H7a1 1 0 100 2h3.586l-1.293 1.293a1 1 0 101.414 1.414l3-3a1 1 0 000-1.414z" clipRule="evenodd" />
              </svg>
              Submit Application
            </span>
          </button>
        </form>
      </div>
    </div>
  );
}

export default LeaveRequestForm;