import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from "../../context/AuthContext"; // यदि आप AuthContext का उपयोग कर रहे हैं
import { useNavigate } from 'react-router-dom';
import dayjs from 'dayjs';

function LeaveApproval() {
  const [leaveRequests, setLeaveRequests] = useState([]);
  const [error, setError] = useState(null);
  const { token, user } = useAuth(); // यदि आप AuthContext का उपयोग कर रहे हैं
  const navigate = useNavigate();

  useEffect(() => {
    // यदि उपयोगकर्ता लॉग इन नहीं है या एडमिन नहीं है, तो डैशबोर्ड पर रीडायरेक्ट करें
    if (!user || user.role !== 'admin') {
      navigate('/login'); // या कोई अन्य उपयुक्त पृष्ठ
    }
  }, [user, navigate]);

  const fetchLeaveRequests = async () => {
    try {
      const response = await axios.get('/api/v1/leaves/pending', { // Backend API एंडपॉइंट (आपको इसे परिभाषित करना होगा)
        headers: {
          Authorization: `Bearer ${token}`, // यदि आप AuthContext का उपयोग कर रहे हैं
        },
      });
      setLeaveRequests(response.data.data.leaves); // Adjust based on your API response structure
    } catch (err) {
      setError(err.response?.data?.message || 'Could not fetch leave requests.');
    }
  };

  useEffect(() => {
    fetchLeaveRequests();
  }, [token]);

  const handleApproveLeave = async (leaveId) => {
    try {
      await axios.patch(
        `/api/v1/leaves/${leaveId}`, // Backend API एंडपॉइंट (आपको इसे परिभाषित करना होगा)
        { status: 'approved' },
        {
          headers: {
            Authorization: `Bearer ${token}`, // यदि आप AuthContext का उपयोग कर रहे हैं
          },
        }
      );
      console.log('Leave request approved:', leaveId);
      // छुट्टी सूची को अपडेट करें
      fetchLeaveRequests();
    } catch (err) {
      setError(err.response?.data?.message || 'Could not approve leave request.');
    }
  };

  const handleRejectLeave = async (leaveId) => {
    try {
      await axios.patch(
        `/api/v1/leaves/${leaveId}`, // Backend API एंडपॉइंट (आपको इसे परिभाषित करना होगा)
        { status: 'rejected' },
        {
          headers: {
            Authorization: `Bearer ${token}`, // यदि आप AuthContext का उपयोग कर रहे हैं
          },
        }
      );
      console.log('Leave request rejected:', leaveId);
      // छुट्टी सूची को अपडेट करें
      fetchLeaveRequests();
    } catch (err) {
      setError(err.response?.data?.message || 'Could not reject leave request.');
    }
  };

  return (
    <div>
      <h2>Leave Approval</h2>
      {error && <p className="error">{error}</p>}
      {leaveRequests.length === 0 ? (
        <p>No pending leave requests.</p>
      ) : (
        <table>
          <thead>
            <tr>
              <th>User</th>
              <th>Leave Type</th>
              <th>Start Date</th>
              <th>End Date</th>
              <th>Reason</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {leaveRequests.map((request) => (
              <tr key={request._id}>
                <td>{request.user.fullName.first} {request.user.fullName.last}</td>
                <td>{request.leaveType}</td>
                <td>{dayjs(request.startDate).format('YYYY-MM-DD')}</td>
                <td>{dayjs(request.endDate).format('YYYY-MM-DD')}</td>
                <td>{request.reason}</td>
                <td>
                  <button onClick={() => handleApproveLeave(request._id)}>Approve</button>
                  <button onClick={() => handleRejectLeave(request._id)}>Reject</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}

export default LeaveApproval;