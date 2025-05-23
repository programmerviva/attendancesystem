import React, { useState } from 'react';
import AttendanceForm from '../components/Attendance/AttendanceForm';
import AttendanceHistory from '../components/Attendance/AttendanceHistory';
import { useNavigate } from 'react-router-dom';

function AttendancePage() {
  const [activeTab, setActiveTab] = useState('mark');
  const navigate = useNavigate();

  // Check if user is logged in
  const token = localStorage.getItem('token');
  const user = localStorage.getItem('user') ? JSON.parse(localStorage.getItem('user')) : null;

  if (!token || !user) {
    navigate('/login');
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 py-6 sm:px-6 lg:px-8 flex justify-between items-center">
          <h1 className="text-3xl font-bold text-gray-900">Attendance Management</h1>
          <div className="flex items-center">
            <span className="mr-4 text-gray-700">{user?.fullName?.first || 'Employee'}</span>
            <button
              onClick={() => navigate('/employee/dashboard')}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md text-sm font-medium"
            >
              Dashboard
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 py-6 sm:px-6 lg:px-8">
        {/* Tabs */}
        <div className="mb-6 border-b border-gray-200">
          <nav className="-mb-px flex space-x-8">
            <button
              onClick={() => setActiveTab('mark')}
              className={`${
                activeTab === 'mark'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
            >
              Mark Attendance
            </button>
            <button
              onClick={() => setActiveTab('history')}
              className={`${
                activeTab === 'history'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
            >
              Attendance History
            </button>
          </nav>
        </div>

        {/* Content based on active tab */}
        {activeTab === 'mark' ? <AttendanceForm /> : <AttendanceHistory />}
      </main>
    </div>
  );
}

export default AttendancePage;
