import React, { useState, useEffect } from 'react';
import axios from 'axios';
import HolidayCalendar from './HolidayCalendar';

const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000';

function Settings() {
  const [settings, setSettings] = useState({
    companyName: 'PeakForce',
    officeLocation: 'Main Office',
    officeHours: {
      start: '09:00',
      end: '18:00',
    },
    geofenceRadius: 150,
    leaveSettings: {
      annualLeave: 24,
      sickLeave: 12,
      casualLeave: 6,
    },
    attendancePolicy: {
      lateThreshold: 30,
      halfDayThreshold: 240,
      earlyLeaveThreshold: 30,
    },
  });

  const [editMode, setEditMode] = useState({
    companyName: false,
    officeLocation: false,
    officeHours: false,
    geofenceRadius: false,
    leaveSettings: false,
    attendancePolicy: false,
  });

  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(null);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('general');

  const token = localStorage.getItem('token');

  // Fetch settings from server when component mounts
  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const response = await axios.get(`${apiUrl}/api/v1/settings`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (response.data && response.data.data && response.data.data.settings) {
          setSettings(response.data.data.settings);
        }
      } catch (err) {
        console.error('Error fetching settings:', err);
      }
    };

    fetchSettings();
  }, [token, apiUrl]);

  const handleEdit = (section) => {
    setEditMode({
      ...editMode,
      [section]: true,
    });
  };

  const handleCancel = (section) => {
    setEditMode({
      ...editMode,
      [section]: false,
    });
  };

  const handleChange = (section, field, value) => {
    if (section === 'officeHours') {
      setSettings({
        ...settings,
        officeHours: {
          ...settings.officeHours,
          [field]: value,
        },
      });
    } else if (section === 'leaveSettings') {
      setSettings({
        ...settings,
        leaveSettings: {
          ...settings.leaveSettings,
          [field]: parseInt(value, 10) || 0,
        },
      });
    } else if (section === 'attendancePolicy') {
      setSettings({
        ...settings,
        attendancePolicy: {
          ...settings.attendancePolicy,
          [field]: parseInt(value, 10) || 0,
        },
      });
    } else {
      setSettings({
        ...settings,
        [section]: value,
      });
    }
  };

  const handleSave = async (section) => {
    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      // Create payload based on section
      let payload = {};

      if (section === 'officeHours') {
        payload = { officeHours: settings.officeHours };
      } else if (section === 'leaveSettings') {
        payload = { leaveSettings: settings.leaveSettings };
      } else if (section === 'attendancePolicy') {
        payload = { attendancePolicy: settings.attendancePolicy };
      } else {
        payload = { [section]: settings[section] };
      }

      console.log('Saving settings:', payload);

      // Send to server
      const response = await axios.patch(`${apiUrl}/api/v1/settings`, payload, {
        headers: { Authorization: `Bearer ${token}` },
      });

      // Update local settings with response data if available
      if (response.data && response.data.data && response.data.data.settings) {
        setSettings(response.data.data.settings);
      }

      setSuccess(
        `${section.charAt(0).toUpperCase() + section.slice(1).replace(/([A-Z])/g, ' $1')} updated successfully!`
      );
      setEditMode({
        ...editMode,
        [section]: false,
      });

      // Fetch updated settings to ensure we have the latest data
      setTimeout(async () => {
        try {
          const refreshResponse = await axios.get(`${apiUrl}/api/v1/settings`, {
            headers: { Authorization: `Bearer ${token}` },
          });

          if (refreshResponse.data?.data?.settings) {
            setSettings(refreshResponse.data.data.settings);
          }
        } catch (refreshErr) {
          console.error('Error refreshing settings:', refreshErr);
        }
      }, 500);
    } catch (err) {
      console.error('Error updating settings:', err);
      setError('Failed to update settings');
    } finally {
      setLoading(false);
    }

    // Clear success message after 3 seconds
    setTimeout(() => {
      setSuccess(null);
    }, 3000);
  };

  return (
    <div className="bg-white rounded-lg shadow-lg overflow-hidden">
      <div className="bg-gradient-to-r from-blue-600 to-blue-800 px-6 py-4">
        <h2 className="text-2xl font-bold text-white">System Settings</h2>
        <p className="text-blue-100">Configure your attendance system</p>
      </div>

      <div className="p-6">
        {/* Tabs */}
        <div className="mb-6 border-b border-gray-200">
          <nav className="-mb-px flex space-x-8">
            <button
              onClick={() => setActiveTab('general')}
              className={`${
                activeTab === 'general'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
            >
              General Settings
            </button>
            <button
              onClick={() => setActiveTab('attendance')}
              className={`${
                activeTab === 'attendance'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
            >
              Attendance Policy
            </button>
            <button
              onClick={() => setActiveTab('holidays')}
              className={`${
                activeTab === 'holidays'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
            >
              Company Holidays
            </button>
          </nav>
        </div>

        {/* Success Message */}
        {success && (
          <div className="mb-6 bg-green-50 border-l-4 border-green-500 p-4 rounded-md">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg
                  className="h-5 w-5 text-green-400"
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                    clipRule="evenodd"
                  />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-sm text-green-700">{success}</p>
              </div>
            </div>
          </div>
        )}

        {/* Error Message */}
        {error && (
          <div className="mb-6 bg-red-50 border-l-4 border-red-500 p-4 rounded-md">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg
                  className="h-5 w-5 text-red-400"
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                    clipRule="evenodd"
                  />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-sm text-red-700">{error}</p>
              </div>
            </div>
          </div>
        )}

        {/* General Settings Tab */}
        {activeTab === 'general' && (
          <div className="space-y-6">
            {/* General Settings */}
            <div className="border-b border-gray-200 pb-4">
              <h3 className="text-lg font-medium mb-2">General Settings</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div>
                    <p className="font-medium">Company Name</p>
                    {editMode.companyName ? (
                      <input
                        type="text"
                        value={settings.companyName}
                        onChange={(e) => handleChange('companyName', null, e.target.value)}
                        className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                      />
                    ) : (
                      <p className="text-sm text-gray-500">{settings.companyName}</p>
                    )}
                  </div>
                  <div>
                    {editMode.companyName ? (
                      <div className="space-x-2">
                        <button
                          onClick={() => handleSave('companyName')}
                          disabled={loading}
                          className="text-white bg-blue-600 hover:bg-blue-700 px-3 py-1 rounded-md text-sm"
                        >
                          {loading ? 'Saving...' : 'Save'}
                        </button>
                        <button
                          onClick={() => handleCancel('companyName')}
                          className="text-gray-700 bg-gray-200 hover:bg-gray-300 px-3 py-1 rounded-md text-sm"
                        >
                          Cancel
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={() => handleEdit('companyName')}
                        className="text-blue-600 hover:text-blue-800"
                      >
                        Edit
                      </button>
                    )}
                  </div>
                </div>

                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div>
                    <p className="font-medium">Office Location</p>
                    {editMode.officeLocation ? (
                      <input
                        type="text"
                        value={settings.officeLocation}
                        onChange={(e) => handleChange('officeLocation', null, e.target.value)}
                        className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                      />
                    ) : (
                      <p className="text-sm text-gray-500">{settings.officeLocation}</p>
                    )}
                  </div>
                  <div>
                    {editMode.officeLocation ? (
                      <div className="space-x-2">
                        <button
                          onClick={() => handleSave('officeLocation')}
                          disabled={loading}
                          className="text-white bg-blue-600 hover:bg-blue-700 px-3 py-1 rounded-md text-sm"
                        >
                          {loading ? 'Saving...' : 'Save'}
                        </button>
                        <button
                          onClick={() => handleCancel('officeLocation')}
                          className="text-gray-700 bg-gray-200 hover:bg-gray-300 px-3 py-1 rounded-md text-sm"
                        >
                          Cancel
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={() => handleEdit('officeLocation')}
                        className="text-blue-600 hover:text-blue-800"
                      >
                        Edit
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Office Hours */}
            <div className="border-b border-gray-200 pb-4">
              <h3 className="text-lg font-medium mb-2">Office Hours</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div>
                    <p className="font-medium">Office Hours</p>
                    {editMode.officeHours ? (
                      <div className="flex space-x-2 mt-1">
                        <input
                          type="time"
                          value={settings.officeHours.start}
                          onChange={(e) => handleChange('officeHours', 'start', e.target.value)}
                          className="block w-24 border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                        />
                        <span className="self-center">to</span>
                        <input
                          type="time"
                          value={settings.officeHours.end}
                          onChange={(e) => handleChange('officeHours', 'end', e.target.value)}
                          className="block w-24 border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                        />
                      </div>
                    ) : (
                      <p className="text-sm text-gray-500">
                        {settings.officeHours.start} - {settings.officeHours.end}
                      </p>
                    )}
                  </div>
                  <div>
                    {editMode.officeHours ? (
                      <div className="space-x-2">
                        <button
                          onClick={() => handleSave('officeHours')}
                          disabled={loading}
                          className="text-white bg-blue-600 hover:bg-blue-700 px-3 py-1 rounded-md text-sm"
                        >
                          {loading ? 'Saving...' : 'Save'}
                        </button>
                        <button
                          onClick={() => handleCancel('officeHours')}
                          className="text-gray-700 bg-gray-200 hover:bg-gray-300 px-3 py-1 rounded-md text-sm"
                        >
                          Cancel
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={() => handleEdit('officeHours')}
                        className="text-blue-600 hover:text-blue-800"
                      >
                        Edit
                      </button>
                    )}
                  </div>
                </div>

                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div>
                    <p className="font-medium">Geo-fence Radius</p>
                    {editMode.geofenceRadius ? (
                      <div className="flex items-center mt-1">
                        <input
                          type="number"
                          value={settings.geofenceRadius}
                          onChange={(e) =>
                            handleChange('geofenceRadius', null, parseInt(e.target.value, 10) || 0)
                          }
                          className="block w-24 border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                        />
                        <span className="ml-2 text-sm text-gray-500">meters</span>
                      </div>
                    ) : (
                      <p className="text-sm text-gray-500">{settings.geofenceRadius} meters</p>
                    )}
                  </div>
                  <div>
                    {editMode.geofenceRadius ? (
                      <div className="space-x-2">
                        <button
                          onClick={() => handleSave('geofenceRadius')}
                          disabled={loading}
                          className="text-white bg-blue-600 hover:bg-blue-700 px-3 py-1 rounded-md text-sm"
                        >
                          {loading ? 'Saving...' : 'Save'}
                        </button>
                        <button
                          onClick={() => handleCancel('geofenceRadius')}
                          className="text-gray-700 bg-gray-200 hover:bg-gray-300 px-3 py-1 rounded-md text-sm"
                        >
                          Cancel
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={() => handleEdit('geofenceRadius')}
                        className="text-blue-600 hover:text-blue-800"
                      >
                        Edit
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Leave Settings */}
            <div>
              <h3 className="text-lg font-medium mb-2">Leave Settings</h3>
              {editMode.leaveSettings ? (
                <div className="bg-gray-50 p-4 rounded-lg">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Annual Leave Days
                      </label>
                      <input
                        type="number"
                        value={settings.leaveSettings.annualLeave}
                        onChange={(e) =>
                          handleChange('leaveSettings', 'annualLeave', e.target.value)
                        }
                        className="block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Sick Leave Days
                      </label>
                      <input
                        type="number"
                        value={settings.leaveSettings.sickLeave}
                        onChange={(e) => handleChange('leaveSettings', 'sickLeave', e.target.value)}
                        className="block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Casual Leave Days
                      </label>
                      <input
                        type="number"
                        value={settings.leaveSettings.casualLeave}
                        onChange={(e) =>
                          handleChange('leaveSettings', 'casualLeave', e.target.value)
                        }
                        className="block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                      />
                    </div>
                  </div>
                  <div className="flex justify-end space-x-2">
                    <button
                      onClick={() => handleSave('leaveSettings')}
                      disabled={loading}
                      className="text-white bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded-md text-sm"
                    >
                      {loading ? 'Saving...' : 'Save Changes'}
                    </button>
                    <button
                      onClick={() => handleCancel('leaveSettings')}
                      className="text-gray-700 bg-gray-200 hover:bg-gray-300 px-4 py-2 rounded-md text-sm"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div>
                      <p className="font-medium">Annual Leave Days</p>
                      <p className="text-sm text-gray-500">
                        {settings.leaveSettings.annualLeave} days
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div>
                      <p className="font-medium">Sick Leave Days</p>
                      <p className="text-sm text-gray-500">
                        {settings.leaveSettings.sickLeave} days
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div>
                      <p className="font-medium">Casual Leave Days</p>
                      <p className="text-sm text-gray-500">
                        {settings.leaveSettings.casualLeave} days
                      </p>
                    </div>
                  </div>
                </div>
              )}
              {!editMode.leaveSettings && (
                <div className="mt-4 flex justify-end">
                  <button
                    onClick={() => handleEdit('leaveSettings')}
                    className="text-blue-600 hover:text-blue-800 font-medium"
                  >
                    Edit Leave Settings
                  </button>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Attendance Policy Tab */}
        {activeTab === 'attendance' && (
          <div>
            <h3 className="text-lg font-medium mb-4">Attendance Policy Settings</h3>
            <p className="text-sm text-gray-500 mb-4">
              Configure the thresholds for marking attendance status automatically.
            </p>

            {editMode.attendancePolicy ? (
              <div className="bg-gray-50 p-4 rounded-lg">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Late Threshold (minutes)
                    </label>
                    <input
                      type="number"
                      value={settings.attendancePolicy.lateThreshold}
                      onChange={(e) =>
                        handleChange('attendancePolicy', 'lateThreshold', e.target.value)
                      }
                      className="block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                      min="1"
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      Minutes after office hours start to mark as late
                    </p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Half Day Threshold (minutes)
                    </label>
                    <input
                      type="number"
                      value={settings.attendancePolicy.halfDayThreshold}
                      onChange={(e) =>
                        handleChange('attendancePolicy', 'halfDayThreshold', e.target.value)
                      }
                      className="block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                      min="1"
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      Minutes after office hours start to mark as half day
                    </p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Early Leave Threshold (minutes)
                    </label>
                    <input
                      type="number"
                      value={settings.attendancePolicy.earlyLeaveThreshold}
                      onChange={(e) =>
                        handleChange('attendancePolicy', 'earlyLeaveThreshold', e.target.value)
                      }
                      className="block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                      min="1"
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      Minutes before office hours end to mark as early leave
                    </p>
                  </div>
                </div>
                <div className="flex justify-end space-x-2">
                  <button
                    onClick={() => handleSave('attendancePolicy')}
                    disabled={loading}
                    className="text-white bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded-md text-sm"
                  >
                    {loading ? 'Saving...' : 'Save Changes'}
                  </button>
                  <button
                    onClick={() => handleCancel('attendancePolicy')}
                    className="text-gray-700 bg-gray-200 hover:bg-gray-300 px-4 py-2 rounded-md text-sm"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            ) : (
              <div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                  <div className="p-3 bg-gray-50 rounded-lg">
                    <p className="font-medium">Late Threshold</p>
                    <p className="text-sm text-gray-500">
                      {settings.attendancePolicy.lateThreshold} minutes
                    </p>
                    <p className="text-xs text-gray-500 mt-1">After office start time</p>
                  </div>
                  <div className="p-3 bg-gray-50 rounded-lg">
                    <p className="font-medium">Half Day Threshold</p>
                    <p className="text-sm text-gray-500">
                      {settings.attendancePolicy.halfDayThreshold} minutes
                    </p>
                    <p className="text-xs text-gray-500 mt-1">After office start time</p>
                  </div>
                  <div className="p-3 bg-gray-50 rounded-lg">
                    <p className="font-medium">Early Leave Threshold</p>
                    <p className="text-sm text-gray-500">
                      {settings.attendancePolicy.earlyLeaveThreshold} minutes
                    </p>
                    <p className="text-xs text-gray-500 mt-1">Before office end time</p>
                  </div>
                </div>
                <div className="flex justify-end">
                  <button
                    onClick={() => handleEdit('attendancePolicy')}
                    className="text-blue-600 hover:text-blue-800 font-medium"
                  >
                    Edit Attendance Policy
                  </button>
                </div>
              </div>
            )}

            <div className="mt-8 bg-blue-50 p-4 rounded-lg">
              <h4 className="text-md font-medium text-blue-800 mb-2">
                How Attendance Status Works
              </h4>
              <ul className="list-disc pl-5 space-y-2 text-sm text-blue-700">
                <li>
                  <span className="font-medium">Present:</span> Check-in before the late threshold
                </li>
                <li>
                  <span className="font-medium">Late:</span> Check-in after the late threshold but
                  before the half-day threshold
                </li>
                <li>
                  <span className="font-medium">Half-Day:</span> Check-in after the half-day
                  threshold
                </li>
                <li>
                  <span className="font-medium">Early Leave:</span> Check-out before the early leave
                  threshold
                </li>
              </ul>
            </div>
          </div>
        )}

        {/* Company Holidays Tab */}
        {activeTab === 'holidays' && <HolidayCalendar />}
      </div>
    </div>
  );
}

export default Settings;
