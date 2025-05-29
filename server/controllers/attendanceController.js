import Attendance from '../models/Attendance.js';
import OutdoorDuty from '../models/OutdoorDuty.js';
import Settings from '../models/Settings.js';
import { autoCheckoutForODEmployees } from './autoCheckout.js';
import dayjs from 'dayjs';

// Create attendance record (check-in or check-out)
export const createAttendance = async (req, res) => {
  try {
    const { type, latitude, longitude, address, ipAddress, deviceInfo } = req.body;
    const userId = req.user.id;
    const today = dayjs().startOf('day').toDate();

    // Get office settings for location verification
    const settings = await Settings.findOne();
    const officeLocation = settings?.officeLocation || {
      latitude: 0,
      longitude: 0,
      radius: 100, // Default radius in meters
    };

    // For check-in: Always require location verification
    if (type === 'check-in') {
      // Verify location for check-in (always required)
      if (!latitude || !longitude) {
        return res.status(400).json({
          status: 'fail',
          message: 'Location data is required for check-in',
        });
      }

      // Calculate distance from office (using Haversine formula)
      const distance = calculateDistance(
        latitude,
        longitude,
        officeLocation.latitude,
        officeLocation.longitude
      );

      // Check if user is within office radius
      if (distance > officeLocation.radius) {
        return res.status(400).json({
          status: 'fail',
          message: 'You must be at the office location to check in',
          distance,
          maxAllowedDistance: officeLocation.radius,
        });
      }

      // Find or create today's attendance record
      let attendance = await Attendance.findOne({
        user: userId,
        date: {
          $gte: today,
          $lt: dayjs(today).add(1, 'day').toDate(),
        },
      });

      if (attendance) {
        // Already checked in
        if (attendance.checkIn && attendance.checkIn.time) {
          return res.status(400).json({
            status: 'fail',
            message: 'You have already checked in today',
          });
        }
      } else {
        // Create new attendance record
        attendance = new Attendance({
          user: userId,
          date: today,
        });
      }

      // Record check-in
      attendance.checkIn = {
        time: new Date(),
        latitude,
        longitude,
        address,
        ipAddress,
        deviceInfo,
      };
      attendance.status = 'checked-in';
      attendance.welcomeMessage = `Welcome! You checked in at ${dayjs().format('HH:mm')}`;

      await attendance.save();

      return res.status(200).json({
        status: 'success',
        data: {
          attendance,
        },
      });
    }
    // For check-out
    else if (type === 'check-out') {
      // Find today's attendance record
      const attendance = await Attendance.findOne({
        user: userId,
        date: {
          $gte: today,
          $lt: dayjs(today).add(1, 'day').toDate(),
        },
      });

      if (!attendance || !attendance.checkIn || !attendance.checkIn.time) {
        return res.status(400).json({
          status: 'fail',
          message: 'You need to check in first',
        });
      }

      if (attendance.checkOut && attendance.checkOut.time) {
        return res.status(400).json({
          status: 'fail',
          message: 'You have already checked out today',
        });
      }

      // Check if user has approved outdoor duty that covers office closing time
      const currentTime = new Date();
      const settings = await Settings.findOne();
      const officeHours = settings ? settings.officeHours : { start: '09:00', end: '18:00' };
      
      // Parse office end time
      const [endHour, endMinute] = officeHours.end.split(':').map(Number);
      const officeEndTime = new Date();
      officeEndTime.setHours(endHour, endMinute || 0, 0, 0);
      
      // Check for approved OD that covers office closing time
      const approvedOD = await OutdoorDuty.findOne({
        user: userId,
        date: {
          $gte: today,
          $lt: dayjs(today).add(1, 'day').toDate(),
        },
        status: 'approved',
        endTime: { $gte: officeEndTime }
      });
      
      // If no approved OD covering office closing time, verify location
      if (!approvedOD) {
        // Location verification required for check-out
        if (!latitude || !longitude) {
          return res.status(400).json({
            status: 'fail',
            message: 'Location data is required for check-out',
          });
        }

        // Calculate distance from office
        const distance = calculateDistance(
          latitude,
          longitude,
          officeLocation.latitude,
          officeLocation.longitude
        );

        // Check if user is within office radius
        if (distance > officeLocation.radius) {
          return res.status(400).json({
            status: 'fail',
            message: 'You must be at the office location to check out',
            distance,
            maxAllowedDistance: officeLocation.radius,
          });
        }
      }

      // Record check-out
      attendance.checkOut = {
        time: currentTime,
        latitude: latitude || null,
        longitude: longitude || null,
        address: address || (approvedOD ? 'Auto checkout due to approved outdoor duty' : ''),
        ipAddress,
        deviceInfo,
      };

      // If there's an approved OD, add its details
      if (approvedOD) {
        attendance.outdoorDutyDetails = {
          startTime: approvedOD.startTime,
          endTime: approvedOD.endTime,
          reason: approvedOD.reason,
          outdoorDutyId: approvedOD._id
        };
        
        // Calculate OD hours
        const odStartTime = dayjs(approvedOD.startTime);
        const odEndTime = dayjs(approvedOD.endTime);
        const odHours = odEndTime.diff(odStartTime, 'hour', true);
        attendance.outdoorDutyHours = parseFloat(odHours.toFixed(2));
      }

      // Calculate work hours
      attendance.calculateWorkHours();
      await attendance.save();

      return res.status(200).json({
        status: 'success',
        data: {
          attendance,
        },
      });
    } else {
      return res.status(400).json({
        status: 'fail',
        message: 'Invalid attendance type',
      });
    }
  } catch (error) {
    console.error('Error creating attendance:', error);
    return res.status(500).json({
      status: 'error',
      message: error.message,
    });
  }
};

// Get today's attendance for current user
export const getTodayAttendance = async (req, res) => {
  try {
    const userId = req.user.id;
    const today = dayjs().startOf('day').toDate();

    const attendance = await Attendance.findOne({
      user: userId,
      date: {
        $gte: today,
        $lt: dayjs(today).add(1, 'day').toDate(),
      },
    });

    return res.status(200).json({
      status: 'success',
      data: {
        attendance,
      },
    });
  } catch (error) {
    return res.status(500).json({
      status: 'error',
      message: error.message,
    });
  }
};

// Get attendance history for current user
export const getAttendanceHistory = async (req, res) => {
  try {
    const userId = req.user.id;
    const { startDate, endDate } = req.query;

    const query = { user: userId };

    if (startDate && endDate) {
      query.date = {
        $gte: dayjs(startDate).startOf('day').toDate(),
        $lte: dayjs(endDate).endOf('day').toDate(),
      };
    }

    const attendance = await Attendance.find(query).sort({ date: -1 });

    return res.status(200).json({
      status: 'success',
      results: attendance.length,
      data: {
        attendance,
      },
    });
  } catch (error) {
    return res.status(500).json({
      status: 'error',
      message: error.message,
    });
  }
};

// Get attendance for a specific employee (admin only)
export const getEmployeeAttendance = async (req, res) => {
  try {
    const { employeeId } = req.params;
    const { startDate, endDate } = req.query;

    const query = { user: employeeId };

    if (startDate && endDate) {
      query.date = {
        $gte: dayjs(startDate).startOf('day').toDate(),
        $lte: dayjs(endDate).endOf('day').toDate(),
      };
    }

    const attendance = await Attendance.find(query).sort({ date: -1 });

    return res.status(200).json({
      status: 'success',
      results: attendance.length,
      data: {
        attendance,
      },
    });
  } catch (error) {
    return res.status(500).json({
      status: 'error',
      message: error.message,
    });
  }
};

// Get all attendance records (admin only)
export const getAllAttendance = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;

    const query = {};

    if (startDate && endDate) {
      query.date = {
        $gte: dayjs(startDate).startOf('day').toDate(),
        $lte: dayjs(endDate).endOf('day').toDate(),
      };
    }

    const attendance = await Attendance.find(query)
      .populate('user', 'name email employeeId')
      .sort({ date: -1 });

    return res.status(200).json({
      status: 'success',
      results: attendance.length,
      data: {
        attendance,
      },
    });
  } catch (error) {
    return res.status(500).json({
      status: 'error',
      message: error.message,
    });
  }
};

// Get attendance summary (admin only)
export const getAttendanceSummary = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;

    const query = {};

    if (startDate && endDate) {
      query.date = {
        $gte: dayjs(startDate).startOf('day').toDate(),
        $lte: dayjs(endDate).endOf('day').toDate(),
      };
    }

    const attendance = await Attendance.find(query).populate('user', 'name email employeeId');

    // Calculate summary statistics
    const summary = {
      totalRecords: attendance.length,
      present: attendance.filter((a) => a.status === 'present').length,
      absent: attendance.filter((a) => a.status === 'absent').length,
      halfDay: attendance.filter((a) => a.status === 'half-day').length,
      late: attendance.filter((a) => a.status === 'late').length,
      earlyLeave: attendance.filter((a) => a.status === 'early-leave').length,
      onLeave: attendance.filter((a) => a.status === 'on-leave').length,
      outdoorDuty: attendance.filter((a) => a.status === 'outdoor-duty').length,
      checkedIn: attendance.filter((a) => a.status === 'checked-in').length,
    };

    return res.status(200).json({
      status: 'success',
      data: {
        summary,
      },
    });
  } catch (error) {
    return res.status(500).json({
      status: 'error',
      message: error.message,
    });
  }
};

// Get comp-off eligible dates
export const getCompOffDates = async (req, res) => {
  try {
    const userId = req.user.id;
    const { startDate, endDate } = req.query;

    const query = {
      user: userId,
      'checkIn.time': { $exists: true },
      'checkOut.time': { $exists: true },
      $or: [
        { status: 'present' },
        { status: 'outdoor-duty' }
      ]
    };

    if (startDate && endDate) {
      query.date = {
        $gte: dayjs(startDate).startOf('day').toDate(),
        $lte: dayjs(endDate).endOf('day').toDate(),
      };
    }

    // Find weekend attendance records
    const attendance = await Attendance.find(query);
    
    // Filter for weekends (Saturday = 6, Sunday = 0)
    const weekendAttendance = attendance.filter(record => {
      const day = dayjs(record.date).day();
      return day === 0 || day === 6;
    });

    return res.status(200).json({
      status: 'success',
      results: weekendAttendance.length,
      data: {
        compOffDates: weekendAttendance,
      },
    });
  } catch (error) {
    return res.status(500).json({
      status: 'error',
      message: error.message,
    });
  }
};

// Trigger auto checkout process
export const triggerAutoCheckout = async (req, res) => {
  try {
    const result = await autoCheckoutForODEmployees();
    
    return res.status(200).json({
      status: 'success',
      data: result,
    });
  } catch (error) {
    return res.status(500).json({
      status: 'error',
      message: error.message,
    });
  }
};

// Helper function to calculate distance between two coordinates using Haversine formula
function calculateDistance(lat1, lon1, lat2, lon2) {
  const R = 6371e3; // Earth's radius in meters
  const φ1 = (lat1 * Math.PI) / 180;
  const φ2 = (lat2 * Math.PI) / 180;
  const Δφ = ((lat2 - lat1) * Math.PI) / 180;
  const Δλ = ((lon2 - lon1) * Math.PI) / 180;

  const a =
    Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
    Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return R * c; // Distance in meters
}