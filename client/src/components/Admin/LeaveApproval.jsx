import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from "../../context/AuthContext";
import { useNavigate } from 'react-router-dom';
import dayjs from 'dayjs';

function LeaveApproval() {
  const [leaveRequests, setLeaveRequests] = useState([]);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);
  const [confirmAction, setConfirmAction] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const { token, user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!user || user.role !== 'admin') {
      navigate('/login');
    }
  }, [user, navigate]);

  const fetchLeaveRequests = async () => {
    setLoading(true);
    try {
      const response = await axios.get('/api/v1/leaves/pending', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setLeaveRequests(response.data.data.leaves);
      setError(null);
    } catch (err) {
      setError(err.response?.data?.message || 'Could not fetch leave requests.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLeaveRequests();
  }, [token]);

  const handleApproveLeave = async (leaveId) => {
    try {
      setLoading(true);
      await axios.patch(
        `/api/v1/leaves/${leaveId}`,
        { status: 'approved' },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      setConfirmAction(null);
      fetchLeaveRequests();
    } catch (err) {
      setError(err.response?.data?.message || 'Could not approve leave request.');
      setLoading(false);
    }
  };

  const handleRejectLeave = async (leaveId) => {
    try {
      setLoading(true);
      await axios.patch(
        `/api/v1/leaves/${leaveId}`,
        { status: 'rejected' },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      setConfirmAction(null);
      fetchLeaveRequests();
    } catch (err) {
      setError(err.response?.data?.message || 'Could not reject leave request.');
      setLoading(false);
    }
  };

  const filteredRequests = leaveRequests.filter(request => 
    `${request.user.fullName.first} ${request.user.fullName.last}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
    request.leaveType.toLowerCase().includes(searchTerm.toLowerCase()) ||
    request.reason.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getLeaveTypeColor = (type) => {
    switch(type.toLowerCase()) {
      case 'sick':
        return 'bg-red-100 text-red-800';
      case 'vacation':
        return 'bg-blue-100 text-blue-800';
      case 'personal':
        return 'bg-purple-100 text-purple-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="bg-gray-50 min-h-screen p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8 flex flex-col md:flex-row md:items-center md:justify-between">
          <h1 className="text-2xl md:text-3xl font-bold text-gray-800">Leave Approval Dashboard</h1>
          <div className="mt-4 md:mt-0">
            <div className="relative">
              <input
                type="text"
                placeholder="Search requests..."
                className="w-full md:w-64 pl-10 pr-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              <div className="absolute left-3 top-2.5 text-gray-400">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" />
                </svg>
              </div>
            </div>
          </div>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="mb-6 bg-red-50 border-l-4 border-red-500 p-4 rounded-md">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-red-500" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-sm text-red-700">{error}</p>
              </div>
              <div className="ml-auto pl-3">
                <div className="-mx-1.5 -my-1.5">
                  <button
                    onClick={() => setError(null)}
                    className="inline-flex rounded-md p-1.5 text-red-500 hover:bg-red-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                  >
                    <svg className="h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                    </svg>
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Main Content */}
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          {loading ? (
            <div className="flex justify-center items-center p-12">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
            </div>
          ) : filteredRequests.length === 0 ? (
            <div className="flex flex-col items-center justify-center p-12 text-center">
              <svg className="h-16 w-16 text-gray-300 mb-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
              <h3 className="text-lg font-medium text-gray-700">No pending leave requests</h3>
              <p className="text-gray-500 mt-1">All leave requests have been processed.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Employee
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Leave Type
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Duration
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Reason
                    </th>
                    <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredRequests.map((request) => (
                    <tr key={request._id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="flex-shrink-0 h-10 w-10 bg-gray-200 rounded-full flex items-center justify-center">
                            <span className="text-gray-600 font-medium">
                              {request.user.fullName.first.charAt(0)}{request.user.fullName.last.charAt(0)}
                            </span>
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900">
                              {request.user.fullName.first} {request.user.fullName.last}
                            </div>
                            <div className="text-sm text-gray-500">
                              {request.user.email || 'No email provided'}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getLeaveTypeColor(request.leaveType)}`}>
                          {request.leaveType}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          {dayjs(request.startDate).format('MMM D, YYYY')}
                        </div>
                        <div className="text-sm text-gray-500">
                          to {dayjs(request.endDate).format('MMM D, YYYY')}
                        </div>
                        <div className="text-xs text-gray-500 mt-1">
                          {dayjs(request.endDate).diff(dayjs(request.startDate), 'day') + 1} days
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-gray-900 max-w-xs truncate">
                          {request.reason}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        {confirmAction === `approve-${request._id}` ? (
                          <div className="flex justify-end space-x-2">
                            <button
                              onClick={() => handleApproveLeave(request._id)}
                              className="text-white bg-green-600 hover:bg-green-700 px-3 py-1 rounded-md text-sm"
                            >
                              Confirm
                            </button>
                            <button
                              onClick={() => setConfirmAction(null)}
                              className="text-gray-700 bg-gray-200 hover:bg-gray-300 px-3 py-1 rounded-md text-sm"
                            >
                              Cancel
                            </button>
                          </div>
                        ) : confirmAction === `reject-${request._id}` ? (
                          <div className="flex justify-end space-x-2">
                            <button
                              onClick={() => handleRejectLeave(request._id)}
                              className="text-white bg-red-600 hover:bg-red-700 px-3 py-1 rounded-md text-sm"
                            >
                              Confirm
                            </button>
                            <button
                              onClick={() => setConfirmAction(null)}
                              className="text-gray-700 bg-gray-200 hover:bg-gray-300 px-3 py-1 rounded-md text-sm"
                            >
                              Cancel
                            </button>
                          </div>
                        ) : (
                          <div className="flex justify-end space-x-2">
                            <button
                              onClick={() => setConfirmAction(`approve-${request._id}`)}
                              className="text-green-600 hover:text-green-900 bg-green-100 hover:bg-green-200 px-3 py-1 rounded-md text-sm"
                            >
                              Approve
                            </button>
                            <button
                              onClick={() => setConfirmAction(`reject-${request._id}`)}
                              className="text-red-600 hover:text-red-900 bg-red-100 hover:bg-red-200 px-3 py-1 rounded-md text-sm"
                            >
                              Reject
                            </button>
                          </div>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default LeaveApproval;