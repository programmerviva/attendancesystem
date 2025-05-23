import { useState, useEffect } from 'react';
import axios from 'axios';

export const useLocation = () => {
  const [location, setLocation] = useState(null);
  const [error, setError] = useState(null);
  const [address, setAddress] = useState(null);

  useEffect(() => {
    if (!navigator.geolocation) {
      setError('Geolocation is not supported by your browser');
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude, accuracy } = position.coords;

        if (accuracy > 150) {
          setError(`Location accuracy too low: ${accuracy.toFixed(0)} meters`);
          return;
        }

        setLocation({ latitude, longitude, accuracy });

        try {
          const response = await axios.get('https://nominatim.openstreetmap.org/reverse', {
            params: {
              lat: latitude,
              lon: longitude,
              format: 'json',
            },
          });

          setAddress(response.data.display_name);
        } catch (err) {
          setError('Could not fetch address from coordinates', err.message);
        }
      },
      (err) => {
        setError(err.message);
      },
      {
        enableHighAccuracy: true, // 🎯 High accuracy mode
        timeout: 10000, // Optional: 10 second timeout
        maximumAge: 0, // Don't use cached location
      }
    );
  }, []);

  return [location, error, address];
};
