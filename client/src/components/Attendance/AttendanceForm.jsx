import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useLocation } from '../hooks/useLocation'; // कस्टम हुक (नीचे देखें)
import { useAuth } from '../context/AuthContext'; // यदि आप AuthContext का उपयोग कर रहे हैं
import { useNavigate } from 'react-router-dom';
import dayjs from 'dayjs'; // तारीख और समय के साथ काम करने के लिए

function AttendanceForm() {
  const [location, locationError] = useLocation();
  const [error, setError] = useState(null);
  const { user, token } = useAuth(); // यदि आप AuthContext का उपयोग कर रहे हैं
  const navigate = useNavigate();

  const [checkInTimeLimit, setCheckInTimeLimit] = useState(dayjs().set('hour', 10).set('minute', 30));
  const [checkOutTimeLimit, setCheckOutTimeLimit] = useState(dayjs().set('hour', 18).set('minute', 0));

  useEffect(() => {
    // यदि उपयोगकर्ता लॉग इन नहीं है, तो लॉगिन पृष्ठ पर रीडायरेक्ट करें
    if (!user) {
      navigate('/login');
    }
  }, [user, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (locationError) {
      setError('Could not retrieve location: ' + locationError);
      return;
    }

    if (!location) {
      setError('Location is required to mark attendance.');
      return;
    }

    const now = dayjs();
    if (now.isAfter(checkInTimeLimit) && !now.isAfter(checkOutTimeLimit)) {
      setError('You are late for check-in.');
      return;
    }

    if (now.isBefore(checkOutTimeLimit)) {
      setError('You cannot check out before 6:00 PM.');
      return;
    }

    try {
      const response = await axios.post(
        '/api/v1/attendance',
        {
          latitude: location.latitude,
          longitude: location.longitude,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`, // यदि आप AuthContext का उपयोग कर रहे हैं
          },
        }
      );

      console.log('Attendance marked:', response.data);
      // सफलता संदेश दिखाएँ या अन्य कार्रवाई करें
    } catch (err) {
      setError(err.response?.data?.message || 'Could not mark attendance.');
    }
  };

  return (
    <div>
      <h2>Mark Attendance</h2>
      {error && <p className="error">{error}</p>}
      <form onSubmit={handleSubmit}>
        {location ? (
          <p>
            Location: Latitude {location.latitude}, Longitude {location.longitude}
          </p>
        ) : (
          <p>Getting location...</p>
        )}
        <button type="submit" disabled={!location}>
          Mark Attendance
        </button>
      </form>
    </div>
  );
}

export default AttendanceForm;