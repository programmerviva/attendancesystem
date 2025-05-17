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
  const [showCompOffCalendar, setShowCompOffCalendar] = useState(false);
  const [useCompOff, setUseCompOff] = useState(false);

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
    fetchLeaveBalance();
  }, []);

  const fetchLeaveBalance = async () => {
    try {
      // डेवलपमेंट के लिए डमी डेटा
      setLeaveBalance({
        sick: 12,
        comp: 3,
        short: 6,
        vacation: 15
      });
      
      // बाद में इसे अनकमेंट करें
      /*
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
      */
    } catch (err) {
      console.error('Error fetching leave balance:', err);
    }
  };

  const handleLeaveTypeChange = (type) => {
    setLeaveType(type);
    setDropdownOpen(false);
    
    if (type === 'comp') {
      // डेवलपमेंट के लिए डमी डेटा
      setCompOffDates([
        '2024-05-12',
        '2024-05-19',
        '2024-05-26'
      ]);
      setShowCompOffCalendar(true);
      setUseCompOff(true);
      
      // बाद में इसे अनकमेंट करें
      /*
      fetchCompOffDates();
      */
    } else {
      if (!useCompOff) {
        setShowCompOffCalendar(false);
        setSelectedCompOffDate(null);
      }
    }
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
      setShowCompOffCalendar(true);
    } catch (err) {
      console.error('Error fetching comp off dates:', err);
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

    // For comp off or when using comp off with other leave types, validate that a comp off date is selected
    if ((leaveType === 'comp' || useCompOff) && !selectedCompOffDate) {
      setError('Please select a comp off date to use');
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

      // Add comp off date if applicable (for comp off leave type or when using comp off with other leave types)
      if (leaveType === 'comp' || useCompOff) {
        payload.compOffDate = selectedCompOffDate;
        payload.useCompOff = true;
      }

      // For development, just simulate a successful response
      setTimeout(() => {
        setSuccess('Leave request submitted successfully!');
        
        // Reset form
        setLeaveType('sick');
        setStartDate(dayjs().add(1, 'day').format('YYYY-MM-DD'));
        setEndDate(dayjs().add(1, 'day').format('YYYY-MM-DD'));
        setReason('');
        setSelectedCompOffDate(null);
        setShowCompOffCalendar(false);
        setUseCompOff(false);
        
        // Notify parent component about the new leave request
        if (onLeaveSubmitted) {
          // Create a mock leave object to pass to the parent
          const mockLeave = {
            id: 'temp-' + Date.now(),
            leaveType,
            startDate,
            endDate,
            reason,
            status: 'pending',
            compOffDate: selectedCompOffDate,
            useCompOff: leaveType === 'comp' || useCompOff
          };
          onLeaveSubmitted(mockLeave);
        }
        
        setLoading(false);
      }, 1000);

      // In production, use this code instead:
      /*
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
      setShowCompOffCalendar(false);
      
      // Refresh leave balance
      fetchLeaveBalance();
      
      // Notify parent component
      if (onLeaveSubmitted) {
        onLeaveSubmitted(response.data.data.leave);
      }
      */
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

        {/* Use Comp Off Option */}
        {leaveType !== 'comp' && leaveBalance.comp > 0 && (
          <div className="flex items-center">
            <input
              id="useCompOff"
              type="checkbox"
              checked={useCompOff}
              onChange={(e) => {
                setUseCompOff(e.target.checked);
                if (e.target.checked) {
                  // Load comp off dates
                  setCompOffDates([
                    '2024-05-12',
                    '2024-05-19',
                    '2024-05-26'
                  ]);
                  setShowCompOffCalendar(true);
                } else {
                  setShowCompOffCalendar(false);
                  setSelectedCompOffDate(null);
                }
              }}
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
            />
            <label htmlFor="useCompOff" className="ml-2 block text-sm text-gray-700">
              Use comp off days instead of regular leave balance
            </label>
          </div>
        )}

        {/* Comp Off Calendar - Show when comp off is selected or useCompOff is true */}
        {showCompOffCalendar && (
          <div className="border border-gray-200 rounded-lg p-4">
            <h3 className="text-sm font-medium text-gray-700 mb-2">Select Comp Off Date to Use</h3>
            {compOffDates.length === 0 ? (
              <p className="text-sm text-red-600">No comp off days available. You need to work on a weekend first.</p>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
                {compOffDates.map(date => (
                  <div 
                    key={date} 
                    className={`p-2 border rounded-md cursor-pointer text-center ${
                      selectedCompOffDate === date 
                        ? 'bg-blue-100 border-blue-500' 
                        : 'hover:bg-gray-50'
                    }`}
                    onClick={() => setSelectedCompOffDate(date)}
                  >
                    <div className="text-xs font-medium">{formatDate(date)}</div>
                    <div className="text-xs text-gray-500">
                      {isWeekend(date) ? 'Weekend' : 'Weekday'}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

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
            disabled={loading || ((leaveType === 'comp' || useCompOff) && !selectedCompOffDate)}
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