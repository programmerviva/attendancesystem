/* eslint-disable no-unused-vars */
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import dayjs from 'dayjs';
import { useNavigate } from 'react-router-dom';

const apiUrl = import.meta.env.VITE_API_URL;
function Dashboard() {
  const [stats, setStats] = useState({
    totalEmployees: 0,
    presentToday: 0,
    pendingLeaves: 0,
    departments: 0,
  });
  const [recentActivity, setRecentActivity] = useState([]);
  const [leaveRequests, setLeaveRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [refreshInterval, setRefreshInterval] = useState(null);
  const navigate = useNavigate();

  const token = localStorage.getItem('token');

  // Set up auto-refresh every 30 seconds
  useEffect(() => {
    fetchDashboardData();

    // Set up interval for auto-refresh
    const interval = setInterval(() => {
      fetchActivityData();
    }, 30000); // 30 seconds

    setRefreshInterval(interval);

    // Clean up interval on component unmount
    return () => {
      if (refreshInterval) {
        clearInterval(refreshInterval);
      }
    };
  }, []);

  const fetchActivityData = async () => {
    try {
      // Fetch real activity data
      const activityRes = await axios.get(`${apiUrl}/api/v1/activity/recent`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      setRecentActivity(activityRes.data?.data?.activities || []);
    } catch (err) {
      console.error('Error fetching activity data:', err);
    }
  };

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      // Fetch employee count
      const employeesRes = await axios.get(`${apiUrl}/api/v1/users/count`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      // Fetch pending leaves
      const leavesRes = await axios.get(`${apiUrl}/api/v1/leaves/pending`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      // Fetch today's attendance
      const today = dayjs().format('YYYY-MM-DD');
      const attendanceRes = await axios
        .get(`${apiUrl}/api/v1/attendance/summary?date=${today}`, {
          headers: { Authorization: `Bearer ${token}` },
        })
        .catch(() => ({ data: { data: { present: 0 } } })); // Fallback if endpoint doesn't exist

      // Get unique departments count
      const usersRes = await axios.get(`${apiUrl}/api/v1/users`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      const users = usersRes.data?.data?.users || [];
      const uniqueDepartments = new Set(users.map((user) => user.department));

      // Set stats
      setStats({
        totalEmployees: employeesRes.data?.count || 0,
        presentToday: attendanceRes.data?.data?.present || 0,
        pendingLeaves: leavesRes.data?.results || 0,
        departments: uniqueDepartments.size || 0,
      });

      // Set leave requests
      setLeaveRequests(leavesRes.data?.data?.leaves || []);

      // Fetch activity data
      await fetchActivityData();

      setError(null);
    } catch (err) {
      console.error('Error fetching dashboard data:', err);
      setError('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    return dayjs(dateString).format('MMM DD, YYYY');
  };

  const handleApproveLeave = async (leaveId) => {
    try {
      await axios.patch(
        `${apiUrl}/api/v1/leaves/${leaveId}`,
        {
          status: 'approved',
          remarks: 'Approved from dashboard',
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      // Refresh data
      fetchDashboardData();
    } catch (err) {
      console.error('Error approving leave:', err);
      setError('Failed to approve leave request');
    }
  };

  const handleRejectLeave = async (leaveId) => {
    try {
      await axios.patch(
        `${apiUrl}/api/v1/leaves/${leaveId}`,
        {
          status: 'rejected',
          remarks: 'Rejected from dashboard',
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      // Refresh data
      fetchDashboardData();
    } catch (err) {
      console.error('Error rejecting leave:', err);
      setError('Failed to reject leave request');
    }
  };

  const navigateToLeaveApproval = (status) => {
    // Store the selected status in localStorage
    localStorage.setItem('selectedLeaveStatus', status);
    // Navigate to the admin dashboard with leaves tab
    navigate('/admin/dashboard?tab=leaves');
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-6 bg-gray-100 min-h-screen">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow-xl p-6 flex items-center">
          <div className="p-3 rounded-full bg-blue-200 text-blue-600 mr-4">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-6 w-6"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"
              />
            </svg>
          </div>
          <div>
            <p className="text-sm font-medium text-gray-600">Total Employees</p>
            <p className="text-2xl font-semibold text-gray-800">{stats.totalEmployees}</p>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-xl p-6 flex items-center">
          <div className="p-3 rounded-full bg-green-200 text-green-600 mr-4">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-6 w-6"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4"
              />
            </svg>
          </div>
          <div>
            <p className="text-sm font-medium text-gray-600">Present Today</p>
            <p className="text-2xl font-semibold text-gray-800">{stats.presentToday}</p>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-xl p-6 flex items-center">
          <div className="p-3 rounded-full bg-yellow-200 text-yellow-600 mr-4">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-6 w-6"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
              />
            </svg>
          </div>
          <div>
            <p className="text-sm font-medium text-gray-600">Pending Leaves</p>
            <p className="text-2xl font-semibold text-gray-800">{stats.pendingLeaves}</p>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-xl p-6 flex items-center">
          <div className="p-3 rounded-full bg-purple-200 text-purple-600 mr-4">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-6 w-6"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
              />
            </svg>
          </div>
          <div>
            <p className="text-sm font-medium text-gray-600">Departments</p>
            <p className="text-2xl font-semibold text-gray-800">{stats.departments}</p>
          </div>
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Recent Activity */}
        <div className="bg-white rounded-lg shadow-xl overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
            <h2 className="text-lg font-medium text-gray-800">Recent Activity</h2>
            <button
              onClick={fetchActivityData}
              className="text-sm text-blue-600 hover:text-blue-800"
            >
              Refresh
            </button>
          </div>
          <div className="p-6">
            {recentActivity.length > 0 ? (
              <div className="space-y-4">
                {recentActivity.map((activity) => (
                  <div key={activity.id} className="flex items-start">
                    <div className="flex-shrink-0 h-10 w-10 rounded-full bg-blue-200 flex items-center justify-center text-blue-600">
                      {activity.user.charAt(0)}
                    </div>
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-900">{activity.user}</p>
                      <p className="text-sm text-gray-500">
                        {activity.action} at {activity.time} on {formatDate(activity.date)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500 text-center py-4">No recent activity found.</p>
            )}
          </div>
        </div>

        {/* Pending Leave Requests */}
        <div className="bg-white rounded-lg shadow-xl overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
            <h2 className="text-lg font-medium text-gray-800">Pending Leave Requests</h2>
            <div className="flex space-x-2">
              <button
                onClick={() => navigateToLeaveApproval('pending')}
                className="text-sm text-yellow-600 hover:text-yellow-800"
              >
                Pending
              </button>
              <button
                onClick={() => navigateToLeaveApproval('approved')}
                className="text-sm text-green-600 hover:text-green-800"
              >
                Approved
              </button>
              <button
                onClick={() => navigateToLeaveApproval('rejected')}
                className="text-sm text-red-600 hover:text-red-800"
              >
                Rejected
              </button>
              <button
                onClick={() => navigateToLeaveApproval('all')}
                className="text-sm text-blue-600 hover:text-blue-800"
              >
                All
              </button>
            </div>
          </div>
          <div className="p-6">
            {leaveRequests.length > 0 ? (
              <div className="space-y-4">
                {leaveRequests.slice(0, 5).map((leave) => (
                  <div
                    key={leave._id}
                    className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50"
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="text-sm font-medium text-gray-900">
                          {leave.user?.fullName?.first || 'Employee'}{' '}
                          {leave.user?.fullName?.last || ''}
                        </p>
                        <p className="text-xs text-gray-500">
                          {leave.user?.department || 'Department'}
                        </p>
                      </div>
                      <span className="px-2 py-1 text-xs font-semibold rounded-full bg-yellow-200 text-yellow-800">
                        Pending
                      </span>
                    </div>
                    <div className="mt-2">
                      <p className="text-sm text-gray-600">
                        <span className="font-medium">
                          {leave.leaveType.charAt(0).toUpperCase() + leave.leaveType.slice(1)}{' '}
                          Leave:
                        </span>{' '}
                        {formatDate(leave.startDate)} to {formatDate(leave.endDate)}
                      </p>
                      <p className="text-sm text-gray-500 mt-1 line-clamp-2">{leave.reason}</p>
                    </div>
                    <div className="mt-3 flex space-x-2">
                      <button
                        onClick={() => handleApproveLeave(leave._id)}
                        className="px-3 py-1 bg-green-200 text-green-700 rounded-md text-sm hover:bg-green-300"
                      >
                        Approve
                      </button>
                      <button
                        onClick={() => handleRejectLeave(leave._id)}
                        className="px-3 py-1 bg-red-200 text-red-700 rounded-md text-sm hover:bg-red-300"
                      >
                        Reject
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500 text-center py-4">No pending leave requests.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default Dashboard;
