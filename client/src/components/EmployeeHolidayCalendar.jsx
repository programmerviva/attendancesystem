import React, { useState, useEffect } from 'react';
import axios from 'axios';
import dayjs from 'dayjs';

const apiUrl = import.meta.env.VITE_API_URL;

function EmployeeHolidayCalendar() {
  const [holidays, setHolidays] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentYear, setCurrentYear] = useState(dayjs().year());

  const token = localStorage.getItem('token');
 

  useEffect(() => {
    fetchHolidays();
  }, [currentYear]);

  const fetchHolidays = async () => {
    setLoading(true);
    try {
      const response = await axios.get(`${apiUrl}/api/v1/settings/holidays`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      // Filter holidays for the current year
      const yearHolidays = response.data.data.holidays.filter(
        holiday => dayjs(holiday.date).year() === currentYear
      );
      
      setHolidays(yearHolidays);
      setError(null);
    } catch (err) {
      console.error('Error fetching holidays:', err);
      setError('Failed to fetch company holidays');
      setHolidays([]);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    return dayjs(dateString).format('MMM DD, YYYY');
  };

  const getUpcomingHolidays = () => {
    const today = dayjs().startOf('day');
    return holidays
      .filter(holiday => dayjs(holiday.date).isAfter(today) || dayjs(holiday.date).isSame(today))
      .sort((a, b) => dayjs(a.date).diff(dayjs(b.date)))
      .slice(0, 3);
  };

  const changeYear = (increment) => {
    setCurrentYear(currentYear + increment);
  };

  return (
    <div className="bg-white shadow rounded-lg overflow-hidden">
      <div className="px-4 py-5 sm:px-6 bg-gradient-to-r from-indigo-500 to-indigo-600">
        <div className="flex justify-between items-center">
          <h3 className="text-lg leading-6 font-medium text-white">Company Holidays</h3>
          <div className="flex space-x-2">
            <button 
              onClick={() => changeYear(-1)}
              className="p-1 rounded-full bg-indigo-400 bg-opacity-20 hover:bg-opacity-30 text-white"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
            </button>
            <span className="text-white font-medium">{currentYear}</span>
            <button 
              onClick={() => changeYear(1)}
              className="p-1 rounded-full bg-indigo-400 bg-opacity-20 hover:bg-opacity-30 text-white"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
              </svg>
            </button>
          </div>
        </div>
      </div>
      
      <div className="px-4 py-5 sm:p-6">
        {loading ? (
          <div className="flex justify-center py-4">
            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-indigo-500"></div>
          </div>
        ) : error ? (
          <div className="text-center py-4 text-red-500">{error}</div>
        ) : holidays.length === 0 ? (
          <div className="text-center py-4 text-gray-500">No holidays defined for {currentYear}</div>
        ) : (
          <>
            {/* Upcoming Holidays Section */}
            <div className="mb-6">
              <h4 className="text-sm font-medium text-gray-500 mb-3">UPCOMING HOLIDAYS</h4>
              <div className="space-y-3">
                {getUpcomingHolidays().map(holiday => (
                  <div key={holiday._id} className="flex items-center p-3 bg-indigo-50 rounded-lg">
                    <div className="flex-shrink-0 h-10 w-10 bg-indigo-100 rounded-lg flex items-center justify-center text-indigo-600 font-semibold">
                      {dayjs(holiday.date).format('DD')}
                    </div>
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-900">{holiday.name}</p>
                      <p className="text-xs text-gray-500">{formatDate(holiday.date)}</p>
                    </div>
                  </div>
                ))}
                {getUpcomingHolidays().length === 0 && (
                  <p className="text-sm text-gray-500">No upcoming holidays</p>
                )}
              </div>
            </div>
            
            {/* All Holidays Table */}
            <div>
              <h4 className="text-sm font-medium text-gray-500 mb-3">ALL HOLIDAYS ({currentYear})</h4>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Holiday</th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Description</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {holidays.map((holiday) => (
                      <tr key={holiday._id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          {formatDate(holiday.date)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {holiday.name}
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-500">
                          {holiday.description || '-'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

export default EmployeeHolidayCalendar;