import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom';
import dayjs from 'dayjs';

// Fallback API URL if environment variable is not set
const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000';

function OutdoorDutyApproval() {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [statusFilter, setStatusFilter] = useState('');
  const [remarks, setRemarks] = useState({});
  const navigate = useNavigate();

  // Get token from localStorage
  const token = localStorage.getItem('token');
  const user = localStorage.getItem('user') ? JSON.parse(localStorage.getItem('user')) : null;

  // Function to manually refresh data
  const refreshData = () => {
    console.log('Manual refresh triggered with status filter:', statusFilter);
    fetchRequests().catch(err => {
      console.error("Failed to fetch requests:", err);
      setError("Failed to load requests. Please try again.");
      setLoading(false);
    });
  };

  useEffect(() => {
    if (!token || !user) {
      navigate('/login');
      return;
    }

    console.log('Status filter changed to:', statusFilter);

    // Add a small delay to prevent rapid API calls when changing filters
    const fetchTimer = setTimeout(() => {
      try {
        fetchRequests().catch(err => {
          console.error("Failed to fetch requests:", err);
          setError("Failed to load requests. Please try again.");
          setLoading(false);
        });
      } catch (err) {
        console.error("Error in useEffect:", err);
        setError("An unexpected error occurred.");
        setLoading(false);
      }
    }, 300);
    
    return () => clearTimeout(fetchTimer);
  }, [token, user, navigate, statusFilter]);

  const fetchRequests = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Get requests for the past 60 days and next 30 days
      const startDate = dayjs().subtract(60, 'days').format('YYYY-MM-DD');
      const endDate = dayjs().add(30, 'days').format('YYYY-MM-DD');
      
      // Default empty array for requests
      let safeRequests = [];
      
      try {
        // Build URL based on status filter
        let url = `${apiUrl}/api/v1/outdoor-duty/all?startDate=${startDate}&endDate=${endDate}`;
        
        // Only add status parameter if it's not empty
        if (statusFilter) {
          url += `&status=${statusFilter}`;
        }
        
        console.log('Fetching outdoor duty requests with URL:', url);
        
        const response = await axios.get(
          url,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        
        // Log the response for debugging
        console.log('API Response:', response.data);
        
        // Safely handle the response
        if (response && response.data && response.data.data) {
          // Handle both array and object response formats
          const outdoorDutyRequests = response.data.data.outdoorDutyRequests || [];
          
          if (Array.isArray(outdoorDutyRequests)) {
            safeRequests = outdoorDutyRequests.map(request => {
              if (!request) return null;
              
              // Create a safe copy with default values
              return {
                _id: request._id || '',
                user: {
                  fullName: request.user?.fullName || 'Unknown',
                  email: request.user?.email || '',
                  department: request.user?.department || '',
                  designation: request.user?.designation || ''
                },
                date: request.date || '',
                reason: request.reason || '',
                status: request.status || 'pending',
                remarks: request.remarks || '',
                approvedBy: request.approvedBy || null,
                approvedAt: request.approvedAt || null,
                createdAt: request.createdAt || '',
                updatedAt: request.updatedAt || ''
              };
            }).filter(Boolean); // Remove any null items
            
            console.log('Processed requests:', safeRequests.length);
          } else {
            console.error('outdoorDutyRequests is not an array:', outdoorDutyRequests);
          }
        } else {
          console.error('Invalid response structure:', response);
        }
      } catch (fetchError) {
        console.error('Error in axios request:', fetchError);
        throw new Error('Failed to fetch data from server');
      }
      
      setRequests(safeRequests);
    } catch (err) {
      console.error('Error fetching outdoor duty requests:', err);
      setError('Failed to load outdoor duty requests');
      setRequests([]);
    } finally {
      setLoading(false);
    }
  };

  const handleRemarkChange = (requestId, value) => {
    setRemarks({
      ...remarks,
      [requestId]: value,
    });
  };

  const handleStatusUpdate = async (requestId, status) => {
    try {
      setError(null);
      await axios.patch(
        `${apiUrl}/api/v1/outdoor-duty/${requestId}`,
        {
          status,
          remarks: remarks[requestId] || '',
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      // Refresh the requests list
      fetchRequests();
    } catch (err) {
      console.error('Error updating outdoor duty request:', err);
      setError(err.response?.data?.message || 'Could not update request');
    }
  };

  const getStatusBadgeClass = (status) => {
    switch (status) {
      case 'approved':
        return 'bg-green-100 text-green-800';
      case 'rejected':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-yellow-100 text-yellow-800';
    }
  };

  if (!user || (user.role !== 'admin' && user.role !== 'subadmin')) {
    return (
      <div className="max-w-7xl mx-auto p-6 text-center">
        <div className="bg-red-50 p-4 rounded-md mb-4">
          <p className="text-red-700">You don't have permission to access this page.</p>
        </div>
        <Link to="/" className="text-blue-600 hover:text-blue-800">
          Return to Home
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto p-6">
      <div className="bg-white shadow-xl rounded-lg overflow-hidden">
        <div className="bg-gradient-to-r from-blue-600 to-blue-800 px-6 py-4">
          <h2 className="text-2xl font-bold text-white">Outdoor Duty Approval</h2>
          <p className="text-blue-100">Manage employee outdoor duty requests</p>
        </div>

        <div className="p-6">
          {/* Navigation */}
          <div className="mb-6">
            <Link to="/admin/dashboard" className="text-blue-600 hover:text-blue-800">
              &larr; Back to Dashboard
            </Link>
          </div>

          {/* Status filter */}
          <div className="mb-6">
            <label htmlFor="statusFilter" className="block text-sm font-medium text-gray-700 mb-2">
              Filter by Status
            </label>
            <div className="flex items-center space-x-2">
              <select
                id="statusFilter"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
              >
                <option value="pending">Pending</option>
                <option value="approved">Approved</option>
                <option value="rejected">Rejected</option>
                <option value="">All</option>
              </select>
              
              <button 
                onClick={refreshData}
                className="mt-1 px-3 py-2 bg-blue-100 text-blue-700 rounded-md hover:bg-blue-200 flex items-center"
                title="Refresh data"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
              </button>
              
              {loading && (
                <div className="mt-1">
                  <svg className="animate-spin h-5 w-5 text-blue-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                </div>
              )}
            </div>
          </div>

          {/* Error message */}
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
              </div>
            </div>
          )}

          {/* Status info */}
          <div className="mb-4 px-2 py-1 bg-blue-50 rounded-md">
            <p className="text-sm text-blue-700">
              {statusFilter === '' ? 'Showing all requests' : 
               `Showing ${statusFilter} requests`} from the past 60 days and upcoming 30 days
            </p>
          </div>
          
          {/* Requests table */}
          {loading && requests.length === 0 ? (
            <div className="flex justify-center items-center py-10">
              <svg
                className="animate-spin h-10 w-10 text-blue-600"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                ></circle>
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                ></path>
              </svg>
            </div>
          ) : requests.length > 0 ? (
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
                      Date
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
                    <th
                      scope="col"
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                    >
                      Remarks
                    </th>
                    <th
                      scope="col"
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                    >
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {requests.map((request) => (
                    <tr key={request._id}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">
                          {request.user?.fullName || 'Unknown'}
                        </div>
                        <div className="text-sm text-gray-500">{request.user?.email || 'No email'}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {request.date ? dayjs(request.date).format('DD MMM YYYY') : 'N/A'}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-500 max-w-xs truncate">
                        {request.reason || 'No reason provided'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusBadgeClass(
                            request.status || 'pending'
                          )}`}
                        >
                          {(request.status || 'pending').charAt(0).toUpperCase() + (request.status || 'pending').slice(1)}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        {request.status === 'pending' ? (
                          <input
                            type="text"
                            value={remarks[request._id] || ''}
                            onChange={(e) => handleRemarkChange(request._id, e.target.value)}
                            placeholder="Add remarks"
                            className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                          />
                        ) : (
                          <span className="text-sm text-gray-500">{request.remarks || '-'}</span>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        {request.status === 'pending' && (
                          <div className="flex space-x-2">
                            <button
                              onClick={() => handleStatusUpdate(request._id, 'approved')}
                              className="text-green-600 hover:text-green-900 bg-green-100 hover:bg-green-200 px-3 py-1 rounded-md"
                            >
                              Approve
                            </button>
                            <button
                              onClick={() => handleStatusUpdate(request._id, 'rejected')}
                              className="text-red-600 hover:text-red-900 bg-red-100 hover:bg-red-200 px-3 py-1 rounded-md"
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
          ) : (
            <div className="text-center py-10">
              <p className="text-gray-500">
                {statusFilter ? 
                  `No ${statusFilter} outdoor duty requests found.` : 
                  'No outdoor duty requests found.'}
              </p>
              {statusFilter && (
                <button 
                  onClick={() => setStatusFilter('')}
                  className="mt-4 px-4 py-2 bg-blue-100 text-blue-700 rounded-md hover:bg-blue-200"
                >
                  Show All Requests
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default OutdoorDutyApproval;