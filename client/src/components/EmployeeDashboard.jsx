import React, { useState, useEffect } from 'react';
import axios from 'axios';
import dayjs from 'dayjs';
import AttendanceStats from './AttendanceStats';
import EmployeeHolidayCalendar from './EmployeeHolidayCalendar';
import config from '../config';

function EmployeeDashboard() {
  const [user, setUser] = useState(null);
  const [todayAttendance, setTodayAttendance] = useState(null);
  const [recentLeaves, setRecentLeaves] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchDashboardData = async () => {
      setLoading(true);
      try {
        const token = localStorage.getItem('token');
        if (!token) return;

        // Fetch user data
        const userData = localStorage.getItem('user');
        if (userData) {
          setUser(JSON.parse(userData));
        }

        // Fetch today's attendance
        const attendanceRes = await axios.get(`${config.API_URL}/api/v1/attendance/today`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setTodayAttendance(attendanceRes.data.data.attendance);

        // Fetch recent leave requests
        const leavesRes = await axios.get(`${config.API_URL}/api/v1/leaves`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setRecentLeaves(leavesRes.data.data.leaves?.slice(0, 3) || []);

        setError(null);
      } catch (err) {
        console.error('Error fetching dashboard data:', err);
        setError('Failed to load dashboard data. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  const formatTime = (dateString) => {
    if (!dateString) return '-';
    return dayjs(dateString).format('hh:mm A');
  };

  const formatDate = (dateString) => {
    return dayjs(dateString).format('MMM DD, YYYY');
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

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {error && (
        <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded-md">
          <p className="text-sm text-red-700">{error}</p>
        </div>
      )}

      {/* Today's Attendance Card */}
      <div className="bg-white rounded-lg shadow-lg p-6">
        <h2 className="text-xl font-semibold text-gray-800 mb-4">Today's Attendance</h2>
        
        {todayAttendance ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-blue-50 p-4 rounded-lg">
              <h3 className="text-sm font-medium text-blue-800">Check-In</h3>
              <p className="text-2xl font-bold text-blue-600">
                {todayAttendance.checkIn?.time ? formatTime(todayAttendance.checkIn.time) : 'Not checked in'}
              </p>
            </div>
            
            <div className="bg-green-50 p-4 rounded-lg">
              <h3 className="text-sm font-medium text-green-800">Check-Out</h3>
              <p className="text-2xl font-bold text-green-600">
                {todayAttendance.checkOut?.time ? formatTime(todayAttendance.checkOut.time) : 'Not checked out'}
              </p>
            </div>
          </div>
        ) : (
          <div className="text-center py-4">
            <p className="text-gray-500">No attendance record for today</p>
          </div>
        )}
      </div>

      {/* Attendance Statistics */}
      <AttendanceStats />

      {/* Recent Leave Requests */}
      <div className="bg-white rounded-lg shadow-lg p-6">
        <h2 className="text-xl font-semibold text-gray-800 mb-4">Recent Leave Requests</h2>
        
        {recentLeaves.length > 0 ? (
          <div className="space-y-4">
            {recentLeaves.map((leave) => (
              <div key={leave._id} className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50">
                <div className="flex justify-between">
                  <div>
                    <p className="font-medium">
                      {leave.leaveType.charAt(0).toUpperCase() + leave.leaveType.slice(1)} Leave
                    </p>
                    <p className="text-sm text-gray-600">
                      {formatDate(leave.startDate)} to {formatDate(leave.endDate)}
                    </p>
                  </div>
                  <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getStatusBadgeClass(leave.status)}`}>
                    {leave.status.charAt(0).toUpperCase() + leave.status.slice(1)}
                  </span>
                </div>
                <p className="text-sm text-gray-500 mt-2">{leave.reason}</p>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-4">
            <p className="text-gray-500">No recent leave requests</p>
          </div>
        )}
      </div>

      {/* Company Holidays */}
      <EmployeeHolidayCalendar />
    </div>
  );
}

export default EmployeeDashboard;