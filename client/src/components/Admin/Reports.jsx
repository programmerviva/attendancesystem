import React from 'react';

function Reports() {
  return (
    <div className="bg-white rounded-lg shadow-sm p-6">
      <h2 className="text-xl font-semibold mb-4">Reports</h2>
      <p className="text-gray-600 mb-4">Generate and view attendance and leave reports.</p>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 cursor-pointer">
          <h3 className="font-medium text-blue-600">Attendance Report</h3>
          <p className="text-sm text-gray-500 mt-1">View daily, weekly, and monthly attendance reports</p>
        </div>
        
        <div className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 cursor-pointer">
          <h3 className="font-medium text-blue-600">Leave Report</h3>
          <p className="text-sm text-gray-500 mt-1">View employee leave history and statistics</p>
        </div>
        
        <div className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 cursor-pointer">
          <h3 className="font-medium text-blue-600">Department Report</h3>
          <p className="text-sm text-gray-500 mt-1">View attendance by department</p>
        </div>
        
        <div className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 cursor-pointer">
          <h3 className="font-medium text-blue-600">Custom Report</h3>
          <p className="text-sm text-gray-500 mt-1">Generate custom reports with specific parameters</p>
        </div>
      </div>
    </div>
  );
}

export default Reports;