import React, { useState } from 'react';
import LeaveRequestForm from '../components/Leave/LeaveRequestForm';
import LeaveRequestStatus from '../components/Leave/LeaveRequestStatus';
import { useNavigate } from 'react-router-dom';

function LeavePage() {
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const navigate = useNavigate();
  
  // Check if user is logged in
  const token = localStorage.getItem('token');
  const user = localStorage.getItem('user') ? JSON.parse(localStorage.getItem('user')) : null;
  
  if (!token || !user) {
    navigate('/login');
    return null;
  }

  const handleLeaveSubmitted = (leaveData) => {
    // Trigger a refresh of the leave request status component
    setRefreshTrigger(prev => prev + 1);
  };

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 py-6 sm:px-6 lg:px-8 flex justify-between items-center">
          <h1 className="text-3xl font-bold text-gray-900">Leave Management</h1>
          <div className="flex items-center">
            <span className="mr-4 text-gray-700">
              {user?.fullName?.first || 'Employee'}
            </span>
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
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          <div>
            <LeaveRequestForm onLeaveSubmitted={handleLeaveSubmitted} />
          </div>
          <div>
            <LeaveRequestStatus refreshTrigger={refreshTrigger} />
          </div>
        </div>
      </main>
    </div>
  );
}

export default LeavePage;