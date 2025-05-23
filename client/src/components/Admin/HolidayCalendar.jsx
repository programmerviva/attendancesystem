/* eslint-disable no-unused-vars */
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import dayjs from 'dayjs';

function HolidayCalendar() {
  const [holidays, setHolidays] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [newHoliday, setNewHoliday] = useState({
    date: dayjs().format('YYYY-MM-DD'),
    name: '',
    description: '',
  });
  const [isAddingHoliday, setIsAddingHoliday] = useState(false);
  const [editingHolidayId, setEditingHolidayId] = useState(null);

  const token = localStorage.getItem('token');
  const apiUrl = import.meta.env.VITE_API_URL;

  useEffect(() => {
    fetchHolidays();
  }, []);

  const fetchHolidays = async () => {
    setLoading(true);
    try {
      const response = await axios.get(`${apiUrl}/api/v1/settings/holidays`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      setHolidays(response.data.data.holidays || []);
      setError(null);
    } catch (err) {
      console.error('Error fetching holidays:', err);
      setError('Failed to fetch holidays. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewHoliday((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleAddHoliday = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await axios.post(`${apiUrl}/api/v1/settings/holidays`, newHoliday, {
        headers: { Authorization: `Bearer ${token}` },
      });

      // Reset form and refresh holidays
      setNewHoliday({
        date: dayjs().format('YYYY-MM-DD'),
        name: '',
        description: '',
      });
      setIsAddingHoliday(false);
      fetchHolidays();
    } catch (err) {
      console.error('Error adding holiday:', err);
      setError('Failed to add holiday. Please try again.');
      setLoading(false);
    }
  };

  const handleEditHoliday = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      await axios.patch(`${apiUrl}/api/v1/settings/holidays/${editingHolidayId}`, newHoliday, {
        headers: { Authorization: `Bearer ${token}` },
      });

      // Reset form and refresh holidays
      setNewHoliday({
        date: dayjs().format('YYYY-MM-DD'),
        name: '',
        description: '',
      });
      setEditingHolidayId(null);
      fetchHolidays();
    } catch (err) {
      console.error('Error updating holiday:', err);
      setError('Failed to update holiday. Please try again.');
      setLoading(false);
    }
  };

  const handleDeleteHoliday = async (id) => {
    if (!window.confirm('Are you sure you want to delete this holiday?')) return;

    setLoading(true);
    try {
      await axios.delete(`${apiUrl}/api/v1/settings/holidays/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      fetchHolidays();
    } catch (err) {
      console.error('Error deleting holiday:', err);
      setError('Failed to delete holiday. Please try again.');
      setLoading(false);
    }
  };

  const startEditHoliday = (holiday) => {
    setNewHoliday({
      date: dayjs(holiday.date).format('YYYY-MM-DD'),
      name: holiday.name,
      description: holiday.description || '',
    });
    setEditingHolidayId(holiday._id);
  };

  const cancelEdit = () => {
    setNewHoliday({
      date: dayjs().format('YYYY-MM-DD'),
      name: '',
      description: '',
    });
    setEditingHolidayId(null);
    setIsAddingHoliday(false);
  };

  const formatDate = (dateString) => {
    return dayjs(dateString).format('MMM DD, YYYY');
  };

  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-semibold text-gray-800">Company Holidays</h2>
        {!isAddingHoliday && !editingHolidayId && (
          <button
            onClick={() => setIsAddingHoliday(true)}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md text-sm font-medium"
          >
            Add Holiday
          </button>
        )}
      </div>

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

      {/* Add/Edit Holiday Form */}
      {(isAddingHoliday || editingHolidayId) && (
        <div className="mb-6 bg-gray-50 p-4 rounded-lg">
          <h3 className="text-lg font-medium mb-4">
            {editingHolidayId ? 'Edit Holiday' : 'Add New Holiday'}
          </h3>
          <form onSubmit={editingHolidayId ? handleEditHoliday : handleAddHoliday}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div>
                <label htmlFor="date" className="block text-sm font-medium text-gray-700 mb-1">
                  Date
                </label>
                <input
                  type="date"
                  id="date"
                  name="date"
                  value={newHoliday.date}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  required
                />
              </div>
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                  Holiday Name
                </label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={newHoliday.name}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  placeholder="e.g. New Year's Day"
                  required
                />
              </div>
            </div>
            <div className="mb-4">
              <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
                Description (Optional)
              </label>
              <textarea
                id="description"
                name="description"
                value={newHoliday.description}
                onChange={handleInputChange}
                rows="2"
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                placeholder="Add any additional information about this holiday"
              ></textarea>
            </div>
            <div className="flex justify-end space-x-3">
              <button
                type="button"
                onClick={cancelEdit}
                className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                disabled={loading}
              >
                {loading ? 'Saving...' : editingHolidayId ? 'Update Holiday' : 'Add Holiday'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Holidays List */}
      {loading && !isAddingHoliday && !editingHolidayId ? (
        <div className="flex justify-center py-8">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      ) : holidays.length === 0 ? (
        <div className="text-center py-8 bg-gray-50 rounded-lg">
          <svg
            className="mx-auto h-12 w-12 text-gray-400"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1}
              d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
            />
          </svg>
          <h3 className="mt-2 text-sm font-medium text-gray-900">No holidays defined</h3>
          <p className="mt-1 text-sm text-gray-500">Get started by adding a company holiday.</p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  Date
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  Holiday Name
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  Description
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  Actions
                </th>
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
                  <td className="px-6 py-4 text-sm text-gray-500">{holiday.description || '-'}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <button
                      onClick={() => startEditHoliday(holiday)}
                      className="text-blue-600 hover:text-blue-900 mr-4"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDeleteHoliday(holiday._id)}
                      className="text-red-600 hover:text-red-900"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

export default HolidayCalendar;
