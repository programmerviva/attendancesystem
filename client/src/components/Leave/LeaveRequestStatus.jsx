import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext'; // यदि आप AuthContext का उपयोग कर रहे हैं
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
    <div>
      <h2>Leave Request Status</h2>
      {error && <p className="error">{error}</p>}
      {leaveRequests.length === 0 ? (
        <p>No leave requests found.</p>
      ) : (
        <table>
          <thead>
            <tr>
              <th>Leave Type</th>
              <th>Start Date</th>
              <th>End Date</th>
              <th>Reason</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {leaveRequests.map((request) => (
              <tr key={request._id}>
                <td>{request.leaveType}</td>
                <td>{dayjs(request.startDate).format('YYYY-MM-DD')}</td>
                <td>{dayjs(request.endDate).format('YYYY-MM-DD')}</td>
                <td>{request.reason}</td>
                <td>{request.status}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}

export default LeaveRequestStatus;