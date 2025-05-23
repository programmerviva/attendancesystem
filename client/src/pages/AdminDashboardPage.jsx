import React, { useState, useEffect } from 'react';
import UserManagement from '../components/Admin/UserManagement';
import LeaveApproval from '../components/Admin/LeaveApproval';
import Dashboard from '../components/Admin/Dashboard';
import Reports from '../components/Admin/Reports';
import Settings from '../components/Admin/Settings';
import { useAuth } from '../context/AuthContext';
import { useNavigate, useLocation } from 'react-router-dom';

function AdminDashboardPage() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('dashboard');
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [showDropdown, setShowDropdown] = useState(false);

  // Check if user is logged in
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/login');
      return;
    }

    // Check for URL query parameters
    const queryParams = new URLSearchParams(location.search);
    const tab = queryParams.get('tab');
    if (tab) {
      setActiveTab(tab);
    }

    // Check for stored leave status
    if (tab === 'leaves') {
      const storedStatus = localStorage.getItem('selectedLeaveStatus');
      if (storedStatus) {
        // Clear it after use
        localStorage.removeItem('selectedLeaveStatus');
      }
    }
  }, [location, navigate]);

  const handleLogout = () => {
    // Remove token and user data from localStorage
    localStorage.removeItem('token');
    localStorage.removeItem('user');

    // Call the logout function from AuthContext
    logout();

    // Navigate to login page
    navigate('/login');
  };

  // Render the active component based on the selected tab
  const renderActiveComponent = () => {
    switch (activeTab) {
      case 'dashboard':
        return <Dashboard />;
      case 'users':
        return <UserManagement />;
      case 'leaves':
        return <LeaveApproval />;
      case 'reports':
        return <Reports />;
      case 'settings':
        return <Settings />;
      default:
        return <Dashboard />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Mobile sidebar backdrop */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-20 bg-black bg-opacity-50 transition-opacity lg:hidden"
          onClick={() => setSidebarOpen(false)}
        ></div>
      )}

      {/* Sidebar */}
      <div
        className={`fixed inset-y-0 left-0 z-30 w-64 bg-blue-800 text-white transform transition duration-300 lg:translate-x-0 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}
      >
        <div className="flex items-center justify-center h-16 border-b border-blue-700">
          <h2 className="text-2xl font-bold">PF Admin</h2>
        </div>
        <nav className="mt-5">
          <button
            className={`flex items-center px-6 py-3 text-white w-full text-left ${activeTab === 'dashboard' ? 'bg-blue-900' : 'hover:bg-blue-700'}`}
            onClick={() => setActiveTab('dashboard')}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5 mr-3"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
              />
            </svg>
            Dashboard
          </button>
          <button
            className={`flex items-center px-6 py-3 text-white w-full text-left ${activeTab === 'users' ? 'bg-blue-900' : 'hover:bg-blue-700'}`}
            onClick={() => setActiveTab('users')}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5 mr-3"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"
              />
            </svg>
            User Management
          </button>
          <button
            className={`flex items-center px-6 py-3 text-white w-full text-left ${activeTab === 'leaves' ? 'bg-blue-900' : 'hover:bg-blue-700'}`}
            onClick={() => setActiveTab('leaves')}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5 mr-3"
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
            Leave Approval
          </button>
          <button
            className={`flex items-center px-6 py-3 text-white w-full text-left ${activeTab === 'reports' ? 'bg-blue-900' : 'hover:bg-blue-700'}`}
            onClick={() => setActiveTab('reports')}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5 mr-3"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
              />
            </svg>
            Reports
          </button>
          <button
            className={`flex items-center px-6 py-3 text-white w-full text-left ${activeTab === 'settings' ? 'bg-blue-900' : 'hover:bg-blue-700'}`}
            onClick={() => setActiveTab('settings')}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5 mr-3"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
              />
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
              />
            </svg>
            Settings
          </button>

          {/* Logout Button */}
          <button
            className="flex items-center px-6 py-3 text-white w-full text-left hover:bg-red-700 mt-4"
            onClick={handleLogout}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5 mr-3"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
              />
            </svg>
            Logout
          </button>
        </nav>
      </div>

      {/* Main Content */}
      <div className="lg:pl-64">
        {/* Header */}
        <header className="bg-white shadow-sm">
          <div className="flex items-center justify-between h-16 px-4 md:px-6">
            <div className="flex items-center">
              <button
                onClick={() => setSidebarOpen(!sidebarOpen)}
                className="text-gray-500 focus:outline-none lg:hidden"
              >
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
                    d="M4 6h16M4 12h16M4 18h7"
                  />
                </svg>
              </button>
              <div className="ml-4 lg:ml-0">
                <h1 className="text-xl font-semibold text-gray-800">Admin Dashboard</h1>
              </div>
            </div>
            <div className="flex items-center">
              <button className="flex mx-4 text-gray-600  focus:outline-none">
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
                    d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
                  />
                </svg>
              </button>
              <div className="relative">
                <button
                  className="flex items-center text-gray-600 focus:outline-none"
                  onClick={() => setShowDropdown(!showDropdown)}
                >
                  <div className="h-8 w-8 rounded-full bg-blue-600 flex items-center justify-center text-white">
                    {user?.fullName?.first?.charAt(0) || 'A'}
                  </div>
                  <span className="ml-2 text-sm font-medium hidden md:block">
                    {user?.fullName?.first || 'Admin User'}
                  </span>
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="ml-1 h-5 w-5 hidden md:block"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M19 9l-7 7-7-7"
                    />
                  </svg>
                </button>

                {/* User Dropdown Menu */}
                {showDropdown && (
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-50">
                    <button
                      onClick={handleLogout}
                      className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    >
                      Logout
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="p-4 md:p-6 lg:p-8">
          {/* Breadcrumbs */}
          <nav className="text-sm font-medium mb-6">
            <ol className="list-none p-0 inline-flex">
              <li className="flex items-center">
                <button
                  onClick={() => setActiveTab('dashboard')}
                  className="text-gray-500 hover:text-blue-600"
                >
                  Home
                </button>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-4 w-4 mx-2 text-gray-400"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 5l7 7-7 7"
                  />
                </svg>
              </li>
              <li className="text-blue-600 capitalize">{activeTab}</li>
            </ol>
          </nav>

          {/* Render the active component */}
          {renderActiveComponent()}
        </main>
      </div>
    </div>
  );
}

export default AdminDashboardPage;
