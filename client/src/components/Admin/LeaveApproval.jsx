import React, { useState, useEffect } from 'react';
import axios from 'axios';
import dayjs from 'dayjs';

const apiUrl = import.meta.env.VITE_API_URL;

function LeaveApproval() {
  const [leaveRequests, setLeaveRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [confirmAction, setConfirmAction] = useState(null);
  const [remarks, setRemarks] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('pending');

  const token = localStorage.getItem('token');

  // Check for stored status on component mount
  useEffect(() => {
    const storedStatus = localStorage.getItem('selectedLeaveStatus');
    if (storedStatus) {
      setFilterStatus(storedStatus);
      localStorage.removeItem('selectedLeaveStatus');
    }

    fetchLeaveRequests();
  }, []);

  // Fetch leave requests when filter status changes
  useEffect(() => {
    fetchLeaveRequests();
  }, [filterStatus]);

  const fetchLeaveRequests = async () => {
    setLoading(true);
    try {
      let endpoint = `${apiUrl}/api/v1/leaves/pending`;

      if (filterStatus === 'all') {
        endpoint = `${apiUrl}/api/v1/leaves/all`;
      } else if (filterStatus === 'approved') {
        endpoint = `${apiUrl}/api/v1/leaves/approved`;
      } else if (filterStatus === 'rejected') {
        endpoint = `${apiUrl}/api/v1/leaves/rejected`;
      }

      console.log('Fetching leaves from endpoint:', endpoint);

      const response = await axios.get(endpoint, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      console.log('Leave response:', response.data);

      setLeaveRequests(response.data.data.leaves || []);
      setError(null);
    } catch (err) {
      console.error('Error fetching leave requests:', err);
      setError(err.response?.data?.message || 'Failed to fetch leave requests');
      setLeaveRequests([]);
    } finally {
      setLoading(false);
    }
  };

  const handleApproveLeave = async (leaveId) => {
    try {
      setLoading(true);
      await axios.patch(
        `${apiUrl}/api/v1/leaves/${leaveId}`,
        {
          status: 'approved',
          remarks: remarks || 'Approved by admin',
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      setConfirmAction(null);
      setRemarks('');

      // After approval, refresh the current view
      fetchLeaveRequests();
    } catch (err) {
      setError(err.response?.data?.message || 'Could not approve leave request');
      setLoading(false);
    }
  };

  const handleRejectLeave = async (leaveId) => {
    try {
      setLoading(true);
      await axios.patch(
        `${apiUrl}/api/v1/leaves/${leaveId}`,
        {
          status: 'rejected',
          remarks: remarks || 'Rejected by admin',
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      setConfirmAction(null);
      setRemarks('');

      // After rejection, refresh the current view
      fetchLeaveRequests();
    } catch (err) {
      setError(err.response?.data?.message || 'Could not reject leave request');
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    return dayjs(dateString).format('MMM DD, YYYY');
  };

  const calculateDays = (startDate, endDate) => {
    const start = dayjs(startDate);
    const end = dayjs(endDate);
    return end.diff(start, 'day') + 1;
  };

  const getLeaveTypeColor = (type) => {
    switch (type) {
      case 'sick':
        return 'bg-red-100 text-red-800';
      case 'full':
        return 'bg-blue-100 text-blue-800';
      case 'half':
        return 'bg-purple-100 text-purple-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusBadgeClass = (status) => {
    switch (status) {
      case 'approved':
        return 'bg-green-100 text-green-800';
      case 'rejected':
        return 'bg-red-100 text-red-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const filteredRequests = leaveRequests.filter((request) => {
    const fullName =
      `${request.user?.fullName?.first || ''} ${request.user?.fullName?.last || ''}`.toLowerCase();
    const email = (request.user?.email || '').toLowerCase();
    const leaveType = (request.leaveType || '').toLowerCase();
    const reason = (request.reason || '').toLowerCase();
    const searchLower = searchTerm.toLowerCase();

    return (
      fullName.includes(searchLower) ||
      email.includes(searchLower) ||
      leaveType.includes(searchLower) ||
      reason.includes(searchLower)
    );
  });

  return (
    <div className="bg-white rounded-lg shadow-lg overflow-hidden">
      <div className="bg-gradient-to-r from-blue-600 to-blue-800 px-6 py-4">
        <h2 className="text-2xl font-bold text-white">Leave Approval Dashboard</h2>
        <p className="text-blue-100">Manage employee leave requests</p>
      </div>

      <div className="p-6">
        {/* Filters and Search */}
        <div className="flex flex-col md:flex-row justify-between mb-6 space-y-4 md:space-y-0">
          <div className="flex space-x-2">
            <button
              onClick={() => setFilterStatus('pending')}
              className={`px-4 py-2 rounded-md text-sm font-medium ${
                filterStatus === 'pending'
                  ? 'bg-yellow-100 text-yellow-800 border border-yellow-300'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Pending
            </button>
            <button
              onClick={() => setFilterStatus('approved')}
              className={`px-4 py-2 rounded-md text-sm font-medium ${
                filterStatus === 'approved'
                  ? 'bg-green-100 text-green-800 border border-green-300'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Approved
            </button>
            <button
              onClick={() => setFilterStatus('rejected')}
              className={`px-4 py-2 rounded-md text-sm font-medium ${
                filterStatus === 'rejected'
                  ? 'bg-red-100 text-red-800 border border-red-300'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Rejected
            </button>
            <button
              onClick={() => setFilterStatus('all')}
              className={`px-4 py-2 rounded-md text-sm font-medium ${
                filterStatus === 'all'
                  ? 'bg-blue-100 text-blue-800 border border-blue-300'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              All
            </button>
          </div>

          <div className="relative">
            <input
              type="text"
              placeholder="Search requests..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full md:w-64 pl-10 pr-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-300 focus:border-transparent"
            />
            <div className="absolute left-3 top-2.5 text-gray-400">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z"
                  clipRule="evenodd"
                />
              </svg>
            </div>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-6 bg-red-50 border-l-4 border-red-500 p-4 rounded-md">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg
                  className="h-5 w-5 text-red-400"
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                    clipRule="evenodd"
                  />
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
                    <svg
                      className="h-4 w-4"
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                    >
                      <path
                        fillRule="evenodd"
                        d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Leave Requests Table */}
        {loading ? (
          <div className="flex justify-center py-8">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
          </div>
        ) : filteredRequests.length === 0 ? (
          <div className="text-center py-8">
            <svg
              className="mx-auto h-12 w-12 text-gray-400"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1}
                d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
              />
            </svg>
            <h3 className="mt-2 text-sm font-medium text-gray-900">No leave requests</h3>
            <p className="mt-1 text-sm text-gray-500">
              {filterStatus === 'pending'
                ? 'There are no pending leave requests to approve.'
                : filterStatus === 'approved'
                  ? 'No approved leave requests found.'
                  : filterStatus === 'rejected'
                    ? 'No rejected leave requests found.'
                    : 'No leave requests found.'}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Employee
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Leave Type
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Duration
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Reason
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Status
                  </th>
                  {filterStatus === 'pending' && (
                    <th
                      scope="col"
                      className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider"
                    >
                      Actions
                    </th>
                  )}
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredRequests.map((request) => (
                  <tr key={request._id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-10 w-10 bg-gray-200 rounded-full flex items-center justify-center">
                          <span className="text-gray-600 font-medium">
                            {request.user?.fullName?.first?.charAt(0) || '?'}
                            {request.user?.fullName?.last?.charAt(0) || '?'}
                          </span>
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">
                            {request.user?.fullName?.first || ''}{' '}
                            {request.user?.fullName?.last || ''}
                          </div>
                          <div className="text-sm text-gray-500">
                            {request.user?.email || 'No email provided'}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getLeaveTypeColor(request.leaveType)}`}
                      >
                        {request.leaveType.charAt(0).toUpperCase() + request.leaveType.slice(1)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {formatDate(request.startDate)} - {formatDate(request.endDate)}
                      </div>
                      <div className="text-xs text-gray-500 mt-1">
                        {calculateDays(request.startDate, request.endDate)} days
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-900 max-w-xs truncate">
                        {request.reason}
                      </div>
                      {request.remarks && (
                        <div className="text-xs text-gray-500 mt-1 italic">
                          Remarks: {request.remarks}
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusBadgeClass(request.status)}`}
                      >
                        {request.status.charAt(0).toUpperCase() + request.status.slice(1)}
                      </span>
                    </td>
                    {filterStatus === 'pending' && (
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        {confirmAction === `approve-${request._id}` ? (
                          <div className="flex flex-col space-y-2">
                            <textarea
                              placeholder="Add remarks (optional)"
                              value={remarks}
                              onChange={(e) => setRemarks(e.target.value)}
                              className="border border-gray-300 rounded-md text-sm p-2 w-full"
                              rows="2"
                            />
                            <div className="flex justify-end space-x-2">
                              <button
                                onClick={() => handleApproveLeave(request._id)}
                                className="text-white bg-green-600 hover:bg-green-700 px-3 py-1 rounded-md text-sm transition duration-200"
                              >
                                Confirm
                              </button>
                              <button
                                onClick={() => {
                                  setConfirmAction(null);
                                  setRemarks('');
                                }}
                                className="text-gray-700 bg-gray-200 hover:bg-gray-300 px-3 py-1 rounded-md text-sm transition duration-200"
                              >
                                Cancel
                              </button>
                            </div>
                          </div>
                        ) : confirmAction === `reject-${request._id}` ? (
                          <div className="flex flex-col space-y-2">
                            <textarea
                              placeholder="Add reason for rejection"
                              value={remarks}
                              onChange={(e) => setRemarks(e.target.value)}
                              className="border border-gray-300 rounded-md text-sm p-2 w-full"
                              rows="2"
                            />
                            <div className="flex justify-end space-x-2">
                              <button
                                onClick={() => handleRejectLeave(request._id)}
                                className="text-white bg-red-600 hover:bg-red-700 px-3 py-1 rounded-md text-sm transition duration-200"
                              >
                                Confirm
                              </button>
                              <button
                                onClick={() => {
                                  setConfirmAction(null);
                                  setRemarks('');
                                }}
                                className="text-gray-700 bg-gray-200 hover:bg-gray-300 px-3 py-1 rounded-md text-sm transition duration-200"
                              >
                                Cancel
                              </button>
                            </div>
                          </div>
                        ) : (
                          <div className="flex justify-end space-x-2">
                            <button
                              onClick={() => setConfirmAction(`approve-${request._id}`)}
                              className="text-green-600 hover:text-green-900 bg-green-100 hover:bg-green-200 px-3 py-1 rounded-md text-sm transition duration-200"
                            >
                              Approve
                            </button>
                            <button
                              onClick={() => setConfirmAction(`reject-${request._id}`)}
                              className="text-red-600 hover:text-red-900 bg-red-100 hover:bg-red-200 px-3 py-1 rounded-md text-sm transition duration-200"
                            >
                              Reject
                            </button>
                          </div>
                        )}
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

export default LeaveApproval;
