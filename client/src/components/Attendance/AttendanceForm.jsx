import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useLocation } from '../../hooks/useLocation';
import { useNavigate, Link } from 'react-router-dom';
import dayjs from 'dayjs';

const apiUrl = import.meta.env.VITE_API_URL;

// Office coordinates
const OFFICE_LAT = 28.4067738;
const OFFICE_LON = 77.0414672;

function AttendanceForm() {
  const [location, locationError, address] = useLocation();
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [loading, setLoading] = useState(false);
  const [todayAttendance, setTodayAttendance] = useState(null);
  const [settings, setSettings] = useState({ geofenceRadius: 150 }); // Default to 150m until settings are loaded from server
  const [hasApprovedOutdoorDuty, setHasApprovedOutdoorDuty] = useState(false);
  const [outdoorDuty, setOutdoorDuty] = useState(null);
  const navigate = useNavigate();

  // Get token from localStorage
  const token = localStorage.getItem('token');
  const user = localStorage.getItem('user') ? JSON.parse(localStorage.getItem('user')) : null;

  useEffect(() => {
    if (!token || !user) {
      navigate('/login');
      return;
    }

    // Fetch today's attendance record
    const fetchTodayAttendance = async () => {
      try {
        const response = await axios.get(`${apiUrl}/api/v1/attendance/today`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setTodayAttendance(response.data.data.attendance);
      } catch (err) {
        console.error("Error fetching today's attendance:", err);
      }
    };

    // Fetch system settings to get the geofence radius
    const fetchSettings = async () => {
      try {
        const response = await axios.get(`${apiUrl}/api/v1/settings`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (response.data?.data?.settings) {
          const geofenceRadius = response.data.data.settings.geofenceRadius;
          console.log("Fetched geofence radius:", geofenceRadius);
          // Force update with the new geofence radius
          setSettings(prevSettings => ({
            ...prevSettings,
            geofenceRadius: geofenceRadius
          }));
        }
      } catch (err) {
        console.error("Error fetching settings:", err);
      }
    };

    // Check if user has approved outdoor duty for today
    const checkOutdoorDuty = async () => {
      try {
        const response = await axios.get(`${apiUrl}/api/v1/outdoor-duty/check-today`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setHasApprovedOutdoorDuty(response.data.data.hasApprovedOutdoorDuty);
        setOutdoorDuty(response.data.data.outdoorDuty);
      } catch (err) {
        console.error("Error checking outdoor duty status:", err);
      }
    };

    fetchTodayAttendance();
    fetchSettings();
    checkOutdoorDuty();
  }, [token, user, navigate]);

  const calculateDistance = (lat1, lon1, lat2, lon2) => {
    const R = 6371e3; // Earth radius in meters
    const φ1 = (lat1 * Math.PI) / 180;
    const φ2 = (lat2 * Math.PI) / 180;
    const Δφ = ((lat2 - lat1) * Math.PI) / 180;
    const Δλ = ((lon2 - lon1) * Math.PI) / 180;

    const a =
      Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
      Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);

    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

    return R * c; // in meters
  };

  const handleAttendance = async (type) => {
    setError(null);
    setSuccess(null);
    setLoading(true);

    if (locationError && !hasApprovedOutdoorDuty) {
      setError('Could not retrieve location: ' + locationError);
      setLoading(false);
      return;
    }

    if (!location && !hasApprovedOutdoorDuty) {
      setError('Location is required to mark attendance.');
      setLoading(false);
      return;
    }

    // Skip location checks if user has approved outdoor duty
    if (!hasApprovedOutdoorDuty) {
      // Use the geofence radius from settings for accuracy check
      const accuracyThreshold = parseFloat(settings.geofenceRadius) || 150;
      if (location.accuracy && location.accuracy > accuracyThreshold) {
        setError(
          `Location is not accurate enough (Accuracy: ${Math.round(location.accuracy)}m). Must be within ${accuracyThreshold} meters.`
        );
        setLoading(false);
        return;
      }

      const distanceFromOffice = calculateDistance(
        location.latitude,
        location.longitude,
        OFFICE_LAT,
        OFFICE_LON
      );

      // Get the current geofence radius from settings - use exact value, not just integer
      const currentGeofenceRadius = parseFloat(settings.geofenceRadius) || 150;
      
      // Round to 2 decimal places for more precise comparison
      const roundedDistance = Math.round(distanceFromOffice * 100) / 100;
      const roundedRadius = Math.round(currentGeofenceRadius * 100) / 100;
      
      console.log("Current distance:", roundedDistance, "meters");
      console.log("Allowed radius:", roundedRadius, "meters");

      // Use the geofenceRadius from settings with precise comparison
      if (roundedDistance > roundedRadius) {
        setError(
          `You are not within ${currentGeofenceRadius} meters of the office. Current distance: ${roundedDistance} meters`
        );
        setLoading(false);
        return;
      }
    }

    const now = dayjs();

    try {
      const requestData = {
        type,
        time: now.format(),
      };

      // Only include location data if not on outdoor duty
      if (!hasApprovedOutdoorDuty && location) {
        requestData.latitude = location.latitude;
        requestData.longitude = location.longitude;
        requestData.address = address || '';
      }

      const response = await axios.post(
        `${apiUrl}/api/v1/attendance`,
        requestData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setSuccess(
        `Attendance ${type === 'checkin' ? 'Check-In' : 'Check-Out'} marked successfully!`
      );
      console.log('Attendance marked:', response.data);

      // Update today's attendance
      setTodayAttendance(response.data.data.attendance);
    } catch (err) {
      setError(err.response?.data?.message || 'Could not mark attendance.');
    } finally {
      setLoading(false);
    }
  };

  const formatTime = (dateString) => {
    if (!dateString) return '';
    return dayjs(dateString).format('hh:mm A');
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="bg-white shadow-xl rounded-lg overflow-hidden">
        <div className="bg-gradient-to-r from-blue-600 to-blue-800 px-6 py-4">
          <h2 className="text-2xl font-bold text-white">Attendance System</h2>
          <p className="text-blue-100">Mark your daily attendance</p>
        </div>

        <div className="p-6">
          {/* Quick Actions */}
          <div className="mb-6 flex justify-between">
            <Link to="/employee/dashboard" className="text-blue-600 hover:text-blue-800">
              &larr; Back to Dashboard
            </Link>
            <Link to="/outdoor-duty" className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-md">
              Request Outdoor Duty
            </Link>
          </div>

          {/* Status Messages */}
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

          {/* Outdoor Duty Alert */}
          {hasApprovedOutdoorDuty && (
            <div className="mb-6 bg-purple-50 border-l-4 border-purple-500 p-4 rounded-md">
              <div className="flex">
                <div className="flex-shrink-0">
                  <svg
                    className="h-5 w-5 text-purple-400"
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path
                      fillRule="evenodd"
                      d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-11a1 1 0 10-2 0v2H7a1 1 0 100 2h2v2a1 1 0 102 0v-2h2a1 1 0 100-2h-2V7z"
                      clipRule="evenodd"
                    />
                  </svg>
                </div>
                <div className="ml-3">
                  <p className="text-sm font-medium text-purple-800">Outdoor Duty Approved</p>
                  <p className="text-sm text-purple-700">
                    You have an approved outdoor duty request for today. Location verification is bypassed.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Today's Attendance Status */}
          <div className="mb-6 p-4 bg-gray-50 rounded-lg">
            <h3 className="text-lg font-medium text-gray-900 mb-2">Today's Attendance</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-500">Check-In Time</p>
                <p className="text-lg font-semibold">
                  {todayAttendance?.checkIn?.time
                    ? formatTime(todayAttendance.checkIn.time)
                    : 'Not checked in yet'}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Check-Out Time</p>
                <p className="text-lg font-semibold">
                  {todayAttendance?.checkOut?.time
                    ? formatTime(todayAttendance.checkOut.time)
                    : 'Not checked out yet'}
                </p>
              </div>
              {todayAttendance?.status && (
                <div className="col-span-2">
                  <p className="text-sm text-gray-500">Status</p>
                  <p className="text-lg font-semibold capitalize">
                    {todayAttendance.status.replace(/-/g, ' ')}
                    {todayAttendance.isOutdoorDuty && ' (Outdoor Duty)'}
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Location Information - Only show if not on outdoor duty */}
          {!hasApprovedOutdoorDuty && (
            <div className="mb-6 p-4 bg-blue-50 rounded-lg">
              <h3 className="text-lg font-medium text-blue-900 mb-2">Location Information</h3>
              {location ? (
                <div className="space-y-2">
                  <p className="text-sm">
                    <span className="font-medium">Coordinates:</span> {location.latitude.toFixed(6)},{' '}
                    {location.longitude.toFixed(6)}
                  </p>
                  <p className="text-sm">
                    <span className="font-medium">Accuracy:</span> {Math.round(location.accuracy)}{' '}
                    meters
                  </p>
                  <p className="text-sm">
                    <span className="font-medium">Address:</span> {address || 'Fetching address...'}
                  </p>
                  <p className="text-sm">
                    <span className="font-medium">Distance from Office:</span>{' '}
                    {(Math.round(
                      calculateDistance(location.latitude, location.longitude, OFFICE_LAT, OFFICE_LON) * 100
                    ) / 100).toFixed(2)}{' '}
                    meters (Allowed: {parseFloat(settings.geofenceRadius).toFixed(2)} meters)
                  </p>
                </div>
              ) : (
                <p className="text-sm text-blue-700">Getting your location...</p>
              )}
            </div>
          )}

          {/* Attendance Actions */}
          <div className="grid grid-cols-2 gap-4">
            <button
              onClick={() => handleAttendance('checkin')}
              disabled={loading || todayAttendance?.checkIn?.time !== undefined}
              className={`py-3 px-4 rounded-lg font-medium flex items-center justify-center
                ${
                  loading || todayAttendance?.checkIn?.time !== undefined
                    ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                    : 'bg-green-600 text-white hover:bg-green-700'
                }`}
            >
              {loading ? (
                <svg
                  className="animate-spin -ml-1 mr-2 h-5 w-5 text-white"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  ></circle>
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  ></path>
                </svg>
              ) : (
                <svg
                  className="mr-2 h-5 w-5"
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-11a1 1 0 10-2 0v2H7a1 1 0 100 2h2v2a1 1 0 102 0v-2h2a1 1 0 100-2h-2V7z"
                    clipRule="evenodd"
                  />
                </svg>
              )}
              {todayAttendance?.checkIn?.time !== undefined ? 'Already Checked In' : 'Check In'}
            </button>

            <button
              onClick={() => handleAttendance('checkout')}
              disabled={
                loading ||
                !todayAttendance?.checkIn?.time ||
                todayAttendance?.checkOut?.time !== undefined
              }
              className={`py-3 px-4 rounded-lg font-medium flex items-center justify-center
                ${
                  loading ||
                  !todayAttendance?.checkIn?.time ||
                  todayAttendance?.checkOut?.time !== undefined
                    ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                    : 'bg-red-600 text-white hover:bg-red-700'
                }`}
            >
              {loading ? (
                <svg
                  className="animate-spin -ml-1 mr-2 h-5 w-5 text-white"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  ></circle>
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  ></path>
                </svg>
              ) : (
                <svg
                  className="mr-2 h-5 w-5"
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
              )}
              {todayAttendance?.checkOut?.time !== undefined ? 'Already Checked Out' : 'Check Out'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default AttendanceForm;