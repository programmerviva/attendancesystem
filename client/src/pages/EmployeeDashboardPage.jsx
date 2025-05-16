import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import dayjs from 'dayjs';

function EmployeeDashboardPage() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [todayAttendance, setTodayAttendance] = useState(null);
  const [recentLeaves, setRecentLeaves] = useState([]);
  const [attendanceSummary, setAttendanceSummary] = useState({
    present: 0,
    absent: 0,
    late: 0,
    total: 0
  });
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem('token');
    const userData = localStorage.getItem('user');
    
    if (!token) {
      navigate('/login');
      return;
    }
    
    try {
      const parsedUser = userData ? JSON.parse(userData) : null;
      setUser(parsedUser);
      
      // Redirect admin to admin dashboard
      if (parsedUser && parsedUser.role === 'admin') {
        navigate('/admin/dashboard');
      }

      // Fetch dashboard data
      fetchDashboardData(token);
    } catch (error) {
      console.error('Error parsing user data:', error);
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      navigate('/login');
    } finally {
      setLoading(false);
    }
  }, [navigate]);

  const fetchDashboardData = async (token) => {
    try {
      // Fetch today's attendance
      const attendanceRes = await axios.get('http://localhost:5000/api/v1/attendance/today', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setTodayAttendance(attendanceRes.data.data.attendance);

      // Fetch recent leave requests
      const leavesRes = await axios.get('http://localhost:5000/api/v1/leaves', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setRecentLeaves(leavesRes.data.data.leaves?.slice(0, 5) || []); // Get only the 5 most recent

      // Fetch attendance history for the current month
      const startOfMonth = dayjs().startOf('month').format('YYYY-MM-DD');
      const endOfMonth = dayjs().endOf('month').format('YYYY-MM-DD');
      
      const summaryRes = await axios.get('http://localhost:5000/api/v1/attendance/history', {
        headers: { Authorization: `Bearer ${token}` },
        params: { startDate: startOfMonth, endDate: endOfMonth }
      });
      
      // Calculate summary
      const records = summaryRes.data.data.attendance || [];
      const present = records.filter(r => r.status === 'present').length;
      const absent = records.filter(r => r.status === 'absent').length;
      const late = records.filter(r => r.status === 'late').length;
      
      setAttendanceSummary({
        present,
        absent,
        late,
        total: records.length
      });
    } catch (err) {
      console.error('Error fetching dashboard data:', err);
    }
  };

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
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 py-6 sm:px-6 lg:px-8 flex justify-between items-center">
          <h1 className="text-3xl font-bold text-gray-900">Employee Dashboard</h1>
          <div className="flex items-center">
            <span className="mr-4 text-gray-700">
              Welcome, {user?.fullName?.first || 'Employee'}
            </span>
            <button 
              onClick={() => {
                localStorage.removeItem('token');
                localStorage.removeItem('user');
                navigate('/login');
              }}
              className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-md text-sm font-medium"
            >
              Logout
            </button>
          </div>
        </div>
      </header>
      
      <main className="max-w-7xl mx-auto px-4 py-6 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-6">
          {/* Attendance Card */}
          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="px-4 py-5 sm:p-6">
              <h3 className="text-lg font-medium text-gray-900">Today's Attendance</h3>
              <div className="mt-5">
                {todayAttendance ? (
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-gray-500">Check-In</p>
                      <p className="text-xl font-semibold text-gray-800">
                        {todayAttendance.checkIn?.time ? formatTime(todayAttendance.checkIn.time) : 'Not checked in'}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Check-Out</p>
                      <p className="text-xl font-semibold text-gray-800">
                        {todayAttendance.checkOut?.time ? formatTime(todayAttendance.checkOut.time) : 'Not checked out'}
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-4">
                    <p className="text-gray-500">No attendance record for today</p>
                  </div>
                )}
                <div className="mt-5">
                  <button 
                    className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md text-sm font-medium w-full"
                    onClick={() => navigate('/attendance')}
                  >
                    {!todayAttendance?.checkIn ? 'Check In' : 
                     !todayAttendance?.checkOut ? 'Check Out' : 'View Attendance'}
                  </button>
                </div>
              </div>
            </div>
          </div>
          
          {/* Leave Card */}
          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="px-4 py-5 sm:p-6">
              <h3 className="text-lg font-medium text-gray-900">Leave Management</h3>
              <div className="mt-5">
                <div className="flex justify-between mb-2">
                  <span className="text-sm text-gray-500">Recent Requests</span>
                  <span className="text-sm font-medium text-blue-600">{recentLeaves.length} requests</span>
                </div>
                {recentLeaves.length > 0 ? (
                  <div className="space-y-2">
                    {recentLeaves.slice(0, 2).map(leave => (
                      <div key={leave._id} className="flex justify-between items-center p-2 bg-gray-50 rounded">
                        <div>
                          <p className="text-sm font-medium">{formatDate(leave.startDate)}</p>
                          <p className="text-xs text-gray-500">{leave.leaveType} leave</p>
                        </div>
                        <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusBadgeClass(leave.status)}`}>
                          {leave.status}
                        </span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-gray-500 text-center py-2">No recent leave requests</p>
                )}
                <div className="mt-5">
                  <button 
                    className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-md text-sm font-medium w-full"
                    onClick={() => navigate('/leave')}
                  >
                    Request Leave
                  </button>
                </div>
              </div>
            </div>
          </div>
          
          {/* Profile Card */}
          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="px-4 py-5 sm:p-6">
              <h3 className="text-lg font-medium text-gray-900">My Profile</h3>
              <div className="mt-3">
                <p className="text-sm text-gray-600">Name: {user?.fullName?.first} {user?.fullName?.last}</p>
                <p className="text-sm text-gray-600">Email: {user?.email}</p>
                <p className="text-sm text-gray-600">Department: {user?.department}</p>
                <p className="text-sm text-gray-600">Designation: {user?.designation}</p>
              </div>
              <div className="mt-5">
                <button 
                  className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-md text-sm font-medium w-full"
                >
                  Edit Profile
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Monthly Summary */}
        <div className="bg-white shadow rounded-lg overflow-hidden mb-6">
          <div className="px-4 py-5 sm:px-6 bg-gradient-to-r from-blue-500 to-blue-600">
            <h3 className="text-lg leading-6 font-medium text-white">Monthly Attendance Summary</h3>
          </div>
          <div className="px-4 py-5 sm:p-6">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-green-50 p-4 rounded-lg text-center">
                <p className="text-sm text-gray-500">Present Days</p>
                <p className="text-2xl font-bold text-green-600">{attendanceSummary.present}</p>
              </div>
              <div className="bg-red-50 p-4 rounded-lg text-center">
                <p className="text-sm text-gray-500">Absent Days</p>
                <p className="text-2xl font-bold text-red-600">{attendanceSummary.absent}</p>
              </div>
              <div className="bg-yellow-50 p-4 rounded-lg text-center">
                <p className="text-sm text-gray-500">Late Days</p>
                <p className="text-2xl font-bold text-yellow-600">{attendanceSummary.late}</p>
              </div>
              <div className="bg-blue-50 p-4 rounded-lg text-center">
                <p className="text-sm text-gray-500">Working Days</p>
                <p className="text-2xl font-bold text-blue-600">{dayjs().daysInMonth()}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-white shadow rounded-lg overflow-hidden">
          <div className="px-4 py-5 sm:px-6 bg-gradient-to-r from-gray-700 to-gray-800">
            <h3 className="text-lg leading-6 font-medium text-white">Quick Actions</h3>
          </div>
          <div className="px-4 py-5 sm:p-6">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <button
                onClick={() => navigate('/attendance')}
                className="flex flex-col items-center justify-center p-4 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-blue-600 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
                </svg>
                <span className="text-sm font-medium text-gray-700">Mark Attendance</span>
              </button>
              <button
                onClick={() => navigate('/leave')}
                className="flex flex-col items-center justify-center p-4 bg-green-50 rounded-lg hover:bg-green-100 transition-colors"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-green-600 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                <span className="text-sm font-medium text-gray-700">Request Leave</span>
              </button>
              <button
                onClick={() => navigate('/attendance')}
                className="flex flex-col items-center justify-center p-4 bg-purple-50 rounded-lg hover:bg-purple-100 transition-colors"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-purple-600 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                <span className="text-sm font-medium text-gray-700">View Reports</span>
              </button>
              <button
                className="flex flex-col items-center justify-center p-4 bg-yellow-50 rounded-lg hover:bg-yellow-100 transition-colors"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-yellow-600 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
                <span className="text-sm font-medium text-gray-700">My Profile</span>
              </button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

export default EmployeeDashboardPage;