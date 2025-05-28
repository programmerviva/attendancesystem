import Attendance from '../models/Attendance.js';
import OutdoorDuty from '../models/OutdoorDuty.js';
import Settings from '../models/Settings.js';
import dayjs from 'dayjs';

/**
 * Auto checkout for employees with evening outdoor duty
 * This function can be scheduled to run at the end of each workday
 */
export const autoCheckoutForODEmployees = async () => {
  try {
    const today = dayjs().format('YYYY-MM-DD');
    const settings = await Settings.findOne();
    const officeHours = settings ? settings.officeHours : { start: '09:00', end: '18:00' };
    
    // Find all approved outdoor duties for today
    const outdoorDuties = await OutdoorDuty.find({
      date: today,
      status: 'approved'
    });
    
    // Process each outdoor duty
    for (const od of outdoorDuties) {
      // Check if OD covers end of day
      const officeEndTime = dayjs().hour(parseInt(officeHours.end.split(':')[0]))
                                  .minute(parseInt(officeHours.end.split(':')[1] || '0'))
                                  .second(0);
      const odEndTime = dayjs(od.endTime);
      
      // If OD ends after office hours
      if (odEndTime.isAfter(officeEndTime) || odEndTime.hour() >= officeEndTime.hour()) {
        // Find attendance record for this user
        const attendance = await Attendance.findOne({
          user: od.user,
          date: today,
        });
        
        // If user has checked in but not checked out
        if (attendance && attendance.checkIn && attendance.checkIn.time && !attendance.checkOut) {
          // Auto checkout at office end time
          attendance.checkOut = {
            time: officeEndTime.toDate(),
            latitude: null,
            longitude: null,
            address: 'Auto checkout due to evening outdoor duty',
          };
          
          // Calculate work hours
          const checkInTime = dayjs(attendance.checkIn.time);
          const workHours = officeEndTime.diff(checkInTime, 'hour', true).toFixed(2);
          attendance.workHours = parseFloat(workHours);
          
          // Calculate OD hours
          const odStartTime = dayjs(od.startTime);
          const odHours = odEndTime.diff(odStartTime, 'hour', true).toFixed(2);
          attendance.outdoorDutyHours = parseFloat(odHours);
          
          // Store OD details
          attendance.outdoorDutyDetails = {
            startTime: od.startTime,
            endTime: od.endTime,
            reason: od.reason,
            outdoorDutyId: od._id
          };
          
          // Calculate total hours
          attendance.totalHours = parseFloat((parseFloat(workHours) + parseFloat(odHours)).toFixed(2));
          
          // Mark as present
          attendance.status = 'present';
          attendance.remarks = attendance.remarks || '';
          attendance.remarks += ' Auto checkout due to evening outdoor duty.';
          
          await attendance.save();
          console.log(`Auto checkout completed for user ${od.user} with evening OD`);
        }
      }
    }
    
    return { success: true, message: 'Auto checkout process completed' };
  } catch (error) {
    console.error('Error in auto checkout process:', error);
    return { success: false, message: error.message };
  }
};