import React, { useState } from 'react';
import axios from 'axios';
import dayjs from 'dayjs';
import SimpleAttendanceCalendar from './SimpleAttendanceCalendar';
import CustomReport from './CustomReport';

function Reports() {
  const [activeReport, setActiveReport] = useState('attendance');
  const [dateRange, setDateRange] = useState({
    startDate: dayjs().subtract(7, 'day').format('YYYY-MM-DD'),
    endDate: dayjs().format('YYYY-MM-DD')
  });
  const [reportData, setReportData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [reportGenerated, setReportGenerated] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState(null);

  const token = localStorage.getItem('token');

  const generateReport = async () => {
    setLoading(true);
    setError(null);
    
    try {
      let endpoint = '';
      
      switch (activeReport) {
        case 'attendance':
          endpoint = 'http://localhost:5000/api/v1/attendance/all';
          break;
        case 'leave':
          endpoint = 'http://localhost:5000/api/v1/leaves/all';
          break;
        case 'department':
          endpoint = 'http://localhost:5000/api/v1/users';
          break;
        default:
          endpoint = 'http://localhost:5000/api/v1/attendance/all';
      }
      
      const response = await axios.get(endpoint, {
        headers: { Authorization: `Bearer ${token}` },
        params: dateRange
      });
      
      if (activeReport === 'attendance') {
        setReportData(response.data.data.attendance || []);
      } else if (activeReport === 'leave') {
        setReportData(response.data.data.leaves || []);
      } else if (activeReport === 'department') {
        setReportData(response.data.data.users || []);
      } else {
        setReportData(response.data.data.attendance || []);
      }
      
      setReportGenerated(true);
    } catch (err) {
      console.error('Error generating report:', err);
      setError(err.response?.data?.message || 'Failed to generate report');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    return dayjs(dateString).format('MMM DD, YYYY');
  };

  const formatTime = (dateString) => {
    if (!dateString) return '-';
    return dayjs(dateString).format('hh:mm A');
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
      case 'approved':
        return 'bg-green-100 text-green-800';
      case 'rejected':
        return 'bg-red-100 text-red-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const exportToCSV = () => {
    if (reportData.length === 0) return;
    
    let headers = [];
    let csvData = [];
    
    if (activeReport === 'attendance') {
      headers = ['Employee', 'Date', 'Check In', 'Check Out', 'Work Hours', 'Status'];
      csvData = reportData.map(record => [
        record.user?.fullName?.first + ' ' + record.user?.fullName?.last,
        formatDate(record.date),
        record.checkIn?.time ? formatTime(record.checkIn.time) : '-',
        record.checkOut?.time ? formatTime(record.checkOut.time) : '-',
        record.workHours || '-',
        record.status
      ]);
    } else if (activeReport === 'leave') {
      headers = ['Employee', 'Leave Type', 'Start Date', 'End Date', 'Status', 'Reason'];
      csvData = reportData.map(record => [
        record.user?.fullName?.first + ' ' + record.user?.fullName?.last,
        record.leaveType,
        formatDate(record.startDate),
        formatDate(record.endDate),
        record.status,
        record.reason
      ]);
    } else if (activeReport === 'department') {
      headers = ['Employee', 'Email', 'Department', 'Designation', 'Role'];
      csvData = reportData.map(record => [
        record.fullName?.first + ' ' + record.fullName?.last,
        record.email,
        record.department,
        record.designation,
        record.role
      ]);
    }
    
    const csvContent = [
      headers.join(','),
      ...csvData.map(row => row.join(','))
    ].join('\n');
    
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `${activeReport}_report_${dateRange.startDate}_to_${dateRange.endDate}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleEmployeeClick = (employeeId) => {
    setSelectedEmployee(employeeId);
  };

  const renderAttendanceReport = () => {
    return (
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Employee</th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Check In</th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Check Out</th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Work Hours</th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {reportData.map((record) => (
            <tr key={record._id} className="hover:bg-gray-50">
              <td className="px-6 py-4 whitespace-nowrap">
                <div 
                  className="flex items-center cursor-pointer hover:text-blue-600"
                  onClick={() => handleEmployeeClick(record.user?._id)}
                >
                  <div className="flex-shrink-0 h-10 w-10 bg-gray-200 rounded-full flex items-center justify-center">
                    <span className="text-gray-600 font-medium">
                      {record.user?.fullName?.first?.charAt(0) || '?'}{record.user?.fullName?.last?.charAt(0) || '?'}
                    </span>
                  </div>
                  <div className="ml-4">
                    <div className="text-sm font-medium text-gray-900">
                      {record.user?.fullName?.first || ''} {record.user?.fullName?.last || ''}
                    </div>
                    <div className="text-sm text-gray-500">
                      {record.user?.email || 'No email provided'}
                    </div>
                  </div>
                </div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
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
    );
  };

  const renderLeaveReport = () => {
    return (
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Employee</th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Leave Type</th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Duration</th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Reason</th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {reportData.map((record) => (
            <tr key={record._id} className="hover:bg-gray-50">
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="flex items-center">
                  <div className="flex-shrink-0 h-10 w-10 bg-gray-200 rounded-full flex items-center justify-center">
                    <span className="text-gray-600 font-medium">
                      {record.user?.fullName?.first?.charAt(0) || '?'}{record.user?.fullName?.last?.charAt(0) || '?'}
                    </span>
                  </div>
                  <div className="ml-4">
                    <div className="text-sm font-medium text-gray-900">
                      {record.user?.fullName?.first || ''} {record.user?.fullName?.last || ''}
                    </div>
                    <div className="text-sm text-gray-500">
                      {record.user?.email || 'No email provided'}
                    </div>
                  </div>
                </div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <span className="px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800">
                  {record.leaveType.charAt(0).toUpperCase() + record.leaveType.slice(1)}
                </span>
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                <div>
                  {formatDate(record.startDate)} - {formatDate(record.endDate)}
                </div>
                <div className="text-xs text-gray-500 mt-1">
                  {dayjs(record.endDate).diff(dayjs(record.startDate), 'day') + 1} days
                </div>
              </td>
              <td className="px-6 py-4">
                <div className="text-sm text-gray-900 max-w-xs truncate">
                  {record.reason}
                </div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusBadgeClass(record.status)}`}>
                  {record.status.charAt(0).toUpperCase() + record.status.slice(1)}
                </span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    );
  };

  const renderDepartmentReport = () => {
    return (
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Employee</th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Department</th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Designation</th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Role</th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {reportData.map((record) => (
            <tr key={record._id} className="hover:bg-gray-50">
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="flex items-center">
                  <div className="flex-shrink-0 h-10 w-10 bg-gray-200 rounded-full flex items-center justify-center">
                    <span className="text-gray-600 font-medium">
                      {record.fullName?.first?.charAt(0) || '?'}{record.fullName?.last?.charAt(0) || '?'}
                    </span>
                  </div>
                  <div className="ml-4">
                    <div className="text-sm font-medium text-gray-900">
                      {record.fullName?.first || ''} {record.fullName?.last || ''}
                    </div>
                  </div>
                </div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                {record.email}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                {record.department}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                {record.designation}
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                  record.role === 'admin' 
                    ? 'bg-purple-100 text-purple-800' 
                    : record.role === 'subadmin' 
                    ? 'bg-blue-100 text-blue-800' 
                    : 'bg-green-100 text-green-800'
                }`}>
                  {record.role.charAt(0).toUpperCase() + record.role.slice(1)}
                </span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    );
  };

  const renderCustomReport = () => {
    return <CustomReport />;
  };

  const renderActiveReport = () => {
    if (!reportGenerated || reportData.length === 0) {
      if (activeReport === 'custom') {
        return renderCustomReport();
      }
      
      return (
        <div className="text-center py-8 bg-gray-50 rounded-lg">
          <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          <h3 className="mt-2 text-sm font-medium text-gray-900">No report generated</h3>
          <p className="mt-1 text-sm text-gray-500">Select a date range and click "Generate Report" to view data.</p>
        </div>
      );
    }

    switch (activeReport) {
      case 'attendance':
        return renderAttendanceReport();
      case 'leave':
        return renderLeaveReport();
      case 'department':
        return renderDepartmentReport();
      case 'custom':
        return renderCustomReport();
      default:
        return renderAttendanceReport();
    }
  };

  return (
    <div>
      <div className="bg-white rounded-lg shadow-lg overflow-hidden">
        <div className="bg-gradient-to-r from-blue-600 to-blue-800 px-6 py-4">
          <h2 className="text-2xl font-bold text-white">Reports Dashboard</h2>
          <p className="text-blue-100">View and generate reports</p>
        </div>

        <div className="p-6">
          {/* Report Type Selection */}
          <div className="mb-6 border-b border-gray-200">
            <nav className="-mb-px flex space-x-8">
              <button
                onClick={() => {
                  setActiveReport('attendance');
                  setReportGenerated(false);
                }}
                className={`${
                  activeReport === 'attendance'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
              >
                Attendance Report
              </button>
              <button
                onClick={() => {
                  setActiveReport('leave');
                  setReportGenerated(false);
                }}
                className={`${
                  activeReport === 'leave'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
              >
                Leave Report
              </button>
              <button
                onClick={() => {
                  setActiveReport('department');
                  setReportGenerated(false);
                }}
                className={`${
                  activeReport === 'department'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
              >
                Department Report
              </button>
              <button
                onClick={() => {
                  setActiveReport('custom');
                  setReportGenerated(false);
                }}
                className={`${
                  activeReport === 'custom'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
              >
                Custome Report
              </button>
            </nav>
          </div>

          {/* Date Range Selection */}
          {activeReport !== 'custom' && (
            <div className="mb-6 bg-gray-50 p-4 rounded-lg">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label htmlFor="startDate" className="block text-sm font-medium text-gray-700 mb-1">Start Date</label>
                  <input
                    type="date"
                    id="startDate"
                    value={dateRange.startDate}
                    onChange={(e) => setDateRange({ ...dateRange, startDate: e.target.value })}
                    className="border border-gray-300 rounded-md shadow-sm px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500 w-full"
                  />
                </div>
                <div>
                  <label htmlFor="endDate" className="block text-sm font-medium text-gray-700 mb-1">End Date</label>
                  <input
                    type="date"
                    id="endDate"
                    value={dateRange.endDate}
                    onChange={(e) => setDateRange({ ...dateRange, endDate: e.target.value })}
                    className="border border-gray-300 rounded-md shadow-sm px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500 w-full"
                  />
                </div>
                <div className="flex items-end">
                  <button
                    onClick={generateReport}
                    disabled={loading}
                    className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-md shadow-sm transition-colors w-full"
                  >
                    {loading ? 'Generating...' : 'Generate Report'}
                  </button>
                </div>
              </div>
            </div>
          )}
          
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
          
          {/* Report Results */}
          {loading ? (
            <div className="flex justify-center py-8">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
            </div>
          ) : (
            <>
              {reportGenerated && reportData.length > 0 && activeReport !== 'custom' && (
                <div className="flex justify-end mb-4">
                  <button
                    onClick={exportToCSV}
                    className="bg-green-600 hover:bg-green-700 text-white font-medium py-2 px-4 rounded-md shadow-sm transition-colors flex items-center"
                  >
                    <svg className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                    </svg>
                    Export to CSV
                  </button>
                </div>
              )}
              
              <div className="overflow-x-auto">
                {renderActiveReport()}
              </div>
            </>
          )}
        </div>
      </div>

      {/* Employee Attendance Calendar Modal */}
      {selectedEmployee && (
        <SimpleAttendanceCalendar 
          employeeId={selectedEmployee} 
          onClose={() => setSelectedEmployee(null)} 
        />
      )}
    </div>
  );
}

export default Reports;