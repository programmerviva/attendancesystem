import Attendance from '../models/Attendance.js';
import User from '../models/User.js';
import Settings from '../models/Settings.js';
import OutdoorDuty from '../models/OutdoorDuty.js';
import AppError from '../utils/appError.js';
import dayjs from 'dayjs';

// Create or update attendance record
export const createAttendance = async (req, res, next) => {
  try {
    const { type, latitude, longitude, address, time } = req.body;
    const userId = req.user._id;

    // Validate type
    if (!['checkin', 'checkout'].includes(type)) {
      return next(new AppError('Type must be either checkin or checkout', 400));
    }

    // Get system settings for geofence radius and office hours
    const settings = await Settings.findOne();
    const geofenceRadius = settings ? settings.geofenceRadius : 150; // Default to 150m if no settings
    const officeHours = settings ? settings.officeHours : { start: '09:00', end: '18:00' };

    // Check if user has approved outdoor duty for today
    const today = dayjs(time).format('YYYY-MM-DD');
    const outdoorDuty = await OutdoorDuty.findOne({
      user: userId,
      date: today,
      status: 'approved',
    });

    const isOutdoorDuty = !!outdoorDuty;

    // Only validate location if not on outdoor duty
    if (!isOutdoorDuty && latitude && longitude) {
      // Calculate distance from office
      const OFFICE_LAT = 28.4067738;
      const OFFICE_LON = 77.0414672;

      // Function to calculate distance between two coordinates
      const calculateDistance = (lat1, lon1, lat2, lon2) => {
        const R = 6371e3; // Earth radius in meters
        const φ1 = (lat1 * Math.PI) / 180;
        const φ2 = (lat2 * Math.PI) / 180;
        const Δφ = ((lat2 - lat1) * Math.PI) / 180;
        const Δλ = ((lon2 - lon1) * Math.PI) / 180;

        const a =
          Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
          Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);

        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

        return R * c; // in meters
      };

      const distanceFromOffice = calculateDistance(latitude, longitude, OFFICE_LAT, OFFICE_LON);

      // Validate distance - ensure strict enforcement of geofence radius
      // Round to 2 decimal places for more precise comparison
      const roundedDistance = Math.round(distanceFromOffice * 100) / 100;
      const roundedRadius = Math.round(geofenceRadius * 100) / 100;

      if (roundedDistance > roundedRadius) {
        return next(
          new AppError(
            `You are not within ${geofenceRadius} meters of the office. Current distance: ${roundedDistance} meters`,
            400
          )
        );
      }
    }

    // Check if attendance record exists for today
    let attendance = await Attendance.findOne({
      user: userId,
      date: today,
    });

    // If no attendance record exists, create one
    if (!attendance) {
      attendance = new Attendance({
        user: userId,
        date: today,
        status: 'present', // Always set to present when checking in
        isOutdoorDuty,
      });

      // If it's an outdoor duty, add the reference
      if (isOutdoorDuty) {
        attendance.outdoorDutyRequest = {
          status: 'approved',
          reason: outdoorDuty.reason,
          approvedBy: outdoorDuty.approvedBy,
          approvedAt: outdoorDuty.approvedAt,
        };
      }
    }

    // Update check-in or check-out
    if (type === 'checkin') {
      // Check if already checked in
      if (attendance.checkIn && attendance.checkIn.time) {
        return next(new AppError('Already checked in today', 400));
      }

      attendance.checkIn = {
        time,
        latitude,
        longitude,
        address,
      };
      
      // Set a fun/professional status message for check-in
      attendance.status = 'checked-in';
      
      // Add a welcome message
      const hour = dayjs(time).hour();
      let welcomeMessage = '';
      
      if (hour < 12) {
        welcomeMessage = 'Good morning! Have a productive day ahead!';
      } else if (hour < 16) {
        welcomeMessage = 'Good afternoon! Keep up the great work!';
      } else {
        welcomeMessage = 'Good evening! Finishing strong today!';
      }
      
      attendance.welcomeMessage = welcomeMessage;
      
      // If there's an approved outdoor duty for today, calculate OD hours immediately
      if (isOutdoorDuty && outdoorDuty) {
        // Calculate outdoor duty hours
        const odStartTime = dayjs(outdoorDuty.startTime);
        const odEndTime = dayjs(outdoorDuty.endTime);
        const odHours = odEndTime.diff(odStartTime, 'hour', true).toFixed(2);
        attendance.outdoorDutyHours = parseFloat(odHours);
        
        // Store outdoor duty details
        attendance.outdoorDutyDetails = {
          startTime: outdoorDuty.startTime,
          endTime: outdoorDuty.endTime,
          reason: outdoorDuty.reason,
          outdoorDutyId: outdoorDuty._id
        };
        
        // For check-in, just store OD hours, don't calculate total yet
        attendance.status = 'checked-in'; // Keep as checked-in regardless of time
      }

      // Only determine status based on check-in time if there's no outdoor duty
      if (!isOutdoorDuty) {
        const checkInTime = dayjs(time);

        // Parse office start time from settings
        const [startHour, startMinute] = officeHours.start.split(':').map(Number);
        const officeStartTime = dayjs(time).hour(startHour).minute(startMinute).second(0);

        // Calculate late and half-day thresholds based on office start time and policy
        const lateThreshold = settings?.attendancePolicy?.lateThreshold || 30; // default 30 minutes
        const halfDayThreshold = settings?.attendancePolicy?.halfDayThreshold || 240; // default 4 hours

        const lateTime = officeStartTime.add(lateThreshold, 'minute');
        const halfDayTime = officeStartTime.add(halfDayThreshold, 'minute');

        // Only apply these status rules if there's no outdoor duty
        if (checkInTime.isBefore(lateTime)) {
          attendance.status = 'checked-in'; // Keep as checked-in instead of present
        } else if (checkInTime.isBefore(halfDayTime)) {
          attendance.status = 'checked-in'; // Keep as checked-in instead of late
        } else {
          attendance.status = 'checked-in'; // Keep as checked-in instead of half-day
        }
      }

      // Check if it's a weekend (Sunday = 0, Saturday = 6)
      const dayOfWeek = dayjs(time).day();
      if (dayOfWeek === 0) {
        // Sunday
        // Add to comp off dates if it's a Sunday
        const user = await User.findById(userId);
        user.compOffDates.push({
          date: new Date(today),
          used: false,
        });
        await user.save();
      }
    } else {
      // Check if already checked out
      if (attendance.checkOut && attendance.checkOut.time) {
        return next(new AppError('Already checked out today', 400));
      }

      // Check if checked in first
      if (!attendance.checkIn || !attendance.checkIn.time) {
        return next(new AppError('Must check in before checking out', 400));
      }

      attendance.checkOut = {
        time,
        latitude,
        longitude,
        address,
      };

      // Calculate work hours, handling potential OD overlap
      const checkInTime = dayjs(attendance.checkIn.time);
      const checkOutTime = dayjs(time);
      let workHours = checkOutTime.diff(checkInTime, 'hour', true).toFixed(2);
      
      // Check for OD overlap with work hours to avoid double counting
      if (isOutdoorDuty && outdoorDuty) {
        const odStartTime = dayjs(outdoorDuty.startTime);
        const odEndTime = dayjs(outdoorDuty.endTime);
        
        // Check if OD overlaps with work hours
        const hasOverlap = (odStartTime.isAfter(checkInTime) && odStartTime.isBefore(checkOutTime)) ||
                          (odEndTime.isAfter(checkInTime) && odEndTime.isBefore(checkOutTime)) ||
                          (odStartTime.isBefore(checkInTime) && odEndTime.isAfter(checkOutTime));
        
        if (hasOverlap) {
          // Calculate non-overlapping work hours
          let effectiveWorkHours = 0;
          
          // Time before OD starts (if any)
          if (odStartTime.isAfter(checkInTime)) {
            effectiveWorkHours += odStartTime.diff(checkInTime, 'hour', true);
          }
          
          // Time after OD ends (if any)
          if (odEndTime.isBefore(checkOutTime)) {
            effectiveWorkHours += checkOutTime.diff(odEndTime, 'hour', true);
          }
          
          workHours = effectiveWorkHours.toFixed(2);
        }
      }
      
      attendance.workHours = parseFloat(workHours);
      
      // Check if there's an approved outdoor duty for today
      if (isOutdoorDuty && outdoorDuty) {
        // Calculate outdoor duty hours
        const odStartTime = dayjs(outdoorDuty.startTime);
        const odEndTime = dayjs(outdoorDuty.endTime);
        const odHours = odEndTime.diff(odStartTime, 'hour', true).toFixed(2);
        attendance.outdoorDutyHours = parseFloat(odHours);
        
        // Store outdoor duty details
        attendance.outdoorDutyDetails = {
          startTime: outdoorDuty.startTime,
          endTime: outdoorDuty.endTime,
          reason: outdoorDuty.reason,
          outdoorDutyId: outdoorDuty._id
        };
        
        // Calculate total hours (work hours + outdoor duty hours)
        attendance.totalHours = parseFloat((parseFloat(workHours) + parseFloat(odHours)).toFixed(2));
        
        // Check if OD covers checkout time (evening OD) - more precise check
        const officeEndTime = dayjs().hour(parseInt(officeHours.end.split(':')[0]))
                                    .minute(parseInt(officeHours.end.split(':')[1] || '0'))
                                    .second(0);
        const odStartTimeForCheckout = dayjs(outdoorDuty.startTime);
        const odEndTimeForCheckout = dayjs(outdoorDuty.endTime);
        
        // Check if OD time overlaps with checkout time
        const isEveningOD = odStartTimeForCheckout.isBefore(officeEndTime) && odEndTimeForCheckout.isAfter(officeEndTime) || 
                           odEndTimeForCheckout.hour() >= officeEndTime.hour();
        
        if (isEveningOD) {
          // If OD covers checkout time, mark as present
          attendance.status = 'present';
          attendance.remarks = attendance.remarks || '';
          attendance.remarks += ' Auto-marked present due to evening outdoor duty.';
        }
      } else {
        // No outdoor duty, total hours equals work hours
        attendance.totalHours = parseFloat(workHours);
      }

      // If not on outdoor duty, calculate and set status based on work hours and office hours
      if (
        attendance.checkIn &&
        attendance.checkIn.time &&
        attendance.checkOut &&
        attendance.checkOut.time
      ) {
        const checkIn = new Date(attendance.checkIn.time);
        const checkOut = new Date(attendance.checkOut.time);
        const diffMs = checkOut - checkIn;
        const diffHrs = diffMs / (1000 * 60 * 60);
        attendance.workHours = parseFloat(diffHrs.toFixed(2));

        // Parse office hours from settings
        const [startHour, startMinute] = officeHours.start.split(':').map(Number);
        const [endHour, endMinute] = officeHours.end.split(':').map(Number);

        // Calculate expected work hours (end time - start time)
        const startTime = new Date();
        startTime.setHours(startHour, startMinute, 0);

        const endTime = new Date();
        endTime.setHours(endHour, endMinute, 0);

        const expectedWorkHours = (endTime - startTime) / (1000 * 60 * 60);
        const halfExpectedHours = expectedWorkHours / 2;

        // Check if checkout is early
        const earlyLeaveThreshold = settings?.attendancePolicy?.earlyLeaveThreshold || 30; // default 30 minutes
        const checkOutTime = dayjs(checkOut);
        const officeEndTime = dayjs(checkOut).hour(endHour).minute(endMinute).second(0);
        const earlyLeaveTime = officeEndTime.subtract(earlyLeaveThreshold, 'minute');

        // Determine status based on total hours (work hours + outdoor duty hours)
        // Use totalHours if available, otherwise fall back to workHours
        const totalHours = attendance.totalHours || attendance.workHours;
        
        if (totalHours >= expectedWorkHours * 0.9) {
          // 90% of expected hours
          attendance.status = 'present';
        } else if (totalHours >= halfExpectedHours) {
          // Check if left early
          if (checkOutTime.isBefore(earlyLeaveTime) && !isOutdoorDuty) {
            attendance.status = 'early-leave';
          } else {
            attendance.status = 'half-day';
          }
        } else {
          attendance.status = 'absent';
        }
      }
    }

    await attendance.save();

    res.status(200).json({
      status: 'success',
      data: {
        attendance,
      },
    });
  } catch (err) {
    next(err);
  }
};

// Get today's attendance
export const getTodayAttendance = async (req, res, next) => {
  try {
    const userId = req.user._id;
    const today = dayjs().format('YYYY-MM-DD');

    const attendance = await Attendance.findOne({
      user: userId,
      date: today,
    });
    
    // Check if user has outdoor duty for today
    const outdoorDuty = await OutdoorDuty.findOne({
      user: userId,
      date: today,
      status: 'approved',
    });
    
    // If attendance exists and has check-in, ensure it shows checked-in status
    if (attendance && attendance.checkIn && attendance.checkIn.time && !attendance.checkOut) {
      // Always set to checked-in if only checked in (no checkout yet)
      attendance.status = 'checked-in';
      
      // If there's an OD, add OD indicator to the status message
      if (outdoorDuty) {
        // Calculate if user is currently on OD
        const now = dayjs();
        // Handle case where outdoorDuty might not have startTime/endTime (legacy records)
        const dutyStartTime = outdoorDuty.startTime ? dayjs(outdoorDuty.startTime) : now.subtract(1, 'hour');
        const dutyEndTime = outdoorDuty.endTime ? dayjs(outdoorDuty.endTime) : now.add(1, 'hour');
        const isCurrentlyOnOD = now.isAfter(dutyStartTime) && now.isBefore(dutyEndTime);
        
        if (isCurrentlyOnOD) {
          attendance.welcomeMessage = attendance.welcomeMessage || '';
          attendance.welcomeMessage += ' You are currently on outdoor duty.';
        } else if (now.isBefore(dutyStartTime)) {
          const minutesToOD = dutyStartTime.diff(now, 'minute');
          attendance.welcomeMessage = attendance.welcomeMessage || '';
          attendance.welcomeMessage += ` Your outdoor duty starts in ${Math.max(0, minutesToOD)} minutes.`;
        }
        
        // Store OD hours and details if not already stored
        if (!attendance.outdoorDutyHours) {
          const dutyHours = dutyEndTime.diff(dutyStartTime, 'hour', true).toFixed(2);
          attendance.outdoorDutyHours = parseFloat(dutyHours);
          
          attendance.outdoorDutyDetails = {
            startTime: outdoorDuty.startTime || null,
            endTime: outdoorDuty.endTime || null,
            reason: outdoorDuty.reason || '',
            outdoorDutyId: outdoorDuty._id
          };
        }
      }
      
      await attendance.save();
    }

    // Add OD info to response
    const responseData = {
      attendance,
      outdoorDuty: outdoorDuty || null,
    };

    res.status(200).json({
      status: 'success',
      data: responseData,
    });
  } catch (err) {
    next(err);
  }
};

// Get attendance history
export const getAttendanceHistory = async (req, res, next) => {
  try {
    const userId = req.user._id;
    const { startDate, endDate } = req.query;

    if (!startDate || !endDate) {
      return next(new AppError('Start date and end date are required', 400));
    }

    const attendance = await Attendance.find({
      user: userId,
      date: {
        $gte: startDate,
        $lte: endDate,
      },
    }).sort({ date: -1 });

    res.status(200).json({
      status: 'success',
      data: {
        attendance,
      },
    });
  } catch (err) {
    next(err);
  }
};

// Get comp off dates
export const getCompOffDates = async (req, res, next) => {
  try {
    const userId = req.user._id;
    const { startDate, endDate } = req.query;

    if (!startDate || !endDate) {
      return next(new AppError('Start date and end date are required', 400));
    }

    // Get user's comp off dates
    const user = await User.findById(userId);

    // Filter unused comp off dates within the date range
    const compOffDates = user.compOffDates
      .filter((entry) => {
        const entryDate = dayjs(entry.date).format('YYYY-MM-DD');
        return !entry.used && entryDate >= startDate && entryDate <= endDate;
      })
      .map((entry) => dayjs(entry.date).format('YYYY-MM-DD'));

    res.status(200).json({
      status: 'success',
      data: {
        dates: compOffDates,
      },
    });
  } catch (err) {
    next(err);
  }
};

// Get attendance for a specific employee (admin only)
export const getEmployeeAttendance = async (req, res, next) => {
  try {
    const { employeeId } = req.params;
    const { startDate, endDate } = req.query;

    // Check if user is admin or subadmin
    if (req.user.role !== 'admin' && req.user.role !== 'subadmin') {
      return next(new AppError('You do not have permission to perform this action', 403));
    }

    if (!startDate || !endDate) {
      return next(new AppError('Start date and end date are required', 400));
    }

    const attendance = await Attendance.find({
      user: employeeId,
      date: {
        $gte: startDate,
        $lte: endDate,
      },
    }).sort({ date: -1 });

    res.status(200).json({
      status: 'success',
      data: {
        attendance,
      },
    });
  } catch (err) {
    next(err);
  }
};

// Get all attendance records (admin only)
export const getAllAttendance = async (req, res, next) => {
  try {
    const { startDate, endDate } = req.query;

    // Check if user is admin or subadmin
    if (req.user.role !== 'admin' && req.user.role !== 'subadmin') {
      return next(new AppError('You do not have permission to perform this action', 403));
    }

    if (!startDate || !endDate) {
      return next(new AppError('Start date and end date are required', 400));
    }

    const attendance = await Attendance.find({
      date: {
        $gte: startDate,
        $lte: endDate,
      },
    })
      .populate({
        path: 'user',
        select: 'fullName email department designation',
      })
      .sort({ date: -1 });

    res.status(200).json({
      status: 'success',
      data: {
        attendance,
      },
    });
  } catch (err) {
    next(err);
  }
};

// Get attendance summary for a specific date
export const getAttendanceSummary = async (req, res, next) => {
  try {
    const { date } = req.query;
    if (!date) {
      return res.status(400).json({ message: 'Date query parameter is required' });
    }

    const summary = await Attendance.find({ date });
    if (!summary) {
      return res.status(404).json({ message: 'No attendance records found for the given date' });
    }

    res.status(200).json(summary);
  } catch (error) {
    next(error);
  }
};

// Trigger auto checkout for employees with evening OD
export const triggerAutoCheckout = async (req, res, next) => {
  try {
    // Check if user is admin or subadmin
    if (req.user.role !== 'admin' && req.user.role !== 'subadmin') {
      return next(new AppError('You do not have permission to perform this action', 403));
    }
    
    // Import the auto checkout function
    const autoCheckout = await import('../controllers/autoCheckout.js');
    const { autoCheckoutForODEmployees } = autoCheckout;
    
    // Run the auto checkout process
    const result = await autoCheckoutForODEmployees() || { success: false, message: 'Auto checkout function failed' };
    
    res.status(200).json({
      status: result.success ? 'success' : 'error',
      message: result.message,
    });
  } catch (error) {
    next(error);
  }
};
