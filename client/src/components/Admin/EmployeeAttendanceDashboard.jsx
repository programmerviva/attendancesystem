import React, { useState, useEffect } from 'react';
import axios from 'axios';
import dayjs from 'dayjs';

const apiUrl = import.meta.env.VITE_API_URL;

function EmployeeAttendanceDashboard({ employeeId, onClose }) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [attendanceData, setAttendanceData] = useState([]);
  const [employeeInfo, setEmployeeInfo] = useState(null);
  const [currentMonth, setCurrentMonth] = useState(dayjs().month());
  const [currentYear, setCurrentYear] = useState(dayjs().year());

  const token = localStorage.getItem('token');

  useEffect(() => {
    fetchEmployeeData();
    fetchAttendanceData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [employeeId, currentMonth, currentYear]);

  const fetchEmployeeData = async () => {
    try {
      const response = await axios.get(`${apiUrl}/api/v1/users/${employeeId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setEmployeeInfo(response.data.data.user);
    } catch (err) {
      console.error('Error fetching employee data:', err);
      setError('Failed to load employee information');
    }
  };

  const fetchAttendanceData = async () => {
    setLoading(true);
    try {
      // Get first and last day of the month
      const startDate = dayjs()
        .year(currentYear)
        .month(currentMonth)
        .startOf('month')
        .format('YYYY-MM-DD');
      const endDate = dayjs()
        .year(currentYear)
        .month(currentMonth)
        .endOf('month')
        .format('YYYY-MM-DD');

      const response = await axios.get(`${apiUrl}/api/v1/attendance/employee/${employeeId}`, {
        headers: { Authorization: `Bearer ${token}` },
        params: { startDate, endDate },
      });

      setAttendanceData(response.data.data.attendance || []);
      setError(null);
    } catch (err) {
      console.error('Error fetching attendance data:', err);
      setError('Failed to load attendance data');
    } finally {
      setLoading(false);
    }
  };

  const getAttendanceStatus = (date) => {
    const dayRecord = attendanceData.find(
      (record) => dayjs(record.date).format('YYYY-MM-DD') === date
    );

    if (!dayRecord) {
      return { status: 'absent', color: 'bg-red-200' };
    }

    // Check if check-in exists
    if (!dayRecord.checkIn || !dayRecord.checkIn.time) {
      return { status: 'absent', color: 'bg-red-200' };
    }

    const checkInTime = dayjs(dayRecord.checkIn.time);
    const checkInHour = checkInTime.hour();
    const checkInMinute = checkInTime.minute();

    // Regular check-in (before 10:30 AM)
    if (checkInHour < 10 || (checkInHour === 10 && checkInMinute < 30)) {
      return { status: 'present', color: 'bg-green-200' };
    }

    // Short leave (between 10:30 AM and 1:00 PM)
    if (checkInHour < 13 || (checkInHour === 13 && checkInMinute === 0)) {
      return { status: 'short-leave', color: 'bg-blue-200' };
    }

    // Half day (after 1:00 PM)
    return { status: 'half-day', color: 'bg-yellow-200' };
  };

  const renderCalendar = () => {
    const daysInMonth = dayjs().year(currentYear).month(currentMonth).daysInMonth();
    const firstDayOfMonth = dayjs().year(currentYear).month(currentMonth).startOf('month').day(); // 0 = Sunday

    const days = [];

    // Add empty cells for days before the first day of the month
    for (let i = 0; i < firstDayOfMonth; i++) {
      days.push(<div key={`empty-${i}`} className="h-12 border border-gray-200"></div>);
    }

    // Add cells for each day of the month
    for (let day = 1; day <= daysInMonth; day++) {
      const date = dayjs().year(currentYear).month(currentMonth).date(day).format('YYYY-MM-DD');
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
    const dayRecord = attendanceData.find(
      (record) => dayjs(record.date).format('YYYY-MM-DD') === date
    );

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

    alert(`Date: ${date}\nCheck-in: ${checkInTime}\nCheck-out: ${checkOutTime}`);
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

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        <div className="bg-gradient-to-r from-blue-600 to-blue-800 px-6 py-4 flex justify-between items-center">
          <h2 className="text-xl font-bold text-white">
            {employeeInfo
              ? `${employeeInfo.fullName.first} ${employeeInfo.fullName.last}'s Attendance`
              : 'Employee Attendance'}
          </h2>
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

        <div className="p-6">
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
              </div>
            </div>
          )}

          {/* Employee Info */}
          {employeeInfo && (
            <div className="mb-6 bg-gray-50 p-4 rounded-lg">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <p className="text-sm text-gray-500">Employee</p>
                  <p className="font-medium">
                    {employeeInfo.fullName.first} {employeeInfo.fullName.last}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Department</p>
                  <p className="font-medium">{employeeInfo.department || 'N/A'}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Designation</p>
                  <p className="font-medium">{employeeInfo.designation || 'N/A'}</p>
                </div>
              </div>
            </div>
          )}

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
          <div className="flex space-x-4 mb-4">
            <div className="flex items-center">
              <div className="w-4 h-4 bg-green-200 mr-1"></div>
              <span className="text-xs">Present</span>
            </div>
            <div className="flex items-center">
              <div className="w-4 h-4 bg-blue-200 mr-1"></div>
              <span className="text-xs">Short Leave</span>
            </div>
            <div className="flex items-center">
              <div className="w-4 h-4 bg-yellow-200 mr-1"></div>
              <span className="text-xs">Half Day</span>
            </div>
            <div className="flex items-center">
              <div className="w-4 h-4 bg-red-200 mr-1"></div>
              <span className="text-xs">Absent</span>
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

          {/* Attendance Summary */}
          <div className="mt-6 bg-gray-50 p-4 rounded-lg">
            <h4 className="font-medium mb-2">Monthly Summary</h4>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div>
                <p className="text-sm text-gray-500">Present Days</p>
                <p className="font-medium">
                  {
                    attendanceData.filter(
                      (record) =>
                        (record.checkIn?.time && dayjs(record.checkIn.time).hour() < 10) ||
                        (dayjs(record.checkIn.time).hour() === 10 &&
                          dayjs(record.checkIn.time).minute() < 30)
                    ).length
                  }
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Short Leaves</p>
                <p className="font-medium">
                  {
                    attendanceData.filter(
                      (record) =>
                        record.checkIn?.time &&
                        ((dayjs(record.checkIn.time).hour() === 10 &&
                          dayjs(record.checkIn.time).minute() >= 30) ||
                          (dayjs(record.checkIn.time).hour() > 10 &&
                            dayjs(record.checkIn.time).hour() < 13))
                    ).length
                  }
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Half Days</p>
                <p className="font-medium">
                  {
                    attendanceData.filter(
                      (record) => record.checkIn?.time && dayjs(record.checkIn.time).hour() >= 13
                    ).length
                  }
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Absent Days</p>
                <p className="font-medium">
                  {dayjs().year(currentYear).month(currentMonth).daysInMonth() -
                    attendanceData.length}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default EmployeeAttendanceDashboard;