import React, { useState, useEffect } from 'react';
import axios from 'axios';
import dayjs from 'dayjs';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';
import { Doughnut } from 'react-chartjs-2';
import config from '../config';

// Register ChartJS components
ChartJS.register(ArcElement, Tooltip, Legend);

function AttendanceStats() {
  const [stats, setStats] = useState({
    present: 0,
    absent: 0,
    late: 0,
    halfDay: 0,
    total: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [period, setPeriod] = useState('month'); // 'week', 'month', 'year'

  useEffect(() => {
    fetchAttendanceStats();
  }, [period]);

  const fetchAttendanceStats = async () => {
    setLoading(true);
    try {
      // Calculate date range based on selected period
      let startDate, endDate;
      const today = dayjs();
      
      switch (period) {
        case 'week':
          startDate = today.subtract(7, 'day').format('YYYY-MM-DD');
          endDate = today.format('YYYY-MM-DD');
          break;
        case 'month':
          startDate = today.subtract(30, 'day').format('YYYY-MM-DD');
          endDate = today.format('YYYY-MM-DD');
          break;
        case 'year':
          startDate = today.subtract(365, 'day').format('YYYY-MM-DD');
          endDate = today.format('YYYY-MM-DD');
          break;
        default:
          startDate = today.subtract(30, 'day').format('YYYY-MM-DD');
          endDate = today.format('YYYY-MM-DD');
      }

      const token = localStorage.getItem('token');
      const response = await axios.get(`${config.API_URL}/api/v1/attendance/history`, {
        headers: { Authorization: `Bearer ${token}` },
        params: { startDate, endDate },
      });

      const attendanceData = response.data.data.attendance || [];
      
      // Calculate statistics
      const present = attendanceData.filter(record => record.status === 'present').length;
      const absent = attendanceData.filter(record => record.status === 'absent').length;
      const late = attendanceData.filter(record => record.status === 'late').length;
      const halfDay = attendanceData.filter(record => record.status === 'half-day').length;
      
      setStats({
        present,
        absent,
        late,
        halfDay,
        total: attendanceData.length
      });
      
      setError(null);
    } catch (err) {
      console.error('Error fetching attendance stats:', err);
      setError('Failed to load attendance statistics');
    } finally {
      setLoading(false);
    }
  };

  // Prepare chart data
  const chartData = {
    labels: ['Present', 'Late', 'Half Day', 'Absent'],
    datasets: [
      {
        data: [stats.present, stats.late, stats.halfDay, stats.absent],
        backgroundColor: [
          'rgba(75, 192, 192, 0.6)', // Green for present
          'rgba(54, 162, 235, 0.6)', // Blue for late
          'rgba(255, 206, 86, 0.6)', // Yellow for half day
          'rgba(255, 99, 132, 0.6)', // Red for absent
        ],
        borderColor: [
          'rgba(75, 192, 192, 1)',
          'rgba(54, 162, 235, 1)',
          'rgba(255, 206, 86, 1)',
          'rgba(255, 99, 132, 1)',
        ],
        borderWidth: 1,
      },
    ],
  };

  // Chart options
  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom',
        labels: {
          usePointStyle: true,
          padding: 20,
        },
      },
      tooltip: {
        callbacks: {
          label: function(context) {
            const label = context.label || '';
            const value = context.raw || 0;
            const total = context.dataset.data.reduce((a, b) => a + b, 0);
            const percentage = total > 0 ? Math.round((value / total) * 100) : 0;
            return `${label}: ${value} (${percentage}%)`;
          }
        }
      }
    },
  };

  // Calculate attendance rate
  const calculateAttendanceRate = () => {
    if (stats.total === 0) return 0;
    return Math.round((stats.present / stats.total) * 100);
  };

  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-semibold text-gray-800">Attendance Statistics</h2>
        <div className="flex space-x-2">
          <button
            onClick={() => setPeriod('week')}
            className={`px-3 py-1 text-sm rounded-md ${
              period === 'week'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            Week
          </button>
          <button
            onClick={() => setPeriod('month')}
            className={`px-3 py-1 text-sm rounded-md ${
              period === 'month'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            Month
          </button>
          <button
            onClick={() => setPeriod('year')}
            className={`px-3 py-1 text-sm rounded-md ${
              period === 'year'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            Year
          </button>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-4 rounded-md">
          <p className="text-sm text-red-700">{error}</p>
        </div>
      )}

      {loading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Chart */}
          <div className="md:col-span-1">
            <div className="h-64">
              <Doughnut data={chartData} options={chartOptions} />
            </div>
          </div>

          {/* Stats */}
          <div className="md:col-span-2">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-green-50 p-4 rounded-lg">
                <h3 className="text-sm font-medium text-green-800">Present</h3>
                <p className="text-2xl font-bold text-green-600">{stats.present}</p>
                <div className="mt-1 text-xs text-green-700">
                  {stats.total > 0 ? Math.round((stats.present / stats.total) * 100) : 0}% of total
                </div>
              </div>

              <div className="bg-blue-50 p-4 rounded-lg">
                <h3 className="text-sm font-medium text-blue-800">Late</h3>
                <p className="text-2xl font-bold text-blue-600">{stats.late}</p>
                <div className="mt-1 text-xs text-blue-700">
                  {stats.total > 0 ? Math.round((stats.late / stats.total) * 100) : 0}% of total
                </div>
              </div>

              <div className="bg-yellow-50 p-4 rounded-lg">
                <h3 className="text-sm font-medium text-yellow-800">Half Day</h3>
                <p className="text-2xl font-bold text-yellow-600">{stats.halfDay}</p>
                <div className="mt-1 text-xs text-yellow-700">
                  {stats.total > 0 ? Math.round((stats.halfDay / stats.total) * 100) : 0}% of total
                </div>
              </div>

              <div className="bg-red-50 p-4 rounded-lg">
                <h3 className="text-sm font-medium text-red-800">Absent</h3>
                <p className="text-2xl font-bold text-red-600">{stats.absent}</p>
                <div className="mt-1 text-xs text-red-700">
                  {stats.total > 0 ? Math.round((stats.absent / stats.total) * 100) : 0}% of total
                </div>
              </div>
            </div>

            <div className="mt-6 bg-blue-50 p-4 rounded-lg">
              <div className="flex justify-between items-center">
                <h3 className="text-sm font-medium text-blue-800">Overall Attendance Rate</h3>
                <span className="text-xl font-bold text-blue-600">{calculateAttendanceRate()}%</span>
              </div>
              <div className="mt-2 w-full bg-blue-200 rounded-full h-2.5">
                <div
                  className="bg-blue-600 h-2.5 rounded-full"
                  style={{ width: `${calculateAttendanceRate()}%` }}
                ></div>
              </div>
              <p className="mt-2 text-xs text-blue-700">
                Based on {stats.total} recorded days in the selected period
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default AttendanceStats;