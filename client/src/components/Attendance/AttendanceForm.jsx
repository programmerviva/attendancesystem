import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useLocation } from '../../hooks/useLocation';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import dayjs from 'dayjs';

// Office fixed coordinates (सही करें)
const OFFICE_LAT = 28.4067738; // नया latitude
const OFFICE_LON = 77.0414672; // नया longitude
const ALLOWED_RADIUS_METERS = 150; // 150 मीटर के दायरे को बदलें यदि जरूरी हो

function AttendanceForm() {
  const [location, locationError, address] = useLocation();
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const { user, token } = useAuth();
  const navigate = useNavigate();

  const checkInTimeLimit = dayjs().set('hour', 10).set('minute', 30);
  const checkOutTimeLimit = dayjs().set('hour', 18).set('minute', 0);

  useEffect(() => {
    if (!user) {
      navigate('/login');
    }
  }, [user, navigate]);

  const calculateDistance = (lat1, lon1, lat2, lon2) => {
    const R = 6371e3; // Earth radius in meters
    const φ1 = lat1 * Math.PI/180;
    const φ2 = lat2 * Math.PI/180;
    const Δφ = (lat2 - lat1) * Math.PI/180;
    const Δλ = (lon2 - lon1) * Math.PI/180;
  
    const a = 
      Math.sin(Δφ/2) * Math.sin(Δφ/2) +
      Math.cos(φ1) * Math.cos(φ2) *
      Math.sin(Δλ/2) * Math.sin(Δλ/2);
    
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    
    return R * c; // in meters
  };
  const handleAttendance = async (type) => {
    setError(null);
    setSuccess(null);

    if (locationError) {
      setError('Could not retrieve location: ' + locationError);
      return;
    }

    if (!location) {
      setError('Location is required to mark attendance.');
      return;
    }

    if (location.accuracy && location.accuracy > 150) {
      setError(`Location is not accurate enough (Accuracy: ${Math.round(location.accuracy)}m). Must be within 150 meters.`);
      return;
    }

    // नया डिस्टेंस कैलकुलेशन
  const distanceFromOffice = calculateDistance(
    location.latitude,
    location.longitude,
    OFFICE_LAT, // अपडेटेड coordinates
    OFFICE_LON  // अपडेटेड coordinates
  );

    // नई वैलिडेशन कंडीशन
    if (distanceFromOffice > ALLOWED_RADIUS_METERS) {
      setError(`आप ऑफिस के ${ALLOWED_RADIUS_METERS} मीटर के दायरे में नहीं हैं। वर्तमान दूरी: ${Math.round(distanceFromOffice)} मीटर`);
      return;
    }

    const now = dayjs();

    if (type === 'checkin' && now.isAfter(checkInTimeLimit)) {
      setError('You are late for check-in.');
      return;
    }

    if (type === 'checkout' && now.isBefore(checkOutTimeLimit)) {
      setError('You cannot check out before 6:00 PM.');
      return;
    }

    try {
      const response = await axios.post(
        '/api/v1/attendance',
        {
          type,
          latitude: location.latitude,
          longitude: location.longitude,
          address: address || '',
          time: now.format(),
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setSuccess(`Attendance ${type === 'checkin' ? 'Check-In' : 'Check-Out'} marked successfully!`);
      console.log('Attendance marked:', response.data);
    } catch (err) {
      setError(err.response?.data?.message || 'Could not mark attendance.');
    }
  };

  return (
    <div className="bg-white shadow-2xl rounded-lg p-8 max-w-md w-full mx-auto mt-10">
  <h2 className="text-3xl font-extrabold text-center text-gray-800 mb-6">Mark Attendance</h2>

  {error && <p className="text-red-600 text-sm mb-4 font-semibold">{error}</p>}
  {success && <p className="text-green-600 text-sm mb-4 font-semibold">{success}</p>}

  {location ? (
    <div className="text-gray-700 mb-4 text-sm">
      📍 <strong>Latitude:</strong> {location.latitude.toFixed(7)}, <strong>Longitude:</strong> {location.longitude.toFixed(7)}<br />
      🎯 <strong>Accuracy:</strong> {Math.round(location.accuracy)} meters<br />
      🏠 <strong>Address:</strong> {address || 'Fetching address...'}<br />
      📏 <strong>Distance from Office:</strong> {Math.round(calculateDistance(location.latitude, location.longitude, OFFICE_LAT, OFFICE_LON))} meters
    </div>
  ) : (
    <p className="text-gray-500 mb-4 text-sm">📍 Getting location...</p>
  )}

  <div className="flex gap-4">
    <button
      type="button"
      onClick={() => handleAttendance('checkin')}
      disabled={
        !location || 
        location.accuracy > 150 || 
        calculateDistance(location.latitude, location.longitude, OFFICE_LAT, OFFICE_LON) > ALLOWED_RADIUS_METERS
      }
      className={`w-1/2 py-3 rounded-lg text-white font-semibold transition duration-300 
        ${(location && location.accuracy <= 150 && calculateDistance(location.latitude, location.longitude, OFFICE_LAT, OFFICE_LON) <= ALLOWED_RADIUS_METERS)
          ? 'bg-green-600 hover:bg-green-700'
          : 'bg-gray-400 cursor-not-allowed'}`}
    >
      Check In
    </button>

    <button
      type="button"
      onClick={() => handleAttendance('checkout')}
      disabled={
        !location || 
        location.accuracy > 150 || 
        calculateDistance(location.latitude, location.longitude, OFFICE_LAT, OFFICE_LON) > ALLOWED_RADIUS_METERS
      }
      className={`w-1/2 py-3 rounded-lg text-white font-semibold transition duration-300 
        ${(location && location.accuracy <= 150 && calculateDistance(location.latitude, location.longitude, OFFICE_LAT, OFFICE_LON) <= ALLOWED_RADIUS_METERS)
          ? 'bg-red-600 hover:bg-red-700'
          : 'bg-gray-400 cursor-not-allowed'}`}
    >
      Check Out
    </button>
  </div>
</div>
  );
}

export default AttendanceForm;
