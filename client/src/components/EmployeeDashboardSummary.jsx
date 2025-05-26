/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable no-unused-vars */
import { useState, useEffect } from 'react';
import axios from 'axios';
import dayjs from 'dayjs';
import AttendanceStats from './AttendanceStats';


const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000';

function EmployeeDashboardSummary() {
  const [todayAttendance, setTodayAttendance] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [user, setUser] = useState(null);

  const token = localStorage.getItem('token');

  useEffect(() => {
    const userData = localStorage.getItem('user');
    if (userData) {
      setUser(JSON.parse(userData));
    }
    
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      // Fetch today's attendance
      const attendanceRes = await axios.get(`${apiUrl}/api/v1/attendance/today`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      
      setTodayAttendance(attendanceRes.data.data.attendance);
      setError(null);
    } catch (err) {
      console.error('Error fetching dashboard data:', err);
      setError('Failed to fetch dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const formatTime = (dateString) => {
    if (!dateString) return '-';
    return dayjs(dateString).format('hh:mm A');
  };

  const getStatusBadgeClass = (status) => {
    switch (status) {
      case 'present':
        return 'bg-green-100 text-green-800';
      case 'absent':
        return 'bg-red-100 text-red-800';
      case 'half-day':
        return 'bg-yellow-100 text-yellow-800';
      case 'late':
        return 'bg-orange-100 text-orange-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {/* Today's Attendance Card */}
      <div className="bg-white shadow-lg rounded-lg overflow-hidden">
        <div className="px-4 py-5 sm:px-6 bg-gradient-to-r from-indigo-500 to-indigo-600">
          <h3 className="text-lg leading-6 font-medium text-white">Today's Attendance</h3>
        </div>
        
        <div className="px-4 py-5 sm:p-6">
          {loading ? (
            <div className="flex justify-center py-4">
              <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-indigo-500"></div>
            </div>
          ) : error ? (
            <div className="text-center py-4 text-red-500">{error}</div>
          ) : todayAttendance ? (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 bg-indigo-50 rounded-lg">
                  <p className="text-sm text-gray-500">Check-In</p>
                  <p className="text-xl font-semibold text-indigo-700">
                    {todayAttendance.checkIn?.time ? formatTime(todayAttendance.checkIn.time) : 'Not checked in'}
                  </p>
                </div>
                
                <div className="p-4 bg-indigo-50 rounded-lg">
                  <p className="text-sm text-gray-500">Check-Out</p>
                  <p className="text-xl font-semibold text-indigo-700">
                    {todayAttendance.checkOut?.time ? formatTime(todayAttendance.checkOut.time) : 'Not checked out'}
                  </p>
                </div>
              </div>
              
              <div className="flex items-center justify-between p-4 bg-indigo-50 rounded-lg">
                <div>
                  <p className="text-sm text-gray-500">Status</p>
                  <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusBadgeClass(todayAttendance.status)}`}>
                    {todayAttendance.status.charAt(0).toUpperCase() + todayAttendance.status.slice(1).replace('-', ' ')}
                  </span>
                </div>
                
                <div>
                  <p className="text-sm text-gray-500">Work Hours</p>
                  <p className="text-xl font-semibold text-indigo-700">
                    {todayAttendance.workHours ? `${todayAttendance.workHours} hrs` : '-'}
                  </p>
                </div>
              </div>
            </div>
          ) : (
            <div className="text-center py-4">
              <p className="text-gray-500">No attendance record for today</p>
              <button 
                onClick={() => window.location.href = '/attendance'}
                className="mt-4 inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                Mark Attendance
              </button>
            </div>
          )}
        </div>
      </div>
      
      {/* Attendance Stats */}
      <AttendanceStats />
    </div>
  );
}

export default EmployeeDashboardSummary;