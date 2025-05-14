import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../../context/AuthContext'; // यदि आप AuthContext का उपयोग कर रहे हैं
import { useNavigate } from 'react-router-dom';
import dayjs from 'dayjs';

function LeaveRequestStatus() {
  const [leaveRequests, setLeaveRequests] = useState([]);
  const [error, setError] = useState(null);
  const { token, user } = useAuth(); // यदि आप AuthContext का उपयोग कर रहे हैं
  const navigate = useNavigate();

  useEffect(() => {
    // यदि उपयोगकर्ता लॉग इन नहीं है, तो लॉगिन पृष्ठ पर रीडायरेक्ट करें
    if (!user) {
      navigate('/login');
    }
  }, [user, navigate]);

  useEffect(() => {
    const fetchLeaveRequests = async () => {
      try {
        const response = await axios.get('/api/v1/leaves', { // Backend API एंडपॉइंट (आपको इसे परिभाषित करना होगा)
          headers: {
            Authorization: `Bearer ${token}`, // यदि आप AuthContext का उपयोग कर रहे हैं
          },
        });
        setLeaveRequests(response.data.data.leaves); // Adjust based on your API response structure
      } catch (err) {
        setError(err.response?.data?.message || 'Could not fetch leave requests.');
      }
    };

    fetchLeaveRequests();
  }, [token]);

  return (
    <div className="bg-white shadow-lg rounded-lg p-6 max-w-3xl mx-auto">
      <h2 className="text-2xl font-bold text-blue-600 mb-4">Leave Request Status</h2>
      {error && <p className="text-red-500 mb-4">{error}</p>}
      {leaveRequests.length === 0 ? (
        <p className="text-gray-600">No leave requests found.</p>
      ) : (
        <table className="min-w-full bg-white border border-gray-300 rounded-lg">
          <thead>
            <tr className="bg-blue-600 text-white">
              <th className="py-2 px-4 border-b">Leave Type</th>
              <th className="py-2 px-4 border-b">Start Date</th>
              <th className="py-2 px-4 border-b">End Date</th>
              <th className="py-2 px-4 border-b">Reason</th>
              <th className="py-2 px-4 border-b">Status</th>
            </tr>
          </thead>
          <tbody>
            {leaveRequests.map((request) => (
              <tr key={request._id} className="hover:bg-gray-100">
                <td className="py-2 px-4 border-b">{request.leaveType}</td>
                <td className="py-2 px-4 border-b">{dayjs(request.startDate).format('YYYY-MM-DD')}</td>
                <td className="py-2 px-4 border-b">{dayjs(request.endDate).format('YYYY-MM-DD')}</td>
                <td className="py-2 px-4 border-b">{request.reason}</td>
                <td className="py-2 px-4 border-b">{request.status}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}

export default LeaveRequestStatus;