/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable no-unused-vars */
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import dayjs from 'dayjs';
import EmployeeHolidayCalendar from '../components/EmployeeHolidayCalendar';
import MyProfile from '../components/MyProfile';

const apiUrl = import.meta.env.VITE_API_URL;

function EmployeeDashboardPage() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [todayAttendance, setTodayAttendance] = useState(null);
  const [recentLeaves, setRecentLeaves] = useState([]);
  const [attendanceSummary, setAttendanceSummary] = useState({
    present: 0,
    absent: 0,
    late: 0,
    total: 0,
  });
  const [error, setError] = useState(null);
  const [currentMonth, setCurrentMonth] = useState(dayjs().month());
  const [currentYear, setCurrentYear] = useState(dayjs().year());
  const [monthlyAttendance, setMonthlyAttendance] = useState([]);
  const [calendarLoading, setCalendarLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('attendance');
  const [showProfileModal, setShowProfileModal] = useState(false);

  const navigate = useNavigate();
  const token = localStorage.getItem('token');

  useEffect(() => {
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
      fetchDashboardData();
    } catch (error) {
      console.error('Error parsing user data:', error);
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      navigate('/login');
    } finally {
      setLoading(false);
    }
  }, [navigate]);

  // Fetch monthly attendance data when month/year changes
  useEffect(() => {
    fetchMonthlyAttendance();
  }, [currentMonth, currentYear]);

  const fetchDashboardData = async () => {
    try {
      // Fetch today's attendance
      const attendanceRes = await axios.get(`${apiUrl}/api/v1/attendance/today`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setTodayAttendance(attendanceRes.data.data.attendance);

      // Fetch recent leave requests
      const leavesRes = await axios.get(`${apiUrl}/api/v1/leaves`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setRecentLeaves(leavesRes.data.data.leaves?.slice(0, 5) || []);

      // Fetch current month's attendance summary
      fetchMonthlyAttendance();
    } catch (err) {
      console.error('Error fetching dashboard data:', err);
    }
  };

  const fetchMonthlyAttendance = async () => {
    setCalendarLoading(true);
    try {
      const startOfMonth = dayjs()
        .year(currentYear)
        .month(currentMonth)
        .startOf('month')
        .format('YYYY-MM-DD');
      const endOfMonth = dayjs()
        .year(currentYear)
        .month(currentMonth)
        .endOf('month')
        .format('YYYY-MM-DD');

      const summaryRes = await axios.get(`${apiUrl}/api/v1/attendance/history`, {
        headers: { Authorization: `Bearer ${token}` },
        params: { startDate: startOfMonth, endDate: endOfMonth },
      });

      // Get attendance records
      const records = summaryRes.data.data.attendance || [];
      setMonthlyAttendance(records);

      // Calculate summary
      const present = records.filter((r) => r.status === 'present').length;
      const absent = records.filter((r) => r.status === 'absent').length;
      const late = records.filter((r) => r.status === 'late').length;
      const halfDay = records.filter((r) => r.status === 'half-day').length;

      // Calculate working days (excluding weekends - only Sundays)
      const daysInMonth = dayjs().year(currentYear).month(currentMonth).daysInMonth();
      const weekendDays = Array.from({ length: daysInMonth }, (_, i) =>
        dayjs()
          .year(currentYear)
          .month(currentMonth)
          .date(i + 1)
          .day()
      ).filter((day) => day === 0).length;

      const workingDays = daysInMonth - weekendDays;

      setAttendanceSummary({
        present,
        absent,
        late,
        halfDay,
        workingDays,
        weekendDays,
        total: records.length,
      });
    } catch (err) {
      console.error('Error fetching monthly attendance:', err);
    } finally {
      setCalendarLoading(false);
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

  const getAttendanceStatus = (date) => {
    // Check if it's a weekend (only Sunday)
    const dayOfWeek = dayjs(date).day();
    if (dayOfWeek === 0) {
      return { status: 'weekend', color: 'bg-gray-200' };
    }

    // Find attendance record for this date
    const record = monthlyAttendance.find((r) => dayjs(r.date).format('YYYY-MM-DD') === date);

    if (!record) {
      // If date is in the future, show as upcoming
      if (dayjs(date).isAfter(dayjs(), 'day')) {
        return { status: 'upcoming', color: 'bg-white' };
      }
      // Otherwise, show as absent
      return { status: 'absent', color: 'bg-red-200' };
    }

    switch (record.status) {
      case 'present':
        return { status: 'present', color: 'bg-green-200' };
      case 'late':
        return { status: 'late', color: 'bg-blue-200' };
      case 'half-day':
        return { status: 'half-day', color: 'bg-yellow-200' };
      case 'absent':
        return { status: 'absent', color: 'bg-red-200' };
      default:
        return { status: record.status, color: 'bg-gray-100' };
    }
  };

  const renderCalendar = () => {
    const daysInMonth = dayjs().year(currentYear).month(currentMonth).daysInMonth();
    const firstDayOfMonth = dayjs().year(currentYear).month(currentMonth).startOf('month').day(); // 0 = Sunday

    const days = [];

    // Add empty cells for days before the first day of the month
    for (let i = 0; i < firstDayOfMonth; i++) {
      days.push(<div key={`empty-${i}`} className="h-10 border border-gray-200"></div>);
    }

    // Add cells for each day of the month
    for (let day = 1; day <= daysInMonth; day++) {
      const date = dayjs().year(currentYear).month(currentMonth).date(day).format('YYYY-MM-DD');
      const { status, color } = getAttendanceStatus(date);

      days.push(
        <div
          key={day}
          className={`h-10 border border-gray-200 ${color} flex flex-col justify-between p-1`}
        >
          <span className="text-xs font-medium">{day}</span>
          <span className="text-xs capitalize">{status.replace('-', ' ')}</span>
        </div>
      );
    }

    return days;
  };

  const previousMonth = () => {
    if (currentMonth === 0) {
      setCurrentMonth(11);
      setCurrentYear(currentYear - 1);
    } else {
      setCurrentMonth(currentMonth - 1);
    }
  };

  const nextMonth = () => {
    if (currentMonth === 11) {
      setCurrentMonth(0);
      setCurrentYear(currentYear + 1);
    } else {
      setCurrentMonth(currentMonth + 1);
    }
  };

  const monthNames = [
    'January',
    'February',
    'March',
    'April',
    'May',
    'June',
    'July',
    'August',
    'September',
    'October',
    'November',
    'December',
  ];

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  // Update user in local state and localStorage after profile update
  const handleProfileUpdated = (updated) => {
    const updatedUser = { ...user, ...updated, fullName: updated.fullName || user.fullName };
    setUser(updatedUser);
    localStorage.setItem('user', JSON.stringify(updatedUser));
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 py-6 sm:px-6 lg:px-8 flex justify-between items-center">
          <h1 className="text-3xl font-bold text-gray-900">
            {' '}
            <span className="text-[#ea590c]">{user?.fullName?.first}</span> Dashboard
          </h1>
          <div className="flex items-center">
            <span className="mr-4 text-gray-700">
              Welcome,{' '}
              <span className="text-blue-600 font-semibold">
                {user?.fullName?.first || 'Employee'} {user?.fullName?.last}
              </span>
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
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6 h-auto">
          {/* Attendance Card */}
          <div className="bg-[#ffffff] overflow-hidden shadow-xl rounded-2xl h-full transition-all duration-300 hover:shadow-2xl">
            <div className="px-6 py-6 sm:p-8">
              <h3 className="text-3xl font-semibold mt-1 text-gray-800 border-b pb-3">
                📅 Today's Attendance
              </h3>

              <div className="mt-6">
                {todayAttendance ? (
                  <div className="grid grid-cols-2 gap-6 text-center">
                    <div className="p-4 bg-blue-50 rounded-lg shadow-inner hover:bg-blue-100 transition">
                      <p className="text-sm font-medium text-gray-500">Check-In</p>
                      <p className="text-xl font-semibold text-blue-700 mt-1">
                        {todayAttendance.checkIn?.time
                          ? formatTime(todayAttendance.checkIn.time)
                          : 'Not checked in'}
                      </p>
                    </div>

                    <div className="p-4 bg-green-50 rounded-lg shadow-inner hover:bg-green-100 transition">
                      <p className="text-sm font-medium text-gray-500">Check-Out</p>
                      <p className="text-xl font-semibold text-green-700 mt-1">
                        {todayAttendance.checkOut?.time
                          ? formatTime(todayAttendance.checkOut.time)
                          : 'Not checked out'}
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <p className="text-gray-500 text-sm">No attendance record for today</p>
                  </div>
                )}
              </div>

              <div className="mt-[200px] text-center space-y-4">
                {/* Motivational/Informational Quotes Based on Attendance State */}
                {!todayAttendance?.checkIn ? (
                  <p className="text-gray-500 text-sm text-[16px]">
                    "Every new day is a fresh start. Let’s make it productive!" 🌞
                  </p>
                ) : !todayAttendance?.checkOut ? (
                  <p className="text-gray-500 font-sm text-[16px]">
                    "Great job showing up! Now finish strong and check out when you're done." 💪
                  </p>
                ) : (
                  <p className="text-blue-700 italic text-[16px]">
                    "You've completed today's journey. See your performance below!" 🚀
                  </p>
                )}

                {/* Button */}
                <button
                  className="w-full mt-10 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-semibold tracking-wide rounded-lg shadow-md hover:scale-[1.02] active:scale-[0.98] transition-transform duration-200"
                  onClick={() => navigate('/attendance')}
                >
                  {!todayAttendance?.checkIn
                    ? 'Check In'
                    : !todayAttendance?.checkOut
                      ? 'Check Out'
                      : 'View Attendance'}
                </button>
              </div>
            </div>
          </div>

          {/* Profile Card */}

          <div className="px-6 py-8 sm:p-10 bg-[#ffffff] shadow-xl rounded-2xl transition-all duration-300 hover:shadow-2xl">
            <h3 className="text-3xl font-bold  mb-4 border-b border-gray-800 pb-2 flex items-center gap-2">
              <span className="text-3xl mb-1">👤</span>
              <span className="text-orange-600">{user?.fullName?.first}</span> Profile
            </h3>

            <div className="space-y-2 text-[16px] text-gray-800 leading-relaxed tracking-wide">
              <p>
                <span className="font-semibold text-gray-900 inline-block w-40">Name:</span>
                <span className="text-blue-900">
                  {user?.fullName?.first} {user?.fullName?.last}
                </span>
              </p>
              <p>
                <span className="font-semibold text-gray-900 inline-block w-40">Email:</span>
                <span className="text-blue-900">{user?.email}</span>
              </p>

              <p>
                <span className="font-semibold text-gray-900 inline-block w-40">Mobile:</span>
                <span className="text-blue-900">{user?.mobile}</span>
              </p>

              <p>
                <span className="font-semibold text-gray-900 inline-block w-40">Department:</span>
                <span className="text-blue-900">{user?.department}</span>
              </p>
              <p>
                <span className="font-semibold text-gray-900 inline-block w-40">Designation:</span>
                <span className="text-blue-900">{user?.designation}</span>
              </p>
              <p>
                <span className="font-semibold text-gray-900 inline-block w-40">Joining Date:</span>
                <span className="text-blue-900">
                  {user?.joiningDate ? formatDate(user.joiningDate) : 'Not available'}
                </span>
              </p>
              <p>
                <span className="font-semibold text-gray-900 inline-block w-40">Address:</span>
                <span className="text-blue-900">{user?.address || '-'}</span>
              </p>
              <p>
                <span className="font-semibold text-gray-900 inline-block w-40">City:</span>
                <span className="text-blue-900">{user?.city || '-'}</span>
              </p>
              <p>
                <span className="font-semibold text-gray-900 inline-block w-40">State:</span>
                <span className="text-blue-900">{user?.state || '-'}</span>
              </p>
              <p>
                <span className="font-semibold text-gray-900 inline-block w-40">Country:</span>
                <span className="text-blue-900">{user?.country || '-'}</span>
              </p>
              <p>
                <span className="font-semibold text-gray-900 inline-block w-40">Postal Code:</span>
                <span className="text-blue-900">{user?.postalCode || '-'}</span>
              </p>
            </div>

            {/* Uncomment to enable Edit Profile button */}
            {/*
  <div className="mt-8">
    <button
      className="w-full py-2.5 bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-semibold rounded-lg shadow-lg hover:scale-105 hover:shadow-xl transition duration-200"
      onClick={() => setShowProfileModal(true)}
    >
      Edit Profile
    </button>
  </div>
  */}
          </div>
        </div>

        {/* Tabs */}
        <div className="mb-6 border-b border-gray-200">
          <nav className="-mb-px flex space-x-8">
            <button
              onClick={() => setActiveTab('attendance')}
              className={`${
                activeTab === 'attendance'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
            >
              Attendance Calendar
            </button>
            <button
              onClick={() => setActiveTab('holidays')}
              className={`${
                activeTab === 'holidays'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
            >
              Company Holidays
            </button>
          </nav>
        </div>

        {/* Attendance Calendar Tab */}
        {activeTab === 'attendance' && (
          <div className="bg-white shadow-lg rounded-lg overflow-hidden mb-6">
            <div className="px-4 py-5 sm:px-6 bg-gradient-to-r from-blue-500 to-blue-600">
              <h3 className="text-lg leading-6 font-medium text-white">
                Monthly Attendance Summary
              </h3>
            </div>
            <div className="px-4 py-5 sm:p-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Left Column - Monthly Summary */}
                <div className="space-y-4">
                  <div className="bg-green-50 p-4 rounded-lg">
                    <p className="text-sm text-gray-500">Present Days</p>
                    <p className="text-2xl font-bold text-green-600">
                      {attendanceSummary.present || 0}
                    </p>
                    <div className="w-full bg-gray-200 rounded-full h-2 mt-1">
                      <div
                        className="bg-green-500 h-2 rounded-full"
                        style={{
                          width: `${((attendanceSummary.present || 0) / (attendanceSummary.workingDays || 1)) * 100}%`,
                        }}
                      ></div>
                    </div>
                  </div>

                  <div className="bg-red-50 p-4 rounded-lg">
                    <p className="text-sm text-gray-500">Absent Days</p>
                    <p className="text-2xl font-bold text-red-600">
                      {attendanceSummary.absent || 0}
                    </p>
                    <div className="w-full bg-gray-200 rounded-full h-2 mt-1">
                      <div
                        className="bg-red-500 h-2 rounded-full"
                        style={{
                          width: `${((attendanceSummary.absent || 0) / (attendanceSummary.workingDays || 1)) * 100}%`,
                        }}
                      ></div>
                    </div>
                  </div>

                  <div className="bg-blue-50 p-4 rounded-lg">
                    <p className="text-sm text-gray-500">Late Days</p>
                    <p className="text-2xl font-bold text-blue-600">
                      {attendanceSummary.late || 0}
                    </p>
                    <div className="w-full bg-gray-200 rounded-full h-2 mt-1">
                      <div
                        className="bg-blue-500 h-2 rounded-full"
                        style={{
                          width: `${((attendanceSummary.late || 0) / (attendanceSummary.workingDays || 1)) * 100}%`,
                        }}
                      ></div>
                    </div>
                  </div>

                  <div className="bg-yellow-50 p-4 rounded-lg">
                    <p className="text-sm text-gray-500">Half Days</p>
                    <p className="text-2xl font-bold text-yellow-600">
                      {attendanceSummary.halfDay || 0}
                    </p>
                    <div className="w-full bg-gray-200 rounded-full h-2 mt-1">
                      <div
                        className="bg-yellow-500 h-2 rounded-full"
                        style={{
                          width: `${((attendanceSummary.halfDay || 0) / (attendanceSummary.workingDays || 1)) * 100}%`,
                        }}
                      ></div>
                    </div>
                  </div>

                  <div className="bg-gray-50 p-4 rounded-lg">
                    <p className="text-sm text-gray-500">Working Days</p>
                    <p className="text-2xl font-bold text-gray-600">
                      {attendanceSummary.workingDays || 0}
                    </p>
                  </div>
                </div>

                {/* Right Column - Calendar */}
                <div className="md:col-span-2">
                  {/* Month Navigation */}
                  <div className="flex justify-between items-center mb-4">
                    <button onClick={previousMonth} className="p-2 rounded-full hover:bg-gray-200">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-5 w-5"
                        viewBox="0 0 20 20"
                        fill="currentColor"
                      >
                        <path
                          fillRule="evenodd"
                          d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z"
                          clipRule="evenodd"
                        />
                      </svg>
                    </button>
                    <h3 className="text-lg font-medium">
                      {monthNames[currentMonth]} {currentYear}
                    </h3>
                    <button onClick={nextMonth} className="p-2 rounded-full hover:bg-gray-200">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-5 w-5"
                        viewBox="0 0 20 20"
                        fill="currentColor"
                      >
                        <path
                          fillRule="evenodd"
                          d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z"
                          clipRule="evenodd"
                        />
                      </svg>
                    </button>
                  </div>

                  {/* Calendar Legend */}
                  <div className="flex flex-wrap gap-2 mb-4">
                    <div className="flex items-center">
                      <div className="w-4 h-4 bg-green-200 mr-1"></div>
                      <span className="text-xs">Present</span>
                    </div>
                    <div className="flex items-center">
                      <div className="w-4 h-4 bg-blue-200 mr-1"></div>
                      <span className="text-xs">Late</span>
                    </div>
                    <div className="flex items-center">
                      <div className="w-4 h-4 bg-yellow-200 mr-1"></div>
                      <span className="text-xs">Half Day</span>
                    </div>
                    <div className="flex items-center">
                      <div className="w-4 h-4 bg-red-200 mr-1"></div>
                      <span className="text-xs">Absent</span>
                    </div>
                    <div className="flex items-center">
                      <div className="w-4 h-4 bg-gray-200 mr-1"></div>
                      <span className="text-xs">Weekend</span>
                    </div>
                  </div>

                  {/* Calendar */}
                  {calendarLoading ? (
                    <div className="flex justify-center py-8">
                      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
                    </div>
                  ) : (
                    <div>
                      {/* Day headers */}
                      <div className="grid grid-cols-7 gap-1 mb-1">
                        {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
                          <div
                            key={day}
                            className="text-center font-medium text-sm py-2 bg-gray-100"
                          >
                            {day}
                          </div>
                        ))}
                      </div>

                      {/* Calendar grid */}
                      <div className="grid grid-cols-7 gap-1">{renderCalendar()}</div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Company Holidays Tab */}
        {activeTab === 'holidays' && <EmployeeHolidayCalendar />}

        {/* Quick Actions */}
        <div className="bg-white mt-5 shadow-lg rounded-lg overflow-hidden">
          <div className="px-4 py-5 sm:px-6 bg-gradient-to-r from-gray-700 to-gray-800">
            <h3 className="text-lg leading-6 font-medium text-white">Quick Actions</h3>
          </div>
          <div className="px-4 py-5 sm:p-6">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <button
                onClick={() => navigate('/attendance')}
                className="flex flex-col items-center justify-center p-4 bg-blue-100 rounded-lg hover:bg-blue-200 transition-colors"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-8 w-8 text-blue-600 mb-2"
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
                <span className="text-sm font-medium text-gray-700">Mark Attendance</span>
              </button>
              <button
                onClick={() => navigate('/leave')}
                className="flex flex-col items-center justify-center p-4 bg-green-50 rounded-lg hover:bg-green-100 transition-colors"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-8 w-8 text-green-600 mb-2"
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
                <span className="text-sm font-medium text-gray-700">Request Leave</span>
              </button>
              <button
                onClick={() => navigate('/attendance')}
                className="flex flex-col items-center justify-center p-4 bg-purple-50 rounded-lg hover:bg-purple-100 transition-colors"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-8 w-8 text-purple-600 mb-2"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                  />
                </svg>
                <span className="text-sm font-medium text-gray-700">View Reports</span>
              </button>
              <button
                onClick={() => setShowProfileModal(true)}
                className="flex flex-col items-center justify-center p-4 bg-yellow-50 rounded-lg hover:bg-yellow-100 transition-colors"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-8 w-8 text-yellow-600 mb-2"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                  />
                </svg>
                <span className="text-sm font-medium text-gray-700">My Profile</span>
              </button>
            </div>
          </div>
        </div>

        {showProfileModal && (
          <MyProfile
            user={user}
            onClose={() => setShowProfileModal(false)}
            onProfileUpdated={handleProfileUpdated}
          />
        )}
      </main>
    </div>
  );
}

export default EmployeeDashboardPage;
