import React, { useState, useEffect } from 'react';
import axios from 'axios';
import dayjs from 'dayjs';

function LeaveRequestForm({ onLeaveSubmitted }) {
  const [leaveType, setLeaveType] = useState('sick');
  const [startDate, setStartDate] = useState(dayjs().add(1, 'day').format('YYYY-MM-DD'));
  const [endDate, setEndDate] = useState(dayjs().add(1, 'day').format('YYYY-MM-DD'));
  const [reason, setReason] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [leaveBalance, setLeaveBalance] = useState({
    sick: 0,
    comp: 0,
    short: 0,
    vacation: 0
  });
  const [compOffDates, setCompOffDates] = useState([]);
  const [selectedCompOffDate, setSelectedCompOffDate] = useState(null);

  const token = localStorage.getItem('token');

  const leaveTypes = [
    { id: 'sick', name: 'Sick Leave' },
    { id: 'short', name: 'Short Leave' },
    { id: 'comp', name: 'Comp Off' },
    { id: 'vacation', name: 'Vacation' }
  ];

  // Financial year calculation
  const getCurrentFinancialYear = () => {
    const today = dayjs();
    const month = today.month(); // 0-indexed (0 = January)
    const year = today.year();
    
    // If current month is before April (0-3), financial year started last year
    if (month < 3) {
      return { start: `${year-1}-04-01`, end: `${year}-03-31` };
    } else {
      return { start: `${year}-04-01`, end: `${year+1}-03-31` };
    }
  };

  const financialYear = getCurrentFinancialYear();

  useEffect(() => {
    // Fetch real data from the server
    fetchLeaveBalance();
    fetchCompOffDates();
  }, []);

  const fetchLeaveBalance = async () => {
    try {
      const response = await axios.get('http://localhost:5000/api/v1/leaves/balance', {
        headers: { Authorization: `Bearer ${token}` },
        params: { 
          startDate: financialYear.start,
          endDate: dayjs().format('YYYY-MM-DD')
        }
      });
      
      setLeaveBalance(response.data.data.balance || {
        sick: 0,
        comp: 0,
        short: 0,
        vacation: 0
      });
    } catch (err) {
      console.error('Error fetching leave balance:', err);
    }
  };

  const handleLeaveTypeChange = (type) => {
    setLeaveType(type);
    setDropdownOpen(false);
    setSelectedCompOffDate(null);
  };

  const fetchCompOffDates = async () => {
    try {
      const response = await axios.get('http://localhost:5000/api/v1/attendance/compoff-dates', {
        headers: { Authorization: `Bearer ${token}` },
        params: { 
          startDate: financialYear.start,
          endDate: dayjs().format('YYYY-MM-DD')
        }
      });
      
      setCompOffDates(response.data.data.dates || []);
    } catch (err) {
      console.error('Error fetching comp off dates:', err);
      setError('Failed to fetch comp off dates. Please try again later.');
    }
  };

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
      const payload = {
        leaveType,
        startDate,
        endDate,
        reason
      };

      // Add comp off date if selected
      if (selectedCompOffDate) {
        payload.compOffDate = selectedCompOffDate;
        payload.useCompOff = true;
      }

      // Send the request to the server
      const response = await axios.post(
        'http://localhost:5000/api/v1/leaves',
        payload,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setSuccess('Leave request submitted successfully!');
      
      // Reset form
      setLeaveType('sick');
      setStartDate(dayjs().add(1, 'day').format('YYYY-MM-DD'));
      setEndDate(dayjs().add(1, 'day').format('YYYY-MM-DD'));
      setReason('');
      setSelectedCompOffDate(null);
      
      // Refresh leave balance
      fetchLeaveBalance();
      
      // Notify parent component
      if (onLeaveSubmitted) {
        onLeaveSubmitted(response.data.data.leave);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to submit leave request');
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    return dayjs(dateString).format('MMM DD, YYYY');
  };

  const isWeekend = (dateString) => {
    const day = dayjs(dateString).day();
    return day === 0 || day === 6; // 0 is Sunday, 6 is Saturday
  };

  return (
    <div className="bg-white shadow-lg rounded-lg p-6">
      <div className="flex justify-between items-start mb-6">
        <h2 className="text-2xl font-bold text-gray-800">Request Leave</h2>
        <div className="bg-blue-50 p-3 rounded-lg">
          <h3 className="text-sm font-medium text-blue-800 mb-2">Leave Balance (FY {financialYear.start.substring(0, 4)}-{financialYear.end.substring(0, 4)})</h3>
          <div className="grid grid-cols-2 gap-x-4 gap-y-1">
            <div className="text-xs">Sick Leave: <span className="font-medium">{leaveBalance.sick} days</span></div>
            <div className="text-xs">Comp Off: <span className="font-medium">{leaveBalance.comp} days</span></div>
            <div className="text-xs">Short Leave: <span className="font-medium">{leaveBalance.short} days</span></div>
            <div className="text-xs">Vacation: <span className="font-medium">{leaveBalance.vacation} days</span></div>
          </div>
        </div>
      </div>
      
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
        {/* Leave Type Dropdown */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Leave Type</label>
          <div className="relative">
            <button
              type="button"
              className="w-full bg-white border border-gray-300 rounded-md shadow-sm px-4 py-2 text-left focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
              onClick={() => setDropdownOpen(!dropdownOpen)}
            >
              <span className="flex items-center justify-between">
                <span>{leaveTypes.find(type => type.id === leaveType)?.name || 'Select Leave Type'}</span>
                <svg className="h-5 w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
              </span>
            </button>
            
            {dropdownOpen && (
              <div className="absolute z-10 mt-1 w-full bg-white shadow-lg rounded-md py-1 text-base ring-1 ring-black ring-opacity-5 focus:outline-none">
                {leaveTypes.map((type) => (
                  <div
                    key={type.id}
                    className={`cursor-pointer select-none relative py-2 pl-3 pr-9 hover:bg-gray-100 ${
                      leaveType === type.id ? 'bg-blue-50 text-blue-700' : 'text-gray-900'
                    }`}
                    onClick={() => handleLeaveTypeChange(type.id)}
                  >
                    <span className="block truncate">{type.name}</span>
                    {leaveType === type.id && (
                      <span className="absolute inset-y-0 right-0 flex items-center pr-4">
                        <svg className="h-5 w-5 text-blue-600" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                      </span>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Comp Off Calendar - Always show for all leave types */}
        <div className="border border-gray-200 rounded-lg p-4">
          <h3 className="text-sm font-medium text-gray-700 mb-2">
            {leaveType === 'comp' ? 'Select Comp Off Date to Use (Required)' : 'Select Comp Off Date to Use (Optional)'}
          </h3>
          <p className="text-xs text-blue-600 mb-3">
            {leaveType === 'comp' 
              ? 'You must select a comp off date to submit this request.' 
              : 'If you select a comp off date, your salary will not be deducted for this leave.'}
          </p>
          
          {compOffDates.length > 0 ? (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
              {compOffDates.map(date => (
                <div 
                  key={date} 
                  className={`p-2 border rounded-md cursor-pointer text-center ${
                    selectedCompOffDate === date 
                      ? 'bg-blue-100 border-blue-500' 
                      : 'hover:bg-gray-50'
                  }`}
                  onClick={() => setSelectedCompOffDate(date === selectedCompOffDate ? null : date)}
                >
                  <div className="text-xs font-medium">{formatDate(date)}</div>
                  <div className="text-xs text-gray-500">
                    {isWeekend(date) ? 'Weekend' : 'Weekday'}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="bg-yellow-50 p-4 rounded-md border border-yellow-200">
              <div className="flex">
                <div className="flex-shrink-0">
                  <svg className="h-5 w-5 text-yellow-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-yellow-800">No Comp Off Dates Available</h3>
                  <div className="mt-2 text-sm text-yellow-700">
                    <p>You don't have any comp off dates available. To earn comp off days, you need to work on weekends or holidays.</p>
                    {leaveType === 'comp' && (
                      <p className="mt-1 font-medium">You cannot submit a Comp Off leave request without available comp off days.</p>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}
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
            disabled={loading || (leaveType === 'comp' && (!selectedCompOffDate || compOffDates.length === 0))}
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