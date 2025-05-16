import React, { useState, useEffect } from 'react';
import axios from 'axios';
import dayjs from 'dayjs';

function AttendanceHistory() {
  const [attendanceRecords, setAttendanceRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [dateRange, setDateRange] = useState({
    startDate: dayjs().subtract(30, 'day').format('YYYY-MM-DD'),
    endDate: dayjs().format('YYYY-MM-DD')
  });
  const [currentMonth, setCurrentMonth] = useState(dayjs().month());
  const [currentYear, setCurrentYear] = useState(dayjs().year());
  const [monthlyAttendance, setMonthlyAttendance] = useState([]);
  const [calendarLoading, setCalendarLoading] = useState(false);
  const [monthlySummary, setMonthlySummary] = useState({
    present: 0,
    absent: 0,
    late: 0,
    halfDay: 0,
    workingDays: 0,
    weekendDays: 0
  });

  const token = localStorage.getItem('token');

  useEffect(() => {
    fetchAttendanceHistory();
  }, [dateRange]);

  useEffect(() => {
    fetchMonthlyAttendance();
  }, [currentMonth, currentYear]);

  const fetchAttendanceHistory = async () => {
    setLoading(true);
    try {
      const response = await axios.get('http://localhost:5000/api/v1/attendance/history', {
        headers: { Authorization: `Bearer ${token}` },
        params: dateRange
      });
      
      setAttendanceRecords(response.data.data.attendance);
      setError(null);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch attendance history');
      console.error('Error fetching attendance history:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchMonthlyAttendance = async () => {
    setCalendarLoading(true);
    try {
      const startOfMonth = dayjs().year(currentYear).month(currentMonth).startOf('month').format('YYYY-MM-DD');
      const endOfMonth = dayjs().year(currentYear).month(currentMonth).endOf('month').format('YYYY-MM-DD');
      
      const response = await axios.get('http://localhost:5000/api/v1/attendance/history', {
        headers: { Authorization: `Bearer ${token}` },
        params: { startDate: startOfMonth, endDate: endOfMonth }
      });
      
      const records = response.data.data.attendance || [];
      setMonthlyAttendance(records);
      
      // Calculate summary
      const present = records.filter(r => r.status === 'present').length;
      const absent = records.filter(r => r.status === 'absent').length;
      const late = records.filter(r => r.status === 'late').length;
      const halfDay = records.filter(r => r.status === 'half-day').length;
      
      // Calculate working days (excluding weekends)
      const daysInMonth = dayjs().year(currentYear).month(currentMonth).daysInMonth();
      const weekendDays = Array.from({ length: daysInMonth }, 
        (_, i) => dayjs().year(currentYear).month(currentMonth).date(i + 1).day())
        .filter(day => day === 0 || day === 6).length;
      
      const workingDays = daysInMonth - weekendDays;
      
      setMonthlySummary({
        present,
        absent,
        late,
        halfDay,
        workingDays,
        weekendDays
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
      case 'present':
        return 'bg-green-100 text-green-800';
      case 'absent':
        return 'bg-red-100 text-red-800';
      case 'half-day':
        return 'bg-yellow-100 text-yellow-800';
      case 'late':
        return 'bg-orange-100 text-orange-800';
      case 'early-leave':
        return 'bg-purple-100 text-purple-800';
      case 'on-leave':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getAttendanceStatus = (date) => {
    // Check if it's a weekend
    const dayOfWeek = dayjs(date).day();
    if (dayOfWeek === 0 || dayOfWeek === 6) {
      return { status: 'weekend', color: 'bg-gray-200' };
    }
    
    // Find attendance record for this date
    const record = monthlyAttendance.find(r => 
      dayjs(r.date).format('YYYY-MM-DD') === date
    );
    
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
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  return (
    <div className="max-w-6xl mx-auto p-6">
      <div className="bg-white shadow-xl rounded-lg overflow-hidden">
        <div className="bg-gradient-to-r from-blue-600 to-blue-800 px-6 py-4">
          <h2 className="text-2xl font-bold text-white">Attendance History</h2>
          <p className="text-blue-100">View your attendance records</p>
        </div>

        <div className="p-6">
          {/* Date Range Filter */}
          <div className="mb-6 flex flex-wrap gap-4">
            <div>
              <label htmlFor="startDate" className="block text-sm font-medium text-gray-700 mb-1">Start Date</label>
              <input
                type="date"
                id="startDate"
                value={dateRange.startDate}
                onChange={(e) => setDateRange({ ...dateRange, startDate: e.target.value })}
                className="border border-gray-300 rounded-md shadow-sm px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <div>
              <label htmlFor="endDate" className="block text-sm font-medium text-gray-700 mb-1">End Date</label>
              <input
                type="date"
                id="endDate"
                value={dateRange.endDate}
                onChange={(e) => setDateRange({ ...dateRange, endDate: e.target.value })}
                className="border border-gray-300 rounded-md shadow-sm px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>

          {/* Error Message */}
          {error && (
            <div className="mb-6 bg-red-50 border-l-4 border-red-500 p-4 rounded-md">
              <div className="flex">
                <div className="flex-shrink-0">
                  <svg className="h-5 w-5 text-red-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="ml-3">
                  <p className="text-sm text-red-700">{error}</p>
                </div>
              </div>
            </div>
          )}

          {/* Monthly View with Calendar and Summary */}
          <div className="mb-8">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Monthly Attendance View</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Left Column - Monthly Summary */}
              <div className="md:col-span-1">
                <div className="bg-gray-50 p-4 rounded-lg h-full">
                  <h4 className="text-md font-medium mb-4">Monthly Summary</h4>
                  <div className="space-y-4">
                    <div>
                      <p className="text-sm text-gray-500">Present Days</p>
                      <p className="font-medium text-lg">{monthlySummary.present}</p>
                      <div className="w-full bg-gray-200 rounded-full h-2 mt-1">
                        <div className="bg-green-500 h-2 rounded-full" style={{ width: `${(monthlySummary.present / monthlySummary.workingDays) * 100}%` }}></div>
                      </div>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Late Days</p>
                      <p className="font-medium text-lg">{monthlySummary.late}</p>
                      <div className="w-full bg-gray-200 rounded-full h-2 mt-1">
                        <div className="bg-blue-500 h-2 rounded-full" style={{ width: `${(monthlySummary.late / monthlySummary.workingDays) * 100}%` }}></div>
                      </div>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Half Days</p>
                      <p className="font-medium text-lg">{monthlySummary.halfDay}</p>
                      <div className="w-full bg-gray-200 rounded-full h-2 mt-1">
                        <div className="bg-yellow-500 h-2 rounded-full" style={{ width: `${(monthlySummary.halfDay / monthlySummary.workingDays) * 100}%` }}></div>
                      </div>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Absent Days</p>
                      <p className="font-medium text-lg">{monthlySummary.absent}</p>
                      <div className="w-full bg-gray-200 rounded-full h-2 mt-1">
                        <div className="bg-red-500 h-2 rounded-full" style={{ width: `${(monthlySummary.absent / monthlySummary.workingDays) * 100}%` }}></div>
                      </div>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Weekends</p>
                      <p className="font-medium text-lg">{monthlySummary.weekendDays}</p>
                    </div>
                    <div className="pt-4 border-t border-gray-200">
                      <p className="text-sm text-gray-500">Total Working Days</p>
                      <p className="font-medium text-lg">{monthlySummary.workingDays}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Attendance Rate</p>
                      <p className="font-medium text-lg">{Math.round((monthlySummary.present / monthlySummary.workingDays) * 100)}%</p>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Right Column - Calendar */}
              <div className="md:col-span-2">
                {/* Month Navigation */}
                <div className="flex justify-between items-center mb-4">
                  <button 
                    onClick={previousMonth}
                    className="p-2 rounded-full hover:bg-gray-200"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  </button>
                  <h3 className="text-lg font-medium">{monthNames[currentMonth]} {currentYear}</h3>
                  <button 
                    onClick={nextMonth}
                    className="p-2 rounded-full hover:bg-gray-200"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
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
                      {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                        <div key={day} className="text-center font-medium text-sm py-2 bg-gray-100">
                          {day}
                        </div>
                      ))}
                    </div>
                    
                    {/* Calendar grid */}
                    <div className="grid grid-cols-7 gap-1">
                      {renderCalendar()}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Attendance Records Table */}
          <h3 className="text-lg font-medium text-gray-900 mb-4">Detailed Attendance Records</h3>
          {loading ? (
            <div className="flex justify-center py-8">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
            </div>
          ) : attendanceRecords.length === 0 ? (
            <div className="text-center py-8">
              <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              <h3 className="mt-2 text-sm font-medium text-gray-900">No attendance records</h3>
              <p className="mt-1 text-sm text-gray-500">No attendance records found for the selected date range.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Check In</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Check Out</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Work Hours</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {attendanceRecords.map((record) => (
                    <tr key={record._id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {formatDate(record.date)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {record.checkIn?.time ? formatTime(record.checkIn.time) : '-'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {record.checkOut?.time ? formatTime(record.checkOut.time) : '-'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {record.workHours ? `${record.workHours} hrs` : '-'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusBadgeClass(record.status)}`}>
                          {record.status.charAt(0).toUpperCase() + record.status.slice(1).replace('-', ' ')}
                        </span>
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

export default AttendanceHistory;