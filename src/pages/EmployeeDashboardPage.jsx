// ... existing imports ...
import { FaUser, FaSignOutAlt, FaCalendarCheck, FaClipboardList } from 'react-icons/fa';

function EmployeeDashboardPage() {
  // ... existing state and useEffect ...

  return (
    <div className="min-h-screen bg-gray-100">
      <header className="bg-gradient-to-r from-blue-500 to-blue-600 shadow-lg">
        <div className="max-w-7xl mx-auto px-4 py-6 sm:px-6 lg:px-8 flex justify-between items-center">
          <h1 className="text-4xl font-bold text-white">Employee Dashboard</h1>
          <div className="flex items-center">
            <span className="mr-4 text-white text-lg">
              Welcome, {user?.fullName?.first || 'Employee'}
            </span>
            <button 
              onClick={() => {
                localStorage.removeItem('token');
                localStorage.removeItem('user');
                navigate('/login');
              }}
              className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-md text-sm font-medium flex items-center"
            >
              <FaSignOutAlt className="mr-2" /> Logout
            </button>
          </div>
        </div>
      </header>
      
      <main className="max-w-7xl mx-auto px-4 py-6 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          {/* Attendance Card */}
          <div className="bg-white overflow-hidden shadow-lg rounded-lg transition-transform transform hover:scale-105">
            <div className="px-4 py-5 sm:p-6">
              <h3 className="text-lg font-medium text-gray-900">Today's Attendance</h3>
              <div className="mt-5">
                {todayAttendance ? (
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-gray-500">Check-In</p>
                      <p className="text-xl font-semibold text-gray-800">
                        {todayAttendance.checkIn?.time ? formatTime(todayAttendance.checkIn.time) : 'Not checked in'}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Check-Out</p>
                      <p className="text-xl font-semibold text-gray-800">
                        {todayAttendance.checkOut?.time ? formatTime(todayAttendance.checkOut.time) : 'Not checked out'}
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-4">
                    <p className="text-gray-500">No attendance record for today</p>
                  </div>
                )}
                <div className="mt-5">
                  <button 
                    className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md text-sm font-medium w-full flex items-center justify-center"
                    onClick={() => navigate('/attendance')}
                  >
                    <FaClipboardList className="mr-2" />
                    {!todayAttendance?.checkIn ? 'Check In' : 
                     !todayAttendance?.checkOut ? 'Check Out' : 'View Attendance'}
                  </button>
                </div>
              </div>
            </div>
          </div>
          
          {/* Profile Card */}
          <div className="bg-white overflow-hidden shadow-lg rounded-lg transition-transform transform hover:scale-105">
            <div className="px-4 py-5 sm:p-6">
              <h3 className="text-lg font-medium text-gray-900">My Profile</h3>
              <div className="mt-3">
                <p className="text-sm text-gray-600">Name: {user?.fullName?.first} {user?.fullName?.last}</p>
                <p className="text-sm text-gray-600">Email: {user?.email}</p>
                <p className="text-sm text-gray-600">Department: {user?.department}</p>
                <p className="text-sm text-gray-600">Designation: {user?.designation}</p>
                <p className="text-sm text-gray-600">Joining Date: {user?.joiningDate ? formatDate(user.joiningDate) : 'Not available'}</p>
                <p className="text-sm text-gray-600">Address: {user?.address || '-'}</p>
                <div className="mt-5">
                  <button 
                    className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-md text-sm font-medium w-full flex items-center justify-center"
                    onClick={() => setShowProfileModal(true)}
                  >
                    <FaUser className="mr-2" /> Edit Profile
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Tabs and other components remain unchanged */}
      </main>
    </div>
  );
}

export default EmployeeDashboardPage;
