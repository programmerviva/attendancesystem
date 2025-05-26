import React, { useState, useEffect } from 'react';
import axios from 'axios';
import dayjs from 'dayjs';
import { Bar, Doughnut } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
} from 'chart.js';

// Register ChartJS components
ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, ArcElement);

const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000';

function AttendanceStatsDashboard() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [attendanceData, setAttendanceData] = useState([]);
  const [dateRange, setDateRange] = useState({
    startDate: dayjs().subtract(30, 'day').format('YYYY-MM-DD'),
    endDate: dayjs().format('YYYY-MM-DD'),
  });
  const [stats, setStats] = useState({
    present: 0,
    absent: 0,
    late: 0,
    halfDay: 0,
    total: 0,
  });

  const token = localStorage.getItem('token');

  useEffect(() => {
    fetchAttendanceData();
  }, [dateRange]);

  const fetchAttendanceData = async () => {
    setLoading(true);
    try {
      const response = await axios.get(`${apiUrl}/api/v1/attendance/history`, {
        headers: { Authorization: `Bearer ${token}` },
        params: dateRange,
      });

      const records = response.data.data.attendance || [];
      setAttendanceData(records);

      // Calculate statistics
      const present = records.filter(r => r.status === 'present').length;
      const absent = records.filter(r => r.status === 'absent').length;
      const late = records.filter(r => r.status === 'late').length;
      const halfDay = records.filter(r => r.status === 'half-day').length;

      setStats({
        present,
        absent,
        late,
        halfDay,
        total: records.length
      });

      setError(null);
    } catch (err) {
      console.error('Error fetching attendance data:', err);
      setError('Failed to load attendance data');
    } finally {
      setLoading(false);
    }
  };

  // Prepare data for status distribution chart
  const prepareStatusChartData = () => {
    const labels = ['Present', 'Late', 'Half Day', 'Absent'];
    const data = [stats.present, stats.late, stats.halfDay, stats.absent];
    const backgroundColors = [
      'rgba(75, 192, 92, 0.7)',
      'rgba(54, 162, 235, 0.7)',
      'rgba(255, 206, 86, 0.7)',
      'rgba(255, 99, 132, 0.7)',
    ];

    return {
      labels,
      datasets: [
        {
          data,
          backgroundColor: backgroundColors,
          borderWidth: 1,
        },
      ],
    };
  };

  // Prepare data for weekly attendance chart
  const prepareWeeklyChartData = () => {
    // Group attendance by week day
    const weekDays = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const dayStats = Array(7).fill(0).map(() => ({ present: 0, late: 0, halfDay: 0, absent: 0, total: 0 }));

    attendanceData.forEach(record => {
      const date = dayjs(record.date);
      const dayOfWeek = date.day(); // 0 = Sunday, 6 = Saturday
      
      dayStats[dayOfWeek].total++;
      
      if (record.status === 'present') dayStats[dayOfWeek].present++;
      else if (record.status === 'late') dayStats[dayOfWeek].late++;
      else if (record.status === 'half-day') dayStats[dayOfWeek].halfDay++;
      else if (record.status === 'absent') dayStats[dayOfWeek].absent++;
    });

    return {
      labels: weekDays,
      datasets: [
        {
          label: 'Present',
          data: dayStats.map(day => day.present),
          backgroundColor: 'rgba(75, 192, 92, 0.7)',
        },
        {
          label: 'Late',
          data: dayStats.map(day => day.late),
          backgroundColor: 'rgba(54, 162, 235, 0.7)',
        },
        {
          label: 'Half Day',
          data: dayStats.map(day => day.halfDay),
          backgroundColor: 'rgba(255, 206, 86, 0.7)',
        },
        {
          label: 'Absent',
          data: dayStats.map(day => day.absent),
          backgroundColor: 'rgba(255, 99, 132, 0.7)',
        },
      ],
    };
  };

  // Calculate attendance rate
  const calculateAttendanceRate = () => {
    if (stats.total === 0) return 0;
    return Math.round(((stats.present + stats.late + stats.halfDay) / stats.total) * 100);
  };

  // Calculate punctuality rate
  const calculatePunctualityRate = () => {
    const totalPresent = stats.present + stats.late;
    if (totalPresent === 0) return 0;
    return Math.round((stats.present / totalPresent) * 100);
  };

  return (
    <div className="bg-white shadow-lg rounded-lg overflow-hidden">
      <div className="bg-gradient-to-r from-blue-600 to-blue-800 px-6 py-4">
        <h2 className="text-2xl font-bold text-white">Attendance Statistics</h2>
        <p className="text-blue-100">View your attendance performance</p>
      </div>

      <div className="p-6">
        {/* Date Range Filter */}
        <div className="mb-6 flex flex-wrap gap-4">
          <div>
            <label htmlFor="startDate" className="block text-sm font-medium text-gray-700 mb-1">
              Start Date
            </label>
            <input
              type="date"
              id="startDate"
              value={dateRange.startDate}
              onChange={(e) => setDateRange({ ...dateRange, startDate: e.target.value })}
              className="border border-gray-300 rounded-md shadow-sm px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          <div>
            <label htmlFor="endDate" className="block text-sm font-medium text-gray-700 mb-1">
              End Date
            </label>
            <input
              type="date"
              id="endDate"
              value={dateRange.endDate}
              onChange={(e) => setDateRange({ ...dateRange, endDate: e.target.value })}
              className="border border-gray-300 rounded-md shadow-sm px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          <div className="flex items-end">
            <button
              onClick={fetchAttendanceData}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md shadow-sm"
            >
              Apply
            </button>
          </div>
        </div>

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

        {loading ? (
          <div className="flex justify-center py-8">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
          </div>
        ) : (
          <>
            {/* Key Metrics */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
              <div className="bg-green-50 p-4 rounded-lg shadow-sm">
                <h3 className="text-sm font-medium text-green-800">Present Days</h3>
                <p className="text-2xl font-bold text-green-600">{stats.present}</p>
                <div className="mt-1 text-xs text-green-700">
                  {Math.round((stats.present / stats.total) * 100) || 0}% of total
                </div>
              </div>
              
              <div className="bg-blue-50 p-4 rounded-lg shadow-sm">
                <h3 className="text-sm font-medium text-blue-800">Late Days</h3>
                <p className="text-2xl font-bold text-blue-600">{stats.late}</p>
                <div className="mt-1 text-xs text-blue-700">
                  {Math.round((stats.late / stats.total) * 100) || 0}% of total
                </div>
              </div>
              
              <div className="bg-yellow-50 p-4 rounded-lg shadow-sm">
                <h3 className="text-sm font-medium text-yellow-800">Half Days</h3>
                <p className="text-2xl font-bold text-yellow-600">{stats.halfDay}</p>
                <div className="mt-1 text-xs text-yellow-700">
                  {Math.round((stats.halfDay / stats.total) * 100) || 0}% of total
                </div>
              </div>
              
              <div className="bg-red-50 p-4 rounded-lg shadow-sm">
                <h3 className="text-sm font-medium text-red-800">Absent Days</h3>
                <p className="text-2xl font-bold text-red-600">{stats.absent}</p>
                <div className="mt-1 text-xs text-red-700">
                  {Math.round((stats.absent / stats.total) * 100) || 0}% of total
                </div>
              </div>
            </div>

            {/* Performance Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
              <div className="bg-indigo-50 p-4 rounded-lg shadow-sm">
                <h3 className="text-sm font-medium text-indigo-800">Attendance Rate</h3>
                <div className="flex items-end gap-2">
                  <p className="text-3xl font-bold text-indigo-600">{calculateAttendanceRate()}%</p>
                  <p className="text-sm text-indigo-700 mb-1">days attended</p>
                </div>
                <div className="mt-2 w-full bg-gray-200 rounded-full h-2.5">
                  <div 
                    className="bg-indigo-600 h-2.5 rounded-full" 
                    style={{ width: `${calculateAttendanceRate()}%` }}
                  ></div>
                </div>
              </div>
              
              <div className="bg-purple-50 p-4 rounded-lg shadow-sm">
                <h3 className="text-sm font-medium text-purple-800">Punctuality Rate</h3>
                <div className="flex items-end gap-2">
                  <p className="text-3xl font-bold text-purple-600">{calculatePunctualityRate()}%</p>
                  <p className="text-sm text-purple-700 mb-1">on-time arrivals</p>
                </div>
                <div className="mt-2 w-full bg-gray-200 rounded-full h-2.5">
                  <div 
                    className="bg-purple-600 h-2.5 rounded-full" 
                    style={{ width: `${calculatePunctualityRate()}%` }}
                  ></div>
                </div>
              </div>
            </div>

            {/* Charts */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="bg-white p-4 rounded-lg shadow border border-gray-200">
                <h3 className="text-lg font-medium text-gray-800 mb-4">Attendance Distribution</h3>
                <div className="h-64">
                  <Doughnut 
                    data={prepareStatusChartData()} 
                    options={{
                      responsive: true,
                      maintainAspectRatio: false,
                      plugins: {
                        legend: {
                          position: 'right',
                        },
                      },
                    }}
                  />
                </div>
              </div>
              
              <div className="bg-white p-4 rounded-lg shadow border border-gray-200">
                <h3 className="text-lg font-medium text-gray-800 mb-4">Weekly Attendance Pattern</h3>
                <div className="h-64">
                  <Bar 
                    data={prepareWeeklyChartData()} 
                    options={{
                      responsive: true,
                      maintainAspectRatio: false,
                      scales: {
                        x: {
                          stacked: true,
                        },
                        y: {
                          stacked: true,
                          beginAtZero: true,
                        },
                      },
                    }}
                  />
                </div>
              </div>
            </div>

            {/* Insights Section */}
            <div className="mt-8 bg-blue-50 p-4 rounded-lg">
              <h3 className="text-lg font-medium text-blue-800 mb-2">Attendance Insights</h3>
              <ul className="space-y-2">
                {stats.late > (stats.total * 0.2) && (
                  <li className="flex items-start">
                    <svg className="h-5 w-5 text-blue-600 mr-2 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zm-1 9a1 1 0 01-1-1v-4a1 1 0 112 0v4a1 1 0 01-1 1z" clipRule="evenodd" />
                    </svg>
                    <span className="text-blue-700">You have been late {stats.late} times in this period. Try to arrive earlier to improve your punctuality.</span>
                  </li>
                )}
                
                {calculateAttendanceRate() < 80 && (
                  <li className="flex items-start">
                    <svg className="h-5 w-5 text-blue-600 mr-2 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zm-1 9a1 1 0 01-1-1v-4a1 1 0 112 0v4a1 1 0 01-1 1z" clipRule="evenodd" />
                    </svg>
                    <span className="text-blue-700">Your attendance rate is below 80%. Regular attendance is important for consistent performance.</span>
                  </li>
                )}
                
                {calculateAttendanceRate() > 90 && (
                  <li className="flex items-start">
                    <svg className="h-5 w-5 text-green-600 mr-2 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    <span className="text-green-700">Great job! Your attendance rate is above 90%, showing excellent commitment.</span>
                  </li>
                )}
                
                {stats.present > 0 && stats.total > 0 && (
                  <li className="flex items-start">
                    <svg className="h-5 w-5 text-blue-600 mr-2 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zm-1 9a1 1 0 01-1-1v-4a1 1 0 112 0v4a1 1 0 01-1 1z" clipRule="evenodd" />
                    </svg>
                    <span className="text-blue-700">You were present for {stats.present} out of {stats.total} working days in this period.</span>
                  </li>
                )}
              </ul>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

export default AttendanceStatsDashboard;