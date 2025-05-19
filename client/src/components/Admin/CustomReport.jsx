import React, { useState, useEffect } from 'react';
import axios from 'axios';
import dayjs from 'dayjs';
import { Bar, Pie } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, ArcElement } from 'chart.js';

// Register ChartJS components
ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, ArcElement);

function CustomReport() {
  const [dateRange, setDateRange] = useState({
    startDate: dayjs().subtract(30, 'day').format('YYYY-MM-DD'),
    endDate: dayjs().format('YYYY-MM-DD')
  });
  const [departments, setDepartments] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [filters, setFilters] = useState({
    department: '',
    employee: '',
    status: ''
  });
  const [reportData, setReportData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [reportGenerated, setReportGenerated] = useState(false);

  const token = localStorage.getItem('token');

  // Fetch departments and employees on component mount
  useEffect(() => {
    const fetchDepartmentsAndEmployees = async () => {
      try {
        const response = await axios.get('http://localhost:5000/api/v1/users', {
          headers: { Authorization: `Bearer ${token}` }
        });
        
        const users = response.data.data.users || [];
        
        // Extract unique departments
        const uniqueDepartments = [...new Set(users.map(user => user.department))];
        setDepartments(uniqueDepartments);
        
        // Set all employees
        setEmployees(users);
      } catch (err) {
        console.error('Error fetching departments and employees:', err);
        setError(err.response?.data?.message || 'Failed to fetch departments and employees');
      }
    };

    fetchDepartmentsAndEmployees();
  }, [token]);

  // Filter employees when department changes
  useEffect(() => {
    if (filters.department) {
      const filteredEmployees = employees.filter(emp => emp.department === filters.department);
      if (filteredEmployees.length > 0 && filters.employee) {
        // Check if the currently selected employee is in the filtered list
        const employeeExists = filteredEmployees.some(emp => emp._id === filters.employee);
        if (!employeeExists) {
          // Reset employee selection if not in the filtered department
          setFilters(prev => ({ ...prev, employee: '' }));
        }
      }
    }
  }, [filters.department, employees, filters.employee]);

  const generateReport = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const params = {
        startDate: dateRange.startDate,
        endDate: dateRange.endDate
      };
      
      const response = await axios.get('http://localhost:5000/api/v1/attendance/all', {
        headers: { Authorization: `Bearer ${token}` },
        params
      });
      
      let attendanceData = response.data.data.attendance || [];
      
      // Apply filters
      if (filters.department) {
        attendanceData = attendanceData.filter(record => 
          record.user && record.user.department === filters.department
        );
      }
      
      if (filters.employee) {
        attendanceData = attendanceData.filter(record => 
          record.user && record.user._id === filters.employee
        );
      }
      
      if (filters.status) {
        attendanceData = attendanceData.filter(record => record.status === filters.status);
      }
      
      setReportData(attendanceData);
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
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const exportToCSV = () => {
    if (reportData.length === 0) return;
    
    const headers = ['Employee', 'Department', 'Date', 'Check In', 'Check Out', 'Work Hours', 'Status'];
    const csvData = reportData.map(record => [
      record.user?.fullName?.first + ' ' + record.user?.fullName?.last,
      record.user?.department || '-',
      formatDate(record.date),
      record.checkIn?.time ? formatTime(record.checkIn.time) : '-',
      record.checkOut?.time ? formatTime(record.checkOut.time) : '-',
      record.workHours || '-',
      record.status
    ]);
    
    const csvContent = [
      headers.join(','),
      ...csvData.map(row => row.join(','))
    ].join('\n');
    
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `custom_report_${dateRange.startDate}_to_${dateRange.endDate}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Prepare data for status distribution chart
  const prepareStatusChartData = () => {
    if (!reportData.length) return null;
    
    const statusCounts = {};
    reportData.forEach(record => {
      statusCounts[record.status] = (statusCounts[record.status] || 0) + 1;
    });
    
    const statusLabels = Object.keys(statusCounts);
    const statusData = Object.values(statusCounts);
    
    const backgroundColors = [
      'rgba(75, 192, 192, 0.6)',
      'rgba(255, 99, 132, 0.6)',
      'rgba(255, 206, 86, 0.6)',
      'rgba(255, 159, 64, 0.6)',
      'rgba(153, 102, 255, 0.6)',
      'rgba(54, 162, 235, 0.6)'
    ];
    
    return {
      labels: statusLabels.map(status => status.charAt(0).toUpperCase() + status.slice(1).replace('-', ' ')),
      datasets: [
        {
          data: statusData,
          backgroundColor: backgroundColors.slice(0, statusLabels.length),
          borderWidth: 1
        }
      ]
    };
  };

  // Prepare data for department attendance chart
  const prepareDepartmentChartData = () => {
    if (!reportData.length) return null;
    
    const deptAttendance = {};
    
    reportData.forEach(record => {
      const dept = record.user?.department || 'Unknown';
      if (!deptAttendance[dept]) {
        deptAttendance[dept] = {
          present: 0,
          absent: 0,
          late: 0,
          'half-day': 0,
          'early-leave': 0,
          'on-leave': 0
        };
      }
      deptAttendance[dept][record.status] = (deptAttendance[dept][record.status] || 0) + 1;
    });
    
    const departments = Object.keys(deptAttendance);
    const statuses = ['present', 'absent', 'late', 'half-day', 'early-leave', 'on-leave'];
    
    const datasets = statuses.map((status, index) => {
      const colors = [
        'rgba(75, 192, 192, 0.6)',
        'rgba(255, 99, 132, 0.6)',
        'rgba(255, 159, 64, 0.6)',
        'rgba(255, 206, 86, 0.6)',
        'rgba(153, 102, 255, 0.6)',
        'rgba(54, 162, 235, 0.6)'
      ];
      
      return {
        label: status.charAt(0).toUpperCase() + status.slice(1).replace('-', ' '),
        data: departments.map(dept => deptAttendance[dept][status] || 0),
        backgroundColor: colors[index % colors.length]
      };
    });
    
    return {
      labels: departments,
      datasets
    };
  };

  const renderAttendanceTable = () => {
    return (
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Employee</th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Department</th>
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
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                {record.user?.department || '-'}
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

  const statusChartData = prepareStatusChartData();
  const departmentChartData = prepareDepartmentChartData();

  return (
    <div>
      <div className="mb-6 bg-gray-50 p-4 rounded-lg">
        <h3 className="text-lg font-medium text-gray-900 mb-4">कस्टम रिपोर्ट फिल्टर</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-4">
          {/* Date Range Selection */}
          <div>
            <label htmlFor="startDate" className="block text-sm font-medium text-gray-700 mb-1">प्रारंभ तिथि</label>
            <input
              type="date"
              id="startDate"
              value={dateRange.startDate}
              onChange={(e) => setDateRange({ ...dateRange, startDate: e.target.value })}
              className="border border-gray-300 rounded-md shadow-sm px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500 w-full"
            />
          </div>
          <div>
            <label htmlFor="endDate" className="block text-sm font-medium text-gray-700 mb-1">अंतिम तिथि</label>
            <input
              type="date"
              id="endDate"
              value={dateRange.endDate}
              onChange={(e) => setDateRange({ ...dateRange, endDate: e.target.value })}
              className="border border-gray-300 rounded-md shadow-sm px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500 w-full"
            />
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-4">
          {/* Department Filter */}
          <div>
            <label htmlFor="department" className="block text-sm font-medium text-gray-700 mb-1">विभाग</label>
            <select
              id="department"
              value={filters.department}
              onChange={(e) => setFilters({ ...filters, department: e.target.value })}
              className="border border-gray-300 rounded-md shadow-sm px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500 w-full"
            >
              <option value="">सभी विभाग</option>
              {departments.map((dept, index) => (
                <option key={index} value={dept}>{dept}</option>
              ))}
            </select>
          </div>
          
          {/* Employee Filter */}
          <div>
            <label htmlFor="employee" className="block text-sm font-medium text-gray-700 mb-1">कर्मचारी</label>
            <select
              id="employee"
              value={filters.employee}
              onChange={(e) => setFilters({ ...filters, employee: e.target.value })}
              className="border border-gray-300 rounded-md shadow-sm px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500 w-full"
            >
              <option value="">सभी कर्मचारी</option>
              {employees
                .filter(emp => !filters.department || emp.department === filters.department)
                .map((emp) => (
                  <option key={emp._id} value={emp._id}>
                    {emp.fullName.first} {emp.fullName.last}
                  </option>
                ))}
            </select>
          </div>
          
          {/* Status Filter */}
          <div>
            <label htmlFor="status" className="block text-sm font-medium text-gray-700 mb-1">उपस्थिति स्थिति</label>
            <select
              id="status"
              value={filters.status}
              onChange={(e) => setFilters({ ...filters, status: e.target.value })}
              className="border border-gray-300 rounded-md shadow-sm px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500 w-full"
            >
              <option value="">सभी स्थिति</option>
              <option value="present">उपस्थित</option>
              <option value="absent">अनुपस्थित</option>
              <option value="late">देर से</option>
              <option value="half-day">आधा दिन</option>
              <option value="early-leave">जल्दी छुट्टी</option>
              <option value="on-leave">छुट्टी पर</option>
            </select>
          </div>
        </div>
        
        <div className="flex justify-end">
          <button
            onClick={generateReport}
            disabled={loading}
            className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-md shadow-sm transition-colors"
          >
            {loading ? 'जनरेट हो रहा है...' : 'रिपोर्ट जनरेट करें'}
          </button>
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
      
      {/* Report Results */}
      {loading ? (
        <div className="flex justify-center py-8">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      ) : (
        <>
          {reportGenerated && reportData.length > 0 ? (
            <div>
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-medium text-gray-900">रिपोर्ट परिणाम ({reportData.length} रिकॉर्ड्स)</h3>
                <button
                  onClick={exportToCSV}
                  className="bg-green-600 hover:bg-green-700 text-white font-medium py-2 px-4 rounded-md shadow-sm transition-colors flex items-center"
                >
                  <svg className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                  </svg>
                  CSV में निर्यात करें
                </button>
              </div>
              
              {/* Visualizations */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
                {statusChartData && (
                  <div className="bg-white p-4 rounded-lg shadow">
                    <h4 className="text-md font-medium text-gray-900 mb-4">उपस्थिति स्थिति वितरण</h4>
                    <div className="h-64">
                      <Pie 
                        data={statusChartData} 
                        options={{
                          responsive: true,
                          maintainAspectRatio: false,
                          plugins: {
                            legend: {
                              position: 'right',
                            }
                          }
                        }}
                      />
                    </div>
                  </div>
                )}
                
                {departmentChartData && departments.length > 1 && (
                  <div className="bg-white p-4 rounded-lg shadow">
                    <h4 className="text-md font-medium text-gray-900 mb-4">विभाग-वार उपस्थिति</h4>
                    <div className="h-64">
                      <Bar 
                        data={departmentChartData}
                        options={{
                          responsive: true,
                          maintainAspectRatio: false,
                          scales: {
                            x: {
                              stacked: true,
                            },
                            y: {
                              stacked: true
                            }
                          }
                        }}
                      />
                    </div>
                  </div>
                )}
              </div>
              
              <div className="overflow-x-auto bg-white rounded-lg shadow">
                {renderAttendanceTable()}
              </div>
            </div>
          ) : reportGenerated ? (
            <div className="text-center py-8 bg-gray-50 rounded-lg">
              <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              <h3 className="mt-2 text-sm font-medium text-gray-900">कोई रिकॉर्ड नहीं मिला</h3>
              <p className="mt-1 text-sm text-gray-500">अधिक परिणाम देखने के लिए अपने फिल्टर समायोजित करें।</p>
            </div>
          ) : null}
        </>
      )}
    </div>
  );
}

export default CustomReport;