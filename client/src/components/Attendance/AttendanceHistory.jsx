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

  const token = localStorage.getItem('token');

  useEffect(() => {
    fetchAttendanceHistory();
  }, [dateRange]);

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

  return (
    <div className="max-w-4xl mx-auto p-6">
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

          {/* Attendance Records Table */}
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