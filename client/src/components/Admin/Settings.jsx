import React from 'react';

function Settings() {
  return (
    <div className="bg-white rounded-lg shadow-sm p-6">
      <h2 className="text-xl font-semibold mb-4">System Settings</h2>
      
      <div className="space-y-6">
        <div className="border-b border-gray-200 pb-4">
          <h3 className="text-lg font-medium mb-2">General Settings</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div>
                <p className="font-medium">Company Name</p>
                <p className="text-sm text-gray-500">PeakForce</p>
              </div>
              <button className="text-blue-600 hover:text-blue-800">Edit</button>
            </div>
            
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div>
                <p className="font-medium">Office Location</p>
                <p className="text-sm text-gray-500">Main Office</p>
              </div>
              <button className="text-blue-600 hover:text-blue-800">Edit</button>
            </div>
          </div>
        </div>
        
        <div className="border-b border-gray-200 pb-4">
          <h3 className="text-lg font-medium mb-2">Attendance Settings</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div>
                <p className="font-medium">Office Hours</p>
                <p className="text-sm text-gray-500">9:00 AM - 6:00 PM</p>
              </div>
              <button className="text-blue-600 hover:text-blue-800">Edit</button>
            </div>
            
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div>
                <p className="font-medium">Geo-fence Radius</p>
                <p className="text-sm text-gray-500">150 meters</p>
              </div>
              <button className="text-blue-600 hover:text-blue-800">Edit</button>
            </div>
          </div>
        </div>
        
        <div>
          <h3 className="text-lg font-medium mb-2">Leave Settings</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div>
                <p className="font-medium">Annual Leave Days</p>
                <p className="text-sm text-gray-500">24 days</p>
              </div>
              <button className="text-blue-600 hover:text-blue-800">Edit</button>
            </div>
            
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div>
                <p className="font-medium">Sick Leave Days</p>
                <p className="text-sm text-gray-500">12 days</p>
              </div>
              <button className="text-blue-600 hover:text-blue-800">Edit</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Settings;