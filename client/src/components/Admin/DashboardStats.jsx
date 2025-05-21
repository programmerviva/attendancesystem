import React, { useState, useEffect } from 'react';
import axios from 'axios';

 const apiUrl = import.meta.env.VITE_API_URL;

function DashboardStats() {
  const [stats, setStats] = useState({
    employees: 0,
    pendingLeaves: 0,
    departments: 0,
    newRequests: 0,
    isLoading: true
  });

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) return;

        // Fetch employee count
        const employeesRes = await axios.get(`${apiUrl}/api/v1/users/count`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        
        // Fetch pending leaves (if API exists)
        let pendingLeaves = 0;
        try {
          const leavesRes = await axios.get(`${apiUrl}/api/v1/leaves/pending/count`, {
            headers: { Authorization: `Bearer ${token}` }
          });
          pendingLeaves = leavesRes.data?.count || 0;
        } catch (error) {
          console.log('Pending leaves API not available yet', error);
        }

        // Get unique departments count
        const usersRes = await axios.get(`${apiUrl}/api/v1/users`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        
        const users = usersRes.data?.data?.users || [];
        const uniqueDepartments = new Set(users.map(user => user.department));
        
        // Set stats with real data
        setStats({
          employees: employeesRes.data?.count || 0,
          pendingLeaves: pendingLeaves,
          departments: uniqueDepartments.size || 0,
          newRequests: 0, // This could be fetched from a real API if available
          isLoading: false
        });
      } catch (error) {
        console.error("Error fetching dashboard stats:", error);
        // Fallback to loading state
        setStats(prev => ({...prev, isLoading: false}));
      }
    };

    fetchStats();
    
    // Set up interval to refresh stats every 30 seconds
    const interval = setInterval(fetchStats, 30000);
    
    return () => clearInterval(interval);
  }, []);

  const renderIcon = (iconName) => {
    switch (iconName) {
      case 'users':
        return (
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
          </svg>
        );
      case 'calendar':
        return (
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
        );
      case 'office':
        return (
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
          </svg>
        );
      case 'bell':
        return (
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
          </svg>
        );
      default:
        return null;
    }
  };

  const statItems = [
    { id: 1, name: 'Total Employees', value: stats.employees, icon: 'users' },
    { id: 2, name: 'Pending Leaves', value: stats.pendingLeaves, icon: 'calendar' },
    { id: 3, name: 'Departments', value: stats.departments, icon: 'office' },
    { id: 4, name: 'New Requests', value: stats.newRequests, icon: 'bell' },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
      {statItems.map((stat) => (
        <div key={stat.id} className="bg-white rounded-lg shadow-sm p-6 flex items-center">
          <div className="p-3 rounded-full bg-blue-100 text-blue-600 mr-4">
            {renderIcon(stat.icon)}
          </div>
          <div>
            <p className="text-sm font-medium text-gray-500">{stat.name}</p>
            {stats.isLoading ? (
              <div className="h-6 w-12 bg-gray-200 animate-pulse rounded"></div>
            ) : (
              <p className="text-2xl font-semibold text-gray-800">{stat.value}</p>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}

export default DashboardStats;