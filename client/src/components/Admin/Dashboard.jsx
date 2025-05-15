import React, { useState, useEffect } from 'react';
import DashboardStats from './DashboardStats';
import axios from 'axios';

function Dashboard() {
  const [recentActivity, setRecentActivity] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchRecentActivity = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) return;

        const response = await axios.get('http://localhost:5000/api/v1/activity/recent', {
          headers: { Authorization: `Bearer ${token}` }
        });
        
        setRecentActivity(response.data?.activities || []);
      } catch (error) {
        console.error("Error fetching recent activity:", error);
        // Fallback to dummy data
        setRecentActivity([
          { id: 1, user: 'John Doe', action: 'Checked in', time: '09:05 AM', date: '2023-11-15' },
          { id: 2, user: 'Jane Smith', action: 'Requested leave', time: '10:30 AM', date: '2023-11-15' },
          { id: 3, user: 'Mike Johnson', action: 'Checked out', time: '06:15 PM', date: '2023-11-14' },
          { id: 4, user: 'Sarah Williams', action: 'Leave approved', time: '02:45 PM', date: '2023-11-14' },
        ]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchRecentActivity();
  }, []);

  return (
    <div>
      <DashboardStats />
      
      <div className="bg-white rounded-lg shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-medium text-gray-800">Recent Activity</h2>
        </div>
        <div className="p-6">
          {isLoading ? (
            <div className="animate-pulse space-y-4">
              {[1, 2, 3, 4].map(i => (
                <div key={i} className="h-12 bg-gray-200 rounded"></div>
              ))}
            </div>
          ) : recentActivity.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">User</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Action</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Time</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {recentActivity.map((activity) => (
                    <tr key={activity.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{activity.user}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{activity.action}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{activity.time}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{activity.date}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p className="text-gray-500 text-center py-4">No recent activity found.</p>
          )}
        </div>
      </div>
    </div>
  );
}

export default Dashboard;