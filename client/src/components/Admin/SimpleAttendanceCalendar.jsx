/* eslint-disable no-unused-vars */
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import dayjs from 'dayjs';

const apiUrl = import.meta.env.VITE_API_URL;

function SimpleAttendanceCalendar({ employeeId, onClose }) {
  const [currentMonth, setCurrentMonth] = useState(dayjs().month());
  const [currentYear, setCurrentYear] = useState(dayjs().year());
  const [attendanceData, setAttendanceData] = useState([]);
  const [employeeInfo, setEmployeeInfo] = useState(null);
  const [loading, setLoading] = useState(true);

  const token = localStorage.getItem('token');

  useEffect(() => {
    fetchAttendanceData();

    // Set up auto-refresh every 30 seconds to get latest attendance data
    const refreshInterval = setInterval(() => {
      fetchAttendanceData();
    }, 30000);

    return () => clearInterval(refreshInterval);
  }, [currentMonth, currentYear, employeeId]);

  const fetchAttendanceData = async () => {
    try {
      const startDate = dayjs(new Date(currentYear, currentMonth, 1))
        .startOf('month')
        .format('YYYY-MM-DD');
      const endDate = dayjs(new Date(currentYear, currentMonth, 1))
        .endOf('month')
        .format('YYYY-MM-DD');

      // Only show loading indicator on first load, not during refresh
      if (attendanceData.length === 0) {
        setLoading(true);
      }

      const response = await axios.get(`${apiUrl}/api/v1/attendance/employee/${employeeId}`, {
        headers: { Authorization: `Bearer ${token}` },
        // Add cache busting parameter to prevent caching
        params: { startDate, endDate, _t: new Date().getTime() },
      });

      console.log('Fetched attendance data:', response.data.data.attendance);
      setAttendanceData(response.data.data.attendance || []);
    } catch (err) {
      console.error('Error fetching attendance data:', err);
    } finally {
      setLoading(false);
    }
  };

  const getAttendanceStatus = (date) => {
    // Log to debug
    console.log('Checking status for date:', date);
    console.log('Available attendance data:', attendanceData);

    const dayRecord = attendanceData.find(
      (record) => dayjs(record.date).format('YYYY-MM-DD') === date
    );

    if (dayRecord) {
      console.log('Found record for date:', date, dayRecord);
    }

    // Check if it's a weekend (only Sunday)
    const dayOfWeek = dayjs(date).day();
    if (dayOfWeek === 0) {
      return { status: 'weekend', color: 'bg-gray-200' };
    }

    // Check if it's a future date
    const today = dayjs().format('YYYY-MM-DD');
    if (date > today) {
      return { status: 'upcoming', color: 'bg-white' };
    }

    if (!dayRecord) {
      return { status: 'absent', color: 'bg-red-200' };
    }

    switch (dayRecord.status) {
      case 'present':
        return { status: 'present', color: 'bg-green-200' };
      case 'late':
        return { status: 'late', color: 'bg-blue-200' };
      case 'half-day':
        return { status: 'half-day', color: 'bg-yellow-200' };
      default:
        return { status: dayRecord.status || 'absent', color: 'bg-red-200' };
    }
  };

  const renderCalendar = () => {
    const daysInMonth = dayjs(new Date(currentYear, currentMonth, 1)).daysInMonth();
    const firstDayOfMonth = dayjs(new Date(currentYear, currentMonth, 1)).day(); // 0 = Sunday

    const days = [];

    // Add empty cells for days before the first day of the month
    for (let i = 0; i < firstDayOfMonth; i++) {
      days.push(<div key={`empty-${i}`} className="h-12 border border-gray-200"></div>);
    }

    // Add cells for each day of the month
    for (let day = 1; day <= daysInMonth; day++) {
      const date = dayjs(new Date(currentYear, currentMonth, day)).format('YYYY-MM-DD');
      const { status, color } = getAttendanceStatus(date);

      days.push(
        <div
          key={day}
          className={`h-12 border border-gray-200 ${color} flex flex-col justify-between p-1 cursor-pointer hover:border-blue-500`}
          onClick={() => showDayDetails(date)}
        >
          <span className="text-xs font-medium">{day}</span>
          <span className="text-xs capitalize">{status.replace('-', ' ')}</span>
        </div>
      );
    }

    return days;
  };

  const showDayDetails = (date) => {
    console.log('Showing details for date:', date);
    console.log('Current attendance data:', attendanceData);

    const dayRecord = attendanceData.find(
      (record) => dayjs(record.date).format('YYYY-MM-DD') === date
    );

    // Check if it's a weekend (only Sunday)
    const dayOfWeek = dayjs(date).day();
    if (dayOfWeek === 0) {
      alert(`${date}: Weekend`);
      return;
    }

    if (!dayRecord) {
      alert(`${date}: Absent`);
      return;
    }

    const checkInTime = dayRecord.checkIn?.time
      ? dayjs(dayRecord.checkIn.time).format('hh:mm A')
      : 'N/A';
    const checkOutTime = dayRecord.checkOut?.time
      ? dayjs(dayRecord.checkOut.time).format('hh:mm A')
      : 'N/A';

    alert(
      `Date: ${date}\nCheck-in: ${checkInTime}\nCheck-out: ${checkOutTime}\nStatus: ${dayRecord.status}`
    );
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

  // Calculate attendance statistics
  const presentDays = attendanceData.filter((record) => record.status === 'present').length;

  const lateDays = attendanceData.filter((record) => record.status === 'late').length;

  const halfDays = attendanceData.filter((record) => record.status === 'half-day').length;

  // Calculate total days in month
  const daysInMonth = dayjs(new Date(currentYear, currentMonth, 1)).daysInMonth();

  // Calculate weekends (only Sundays)
  const weekendDays = Array.from({ length: daysInMonth }, (_, i) =>
    dayjs(new Date(currentYear, currentMonth, i + 1)).day()
  ).filter((day) => day === 0).length;

  // Calculate total working days (all days minus Sundays)
  const totalWorkingDays = daysInMonth - weekendDays;

  console.log(
    `Month: ${currentMonth + 1}, Year: ${currentYear}, Days in month: ${daysInMonth}, Weekends: ${weekendDays}, Working days: ${totalWorkingDays}`
  );

  // Get current date info
  const today = dayjs();
  const isCurrentMonth = currentYear === today.year() && currentMonth === today.month();

  // For display purposes, always show total working days for the month
  const workingDaysTotal = totalWorkingDays;

  // Calculate absent days based on month type
  let absentDays;

  if (isCurrentMonth) {
    // For current month, only count days up to today
    const todayDate = today.date();

    // Count Sundays up to today
    const sundaysUpToToday = Array.from({ length: todayDate }, (_, i) =>
      dayjs(new Date(currentYear, currentMonth, i + 1)).day()
    ).filter((day) => day === 0).length;

    // Working days up to today = today's date - Sundays up to today
    const workingDaysUpToToday = todayDate - sundaysUpToToday;

    // Absent days = working days up to today - marked attendance
    absentDays = Math.max(0, workingDaysUpToToday - presentDays - lateDays - halfDays);

    console.log(
      `Current month: Today=${todayDate}, Sundays=${sundaysUpToToday}, Working days=${workingDaysUpToToday}, Absent=${absentDays}`
    );
  } else if (
    currentYear < today.year() ||
    (currentYear === today.year() && currentMonth < today.month())
  ) {
    // For past months, count all working days
    absentDays = Math.max(0, totalWorkingDays - presentDays - lateDays - halfDays);
    console.log(`Past month: Working days=${totalWorkingDays}, Absent=${absentDays}`);
  } else {
    // For future months, no absent days
    absentDays = 0;
    console.log(`Future month: No absent days`);
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-5xl max-h-[90vh] overflow-y-auto">
        <div className="bg-gradient-to-r from-blue-600 to-blue-800 px-6 py-4 flex justify-between items-center">
          <div>
            <h2 className="text-xl font-bold text-white">Employee Attendance Calendar</h2>
            <p className="text-sm text-blue-100">Last updated: {new Date().toLocaleTimeString()}</p>
          </div>
          <div>
            <button
              onClick={fetchAttendanceData}
              className="mr-2 bg-green-600 hover:bg-green-700 text-white px-3 py-1 rounded text-sm"
            >
              Refresh Data
            </button>
            <button onClick={onClose} className="text-white hover:text-gray-200">
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
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>
        </div>

        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Left Column - Monthly Summary */}
            <div className="md:col-span-1">
              <div className="bg-gray-50 p-4 rounded-lg h-full">
                <h3 className="text-lg font-medium mb-4">Monthly Summary</h3>
                <div className="space-y-4">
                  <div>
                    <p className="text-sm text-gray-500">Present Days</p>
                    <p className="font-medium text-lg">{presentDays}</p>
                    <div className="w-full bg-gray-200 rounded-full h-2 mt-1">
                      <div
                        className="bg-green-500 h-2 rounded-full"
                        style={{ width: `${(presentDays / workingDaysTotal) * 100}%` }}
                      ></div>
                    </div>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Late Days</p>
                    <p className="font-medium text-lg">{lateDays}</p>
                    <div className="w-full bg-gray-200 rounded-full h-2 mt-1">
                      <div
                        className="bg-blue-500 h-2 rounded-full"
                        style={{ width: `${(lateDays / workingDaysTotal) * 100}%` }}
                      ></div>
                    </div>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Half Days</p>
                    <p className="font-medium text-lg">{halfDays}</p>
                    <div className="w-full bg-gray-200 rounded-full h-2 mt-1">
                      <div
                        className="bg-yellow-500 h-2 rounded-full"
                        style={{ width: `${(halfDays / workingDaysTotal) * 100}%` }}
                      ></div>
                    </div>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Absent Days</p>
                    <p className="font-medium text-lg">{absentDays}</p>
                    <div className="w-full bg-gray-200 rounded-full h-2 mt-1">
                      <div
                        className="bg-red-500 h-2 rounded-full"
                        style={{
                          width: `${(absentDays / (absentDays + presentDays + lateDays + halfDays || 1)) * 100}%`,
                        }}
                      ></div>
                    </div>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Weekends</p>
                    <p className="font-medium text-lg">{weekendDays}</p>
                  </div>
                  <div className="pt-4 border-t border-gray-200">
                    <p className="text-sm text-gray-500">Total Working Days</p>
                    <p className="font-medium text-lg">{workingDaysTotal}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Attendance Rate</p>
                    <p className="font-medium text-lg">
                      {Math.round((presentDays / workingDaysTotal) * 100)}%
                    </p>
                  </div>
                </div>
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
              {loading ? (
                <div className="flex justify-center py-8">
                  <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
                </div>
              ) : (
                <div>
                  {/* Day headers */}
                  <div className="grid grid-cols-7 gap-1 mb-1">
                    {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
                      <div key={day} className="text-center font-medium text-sm py-2 bg-gray-100">
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
    </div>
  );
}

export default SimpleAttendanceCalendar;
