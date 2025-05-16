import React, { useState, useEffect } from 'react';
import dayjs from 'dayjs';

function SimpleAttendanceCalendar({ employeeId, onClose }) {
  const [currentMonth, setCurrentMonth] = useState(dayjs().month());
  const [currentYear, setCurrentYear] = useState(dayjs().year());
  const [attendanceData, setAttendanceData] = useState([]);
  const [loading, setLoading] = useState(true);

  // Sample data - in a real app, this would come from an API
  useEffect(() => {
    setLoading(true);
    
    // Simulate API call with timeout
    setTimeout(() => {
      // Generate sample attendance data for the month
      const daysInMonth = dayjs().year(currentYear).month(currentMonth).daysInMonth();
      const sampleData = [];
      
      for (let i = 1; i <= daysInMonth; i++) {
        // Skip weekends (Saturday = 6, Sunday = 0)
        const dayOfWeek = dayjs().year(currentYear).month(currentMonth).date(i).day();
        if (dayOfWeek === 0 || dayOfWeek === 6) continue;
        
        // Random attendance status
        const random = Math.random();
        let status, checkInTime;
        
        if (random < 0.7) {
          // Present - on time (70% chance)
          status = 'present';
          checkInTime = '09:00';
        } else if (random < 0.85) {
          // Short leave (15% chance)
          status = 'short-leave';
          checkInTime = '10:45';
        } else if (random < 0.95) {
          // Half day (10% chance)
          status = 'half-day';
          checkInTime = '13:30';
        } else {
          // Absent (5% chance)
          status = 'absent';
          checkInTime = null;
        }
        
        if (checkInTime) {
          sampleData.push({
            date: dayjs().year(currentYear).month(currentMonth).date(i).format('YYYY-MM-DD'),
            checkIn: {
              time: dayjs().year(currentYear).month(currentMonth).date(i).hour(parseInt(checkInTime.split(':')[0])).minute(parseInt(checkInTime.split(':')[1])).format()
            },
            status
          });
        }
      }
      
      setAttendanceData(sampleData);
      setLoading(false);
    }, 1000);
  }, [currentMonth, currentYear]);

  const getAttendanceStatus = (date) => {
    const dayRecord = attendanceData.find(record => 
      record.date === date
    );
    
    // Check if it's a weekend
    const dayOfWeek = dayjs(date).day();
    if (dayOfWeek === 0 || dayOfWeek === 6) {
      return { status: 'weekend', color: 'bg-gray-200' };
    }
    
    if (!dayRecord) {
      return { status: 'absent', color: 'bg-red-200' };
    }
    
    switch (dayRecord.status) {
      case 'present':
        return { status: 'present', color: 'bg-green-200' };
      case 'short-leave':
        return { status: 'short-leave', color: 'bg-blue-200' };
      case 'half-day':
        return { status: 'half-day', color: 'bg-yellow-200' };
      default:
        return { status: 'absent', color: 'bg-red-200' };
    }
  };

  const renderCalendar = () => {
    const daysInMonth = dayjs().year(currentYear).month(currentMonth).daysInMonth();
    const firstDayOfMonth = dayjs().year(currentYear).month(currentMonth).startOf('month').day(); // 0 = Sunday
    
    const days = [];
    
    // Add empty cells for days before the first day of the month
    for (let i = 0; i < firstDayOfMonth; i++) {
      days.push(<div key={`empty-${i}`} className="h-12 border border-gray-200"></div>);
    }
    
    // Add cells for each day of the month
    for (let day = 1; day <= daysInMonth; day++) {
      const date = dayjs().year(currentYear).month(currentMonth).date(day).format('YYYY-MM-DD');
      const { status, color } = getAttendanceStatus(date);
      
      days.push(
        <div 
          key={day} 
          className={`h-12 border border-gray-200 ${color} flex flex-col justify-between p-1 cursor-pointer hover:border-blue-500`}
          onClick={() => showDayDetails(date)}
        >
          <span className="text-xs font-medium">{day}</span>
          <span className="text-xs capitalize">{status.replace('-', ' ')}</span>
        </div>
      );
    }
    
    return days;
  };

  const showDayDetails = (date) => {
    const dayRecord = attendanceData.find(record => 
      record.date === date
    );
    
    // Check if it's a weekend
    const dayOfWeek = dayjs(date).day();
    if (dayOfWeek === 0 || dayOfWeek === 6) {
      alert(`${date}: Weekend`);
      return;
    }
    
    if (!dayRecord) {
      alert(`${date}: Absent`);
      return;
    }
    
    const checkInTime = dayRecord.checkIn?.time ? dayjs(dayRecord.checkIn.time).format('hh:mm A') : 'N/A';
    
    alert(`Date: ${date}\nCheck-in: ${checkInTime}\nStatus: ${dayRecord.status}`);
  };

  const previousMonth = () => {
    if (currentMonth === 0) {
      setCurrentMonth(11);
      setCurrentYear(currentYear - 1);
    } else {
      setCurrentMonth(currentMonth - 1);
    }
  };

  const nextMonth = () => {
    if (currentMonth === 11) {
      setCurrentMonth(0);
      setCurrentYear(currentYear + 1);
    } else {
      setCurrentMonth(currentMonth + 1);
    }
  };

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  // Calculate attendance statistics
  const presentDays = attendanceData.filter(record => 
    record.status === 'present'
  ).length;
  
  const shortLeaveDays = attendanceData.filter(record => 
    record.status === 'short-leave'
  ).length;
  
  const halfDays = attendanceData.filter(record => 
    record.status === 'half-day'
  ).length;
  
  // Calculate weekends
  const weekendDays = Array.from({ length: dayjs().year(currentYear).month(currentMonth).daysInMonth() }, 
    (_, i) => dayjs().year(currentYear).month(currentMonth).date(i + 1).day())
    .filter(day => day === 0 || day === 6).length;
  
  // Calculate absent days (excluding weekends)
  const workingDays = dayjs().year(currentYear).month(currentMonth).daysInMonth() - weekendDays;
  const absentDays = workingDays - presentDays - shortLeaveDays - halfDays;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-5xl max-h-[90vh] overflow-y-auto">
        <div className="bg-gradient-to-r from-blue-600 to-blue-800 px-6 py-4 flex justify-between items-center">
          <h2 className="text-xl font-bold text-white">Employee Attendance Calendar</h2>
          <button 
            onClick={onClose}
            className="text-white hover:text-gray-200"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Left Column - Monthly Summary */}
            <div className="md:col-span-1">
              <div className="bg-gray-50 p-4 rounded-lg h-full">
                <h3 className="text-lg font-medium mb-4">Monthly Summary</h3>
                <div className="space-y-4">
                  <div>
                    <p className="text-sm text-gray-500">Present Days</p>
                    <p className="font-medium text-lg">{presentDays}</p>
                    <div className="w-full bg-gray-200 rounded-full h-2 mt-1">
                      <div className="bg-green-500 h-2 rounded-full" style={{ width: `${(presentDays / workingDays) * 100}%` }}></div>
                    </div>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Short Leaves</p>
                    <p className="font-medium text-lg">{shortLeaveDays}</p>
                    <div className="w-full bg-gray-200 rounded-full h-2 mt-1">
                      <div className="bg-blue-500 h-2 rounded-full" style={{ width: `${(shortLeaveDays / workingDays) * 100}%` }}></div>
                    </div>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Half Days</p>
                    <p className="font-medium text-lg">{halfDays}</p>
                    <div className="w-full bg-gray-200 rounded-full h-2 mt-1">
                      <div className="bg-yellow-500 h-2 rounded-full" style={{ width: `${(halfDays / workingDays) * 100}%` }}></div>
                    </div>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Absent Days</p>
                    <p className="font-medium text-lg">{absentDays}</p>
                    <div className="w-full bg-gray-200 rounded-full h-2 mt-1">
                      <div className="bg-red-500 h-2 rounded-full" style={{ width: `${(absentDays / workingDays) * 100}%` }}></div>
                    </div>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Weekends</p>
                    <p className="font-medium text-lg">{weekendDays}</p>
                  </div>
                  <div className="pt-4 border-t border-gray-200">
                    <p className="text-sm text-gray-500">Total Working Days</p>
                    <p className="font-medium text-lg">{workingDays}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Attendance Rate</p>
                    <p className="font-medium text-lg">{Math.round((presentDays / workingDays) * 100)}%</p>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Right Column - Calendar */}
            <div className="md:col-span-2">
              {/* Month Navigation */}
              <div className="flex justify-between items-center mb-4">
                <button 
                  onClick={previousMonth}
                  className="p-2 rounded-full hover:bg-gray-200"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                </button>
                <h3 className="text-lg font-medium">{monthNames[currentMonth]} {currentYear}</h3>
                <button 
                  onClick={nextMonth}
                  className="p-2 rounded-full hover:bg-gray-200"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                  </svg>
                </button>
              </div>

              {/* Calendar Legend */}
              <div className="flex flex-wrap gap-2 mb-4">
                <div className="flex items-center">
                  <div className="w-4 h-4 bg-green-200 mr-1"></div>
                  <span className="text-xs">Present</span>
                </div>
                <div className="flex items-center">
                  <div className="w-4 h-4 bg-blue-200 mr-1"></div>
                  <span className="text-xs">Short Leave</span>
                </div>
                <div className="flex items-center">
                  <div className="w-4 h-4 bg-yellow-200 mr-1"></div>
                  <span className="text-xs">Half Day</span>
                </div>
                <div className="flex items-center">
                  <div className="w-4 h-4 bg-red-200 mr-1"></div>
                  <span className="text-xs">Absent</span>
                </div>
                <div className="flex items-center">
                  <div className="w-4 h-4 bg-gray-200 mr-1"></div>
                  <span className="text-xs">Weekend</span>
                </div>
              </div>

              {/* Calendar */}
              {loading ? (
                <div className="flex justify-center py-8">
                  <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
                </div>
              ) : (
                <div>
                  {/* Day headers */}
                  <div className="grid grid-cols-7 gap-1 mb-1">
                    {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                      <div key={day} className="text-center font-medium text-sm py-2 bg-gray-100">
                        {day}
                      </div>
                    ))}
                  </div>
                  
                  {/* Calendar grid */}
                  <div className="grid grid-cols-7 gap-1">
                    {renderCalendar()}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default SimpleAttendanceCalendar;