import React, { useState, useEffect } from 'react';

const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000';

function DashboardSummary() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  async function fetchDashboardData() {
    try {
      const today = new Date().toISOString().split('T')[0]; // format: YYYY-MM-DD
      
      // Fix 1: Use the apiUrl variable to ensure the endpoint is valid
      const response = await fetch(`${apiUrl}/api/v1/attendance/summary?date=${today}`);
      
      if (!response.ok) {
        throw new Error(`API request failed with status ${response.status}`);
      }
      
      const data = await response.json();
      console.log(data); // Debugging
      setData(data);
    } catch (error) {
      console.error("Failed to fetch dashboard data:", error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  }

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;
  if (!data) return <div>No data available</div>;

  return (
    <div>
      {/* Fix 2: Render specific properties instead of the object */}
      {data.name && (
        <p>{data.name.first} {data.name.last}</p>
      )}
      
      {/* If data.users is an array of objects with name property */}
      {data.users && data.users.map((user, index) => (
        <div key={index}>
          {/* Access specific properties of each user object */}
          {user.name && (
            <p>{user.name.first} {user.name.last}</p>
          )}
        </div>
      ))}
    </div>
  );
}

export default DashboardSummary;