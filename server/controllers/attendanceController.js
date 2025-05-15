import Attendance from '../models/Attendance.js';
import AppError from '../utils/appError.js';
import dayjs from 'dayjs';

// Mark attendance (check-in or check-out)
export const markAttendance = async (req, res, next) => {
  try {
    const { type, latitude, longitude, address } = req.body;
    const userId = req.user._id;
    const today = dayjs().startOf('day').toDate();
    
    // Get device info from request
    const deviceInfo = req.headers['user-agent'] || 'Unknown device';
    const ipAddress = req.ip || req.connection.remoteAddress;
    
    // Find today's attendance record for this user
    let attendance = await Attendance.findOne({
      user: userId,
      date: {
        $gte: today,
        $lt: dayjs(today).add(1, 'day').toDate()
      }
    });
    
    const now = new Date();
    
    if (type === 'checkin') {
      if (attendance && attendance.checkIn && attendance.checkIn.time) {
        return next(new AppError('You have already checked in today', 400));
      }
      
      // Create new attendance record or update existing one
      if (!attendance) {
        attendance = new Attendance({
          user: userId,
          date: now,
          checkIn: {
            time: now,
            latitude,
            longitude,
            address,
            ipAddress,
            deviceInfo
          },
          status: 'present'
        });
      } else {
        attendance.checkIn = {
          time: now,
          latitude,
          longitude,
          address,
          ipAddress,
          deviceInfo
        };
        attendance.status = 'present';
      }
      
    } else if (type === 'checkout') {
      if (!attendance || !attendance.checkIn || !attendance.checkIn.time) {
        return next(new AppError('You need to check in first', 400));
      }
      
      if (attendance.checkOut && attendance.checkOut.time) {
        return next(new AppError('You have already checked out today', 400));
      }
      
      attendance.checkOut = {
        time: now,
        latitude,
        longitude,
        address,
        ipAddress,
        deviceInfo
      };
      
      // Calculate work hours
      attendance.calculateWorkHours();
    } else {
      return next(new AppError('Invalid attendance type', 400));
    }
    
    await attendance.save();
    
    res.status(200).json({
      status: 'success',
      data: {
        attendance
      }
    });
  } catch (err) {
    next(err);
  }
};

// Get attendance history for the current user
export const getAttendanceHistory = async (req, res, next) => {
  try {
    const userId = req.user._id;
    const { startDate, endDate } = req.query;
    
    let dateFilter = { user: userId };
    
    // Add date range filter if provided
    if (startDate && endDate) {
      dateFilter.date = {
        $gte: new Date(startDate),
        $lte: new Date(endDate)
      };
    } else if (startDate) {
      dateFilter.date = { $gte: new Date(startDate) };
    } else if (endDate) {
      dateFilter.date = { $lte: new Date(endDate) };
    }
    
    // Get attendance records
    const attendanceRecords = await Attendance.find(dateFilter)
      .sort({ date: -1 }) // Most recent first
      .limit(30); // Limit to 30 records by default
    
    res.status(200).json({
      status: 'success',
      results: attendanceRecords.length,
      data: {
        attendance: attendanceRecords
      }
    });
  } catch (err) {
    next(err);
  }
};

// Get today's attendance for the current user
export const getTodayAttendance = async (req, res, next) => {
  try {
    const userId = req.user._id;
    const today = dayjs().startOf('day').toDate();
    
    const attendance = await Attendance.findOne({
      user: userId,
      date: {
        $gte: today,
        $lt: dayjs(today).add(1, 'day').toDate()
      }
    });
    
    res.status(200).json({
      status: 'success',
      data: {
        attendance: attendance || null
      }
    });
  } catch (err) {
    next(err);
  }
};