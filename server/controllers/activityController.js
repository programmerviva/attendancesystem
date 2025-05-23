import Attendance from '../models/Attendance.js';
import Leave from '../models/Leave.js';
import AppError from '../utils/appError.js';
import dayjs from 'dayjs';

// Get recent activity for admin dashboard
export const getRecentActivity = async (req, res, next) => {
  try {
    // Check if user is admin or subadmin
    if (req.user.role !== 'admin' && req.user.role !== 'subadmin') {
      return next(new AppError('You do not have permission to perform this action', 403));
    }

    // Get recent attendance records (check-ins and check-outs)
    const recentAttendance = await Attendance.find()
      .populate({
        path: 'user',
        select: 'fullName',
      })
      .sort({ createdAt: -1 })
      .limit(20);

    // Get recent leave requests
    const recentLeaves = await Leave.find()
      .populate({
        path: 'user',
        select: 'fullName',
      })
      .sort({ createdAt: -1 })
      .limit(10);

    // Format attendance activities
    const attendanceActivities = [];

    recentAttendance.forEach((record) => {
      if (record.checkIn && record.checkIn.time) {
        attendanceActivities.push({
          id: `checkin-${record._id}`,
          user: record.user
            ? `${record.user.fullName.first} ${record.user.fullName.last}`
            : 'Unknown User',
          action: 'Checked in',
          time: dayjs(record.checkIn.time).format('HH:mm A'),
          date: dayjs(record.checkIn.time).format('YYYY-MM-DD'),
          timestamp: record.checkIn.time,
        });
      }

      if (record.checkOut && record.checkOut.time) {
        attendanceActivities.push({
          id: `checkout-${record._id}`,
          user: record.user
            ? `${record.user.fullName.first} ${record.user.fullName.last}`
            : 'Unknown User',
          action: 'Checked out',
          time: dayjs(record.checkOut.time).format('HH:mm A'),
          date: dayjs(record.checkOut.time).format('YYYY-MM-DD'),
          timestamp: record.checkOut.time,
        });
      }
    });

    // Format leave activities
    const leaveActivities = recentLeaves.map((leave) => ({
      id: `leave-${leave._id}`,
      user: leave.user
        ? `${leave.user.fullName.first} ${leave.user.fullName.last}`
        : 'Unknown User',
      action: 'Requested leave',
      time: dayjs(leave.createdAt).format('HH:mm A'),
      date: dayjs(leave.createdAt).format('YYYY-MM-DD'),
      timestamp: leave.createdAt,
    }));

    // Combine and sort all activities by timestamp (most recent first)
    const allActivities = [...attendanceActivities, ...leaveActivities]
      .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
      .slice(0, 15); // Limit to 15 most recent activities

    res.status(200).json({
      status: 'success',
      results: allActivities.length,
      data: {
        activities: allActivities,
      },
    });
  } catch (err) {
    next(err);
  }
};
