import React, { useState } from 'react';
import axios from 'axios';
import dayjs from 'dayjs';

function LeaveRequestForm({ onLeaveSubmitted }) {
  const [leaveType, setLeaveType] = useState('full');
  const [startDate, setStartDate] = useState(dayjs().add(1, 'day').format('YYYY-MM-DD'));
  const [endDate, setEndDate] = useState(dayjs().add(1, 'day').format('YYYY-MM-DD'));
  const [reason, setReason] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  const token = localStorage.getItem('token');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(null);

    // Validate dates
    const start = dayjs(startDate);
    const end = dayjs(endDate);
    const today = dayjs().startOf('day');

    if (start.isBefore(today)) {
      setError('Start date cannot be in the past');
      setLoading(false);
      return;
    }

    if (end.isBefore(start)) {
      setError('End date cannot be before start date');
      setLoading(false);
      return;
    }

    try {
      const response = await axios.post(
        'http://localhost:5000/api/v1/leaves',
        {
          leaveType,
          startDate,
          endDate,
          reason,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setSuccess('Leave request submitted successfully!');
      
      // Reset form
      setLeaveType('full');
      setStartDate(dayjs().add(1, 'day').format('YYYY-MM-DD'));
      setEndDate(dayjs().add(1, 'day').format('YYYY-MM-DD'));
      setReason('');
      
      // Notify parent component
      if (onLeaveSubmitted) {
        onLeaveSubmitted(response.data.data.leave);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to submit leave request');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white shadow-lg rounded-lg p-6">
      <h2 className="text-2xl font-bold text-gray-800 mb-6">Request Leave</h2>
      
      {error && (
        <div className="mb-6 bg-red-50 border-l-4 border-red-500 p-4 rounded-md">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-red-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
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
              <svg className="h-5 w-5 text-green-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm text-green-700">{success}</p>
            </div>
          </div>
        </div>
      )}
      
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Leave Type */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Leave Type</label>
          <div className="grid grid-cols-3 gap-3">
            <button
              type="button"
              onClick={() => setLeaveType('full')}
              className={`p-3 rounded-lg border transition-all ${
                leaveType === 'full'
                  ? 'border-blue-500 bg-blue-50 shadow-sm'
                  : 'border-gray-300 hover:border-blue-300'
              }`}
            >
              <span className={`font-medium ${leaveType === 'full' ? 'text-blue-700' : 'text-gray-700'}`}>
                Full Day
              </span>
            </button>
            <button
              type="button"
              onClick={() => setLeaveType('half')}
              className={`p-3 rounded-lg border transition-all ${
                leaveType === 'half'
                  ? 'border-blue-500 bg-blue-50 shadow-sm'
                  : 'border-gray-300 hover:border-blue-300'
              }`}
            >
              <span className={`font-medium ${leaveType === 'half' ? 'text-blue-700' : 'text-gray-700'}`}>
                Half Day
              </span>
            </button>
            <button
              type="button"
              onClick={() => setLeaveType('sick')}
              className={`p-3 rounded-lg border transition-all ${
                leaveType === 'sick'
                  ? 'border-blue-500 bg-blue-50 shadow-sm'
                  : 'border-gray-300 hover:border-blue-300'
              }`}
            >
              <span className={`font-medium ${leaveType === 'sick' ? 'text-blue-700' : 'text-gray-700'}`}>
                Sick Leave
              </span>
            </button>
          </div>
        </div>

        {/* Date Fields */}
        <div className="grid md:grid-cols-2 gap-6">
          <div>
            <label htmlFor="startDate" className="block text-sm font-medium text-gray-700 mb-2">Start Date</label>
            <input
              type="date"
              id="startDate"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              min={dayjs().format('YYYY-MM-DD')}
              className="w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              required
            />
          </div>
          <div>
            <label htmlFor="endDate" className="block text-sm font-medium text-gray-700 mb-2">End Date</label>
            <input
              type="date"
              id="endDate"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              min={startDate}
              className="w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              required
            />
          </div>
        </div>

        {/* Reason */}
        <div>
          <label htmlFor="reason" className="block text-sm font-medium text-gray-700 mb-2">Reason</label>
          <textarea
            id="reason"
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            rows={4}
            className="w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            placeholder="Please provide a reason for your leave request..."
            required
          />
        </div>

        {/* Submit Button */}
        <div>
          <button
            type="submit"
            disabled={loading}
            className="w-full py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? (
              <span className="flex items-center justify-center">
                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Submitting...
              </span>
            ) : (
              'Submit Leave Request'
            )}
          </button>
        </div>
      </form>
    </div>
  );
}

export default LeaveRequestForm;