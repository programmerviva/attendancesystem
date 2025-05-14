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
    <div className="min-h-screen bg-gradient-to-br from-slate-100 to-blue-50 flex items-center justify-center p-4">
      <div className="bg-white/80 backdrop-blur-lg border border-white/20 shadow-2xl rounded-3xl p-6 md:p-10 max-w-2xl w-full transition-all hover:shadow-3xl">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center bg-gradient-to-r from-indigo-600 to-purple-600 w-16 h-16 rounded-2xl mb-4 shadow-lg">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          </div>
          <h2 className="text-4xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
            Leave Application
          </h2>
          <p className="text-gray-500 mt-2">Fill your leave details carefully</p>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-rose-100/90 border border-rose-300 rounded-xl flex items-center backdrop-blur-sm">
            {/* Error icon and message */}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Leave Type */}
          <div>
            <label className="block text-gray-700/90 font-semibold mb-3 ml-1">Leave Type</label>
            <div className="grid grid-cols-3 gap-3">
              {['full', 'half', 'short'].map((type) => (
                <button
                  key={type}
                  type="button"
                  onClick={() => setLeaveType(type)}
                  className={`p-3 rounded-xl border transition-all ${leaveType === type 
                    ? 'border-indigo-500/80 bg-indigo-50/50 shadow-inner' 
                    : 'border-gray-200 hover:border-indigo-200'}`}
                >
                  <span className={`font-medium ${leaveType === type ? 'text-indigo-600' : 'text-gray-600'}`}>
                    {type.charAt(0).toUpperCase() + type.slice(1)}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Date Fields */}
          <div className="grid md:grid-cols-2 gap-6">
            <div className="relative">
              <label className="block text-gray-700/90 font-semibold mb-3 ml-1">Start Date</label>
              <div className="relative">
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="w-full px-4 py-3.5 rounded-xl border-2 border-gray-200/80 bg-white/90 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200/50 transition-all outline-none placeholder-gray-400"
                />
              </div>
            </div>
            {/* Repeat similar for End Date */}
          </div>

          {/* Reason */}
          <div>
            <label className="block text-gray-700/90 font-semibold mb-3 ml-1">Reason</label>
            <textarea
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              className="w-full px-4 py-3.5 rounded-xl border-2 border-gray-200/80 bg-white/90 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200/50 transition-all outline-none min-h-[140px] placeholder-gray-400"
              placeholder="Briefly describe your reason..."
            />
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            className="w-full py-4 px-6 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all transform hover:scale-[1.01] active:scale-95"
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