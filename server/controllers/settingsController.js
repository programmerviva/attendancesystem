import Settings from '../models/Settings.js';
import AppError from '../utils/appError.js';

// Get system settings
export const getSettings = async (req, res, next) => {
  try {
    // Check if user is admin or subadmin
    if (req.user.role !== 'admin' && req.user.role !== 'subadmin') {
      return next(new AppError('You do not have permission to perform this action', 403));
    }
    
    // Find settings or create default settings if none exist
    let settings = await Settings.findOne();
    
    if (!settings) {
      settings = await Settings.create({
        companyName: 'PeakForce',
        officeLocation: 'Main Office',
        officeHours: {
          start: '09:00',
          end: '18:00'
        },
        geofenceRadius: 150,
        leaveSettings: {
          annualLeave: 24,
          sickLeave: 12,
          casualLeave: 6
        }
      });
    }
    
    res.status(200).json({
      status: 'success',
      data: {
        settings
      }
    });
  } catch (err) {
    next(err);
  }
};

// Update system settings
export const updateSettings = async (req, res, next) => {
  try {
    // Check if user is admin or subadmin
    if (req.user.role !== 'admin' && req.user.role !== 'subadmin') {
      return next(new AppError('You do not have permission to perform this action', 403));
    }
    
    // Find settings or create default settings if none exist
    let settings = await Settings.findOne();
    
    if (!settings) {
      settings = await Settings.create({
        companyName: 'PeakForce',
        officeLocation: 'Main Office',
        officeHours: {
          start: '09:00',
          end: '18:00'
        },
        geofenceRadius: 150,
        leaveSettings: {
          annualLeave: 24,
          sickLeave: 12,
          casualLeave: 6
        },
        ...req.body
      });
    } else {
      // Update settings with request body
      Object.keys(req.body).forEach(key => {
        settings[key] = req.body[key];
      });
      
      await settings.save();
    }
    
    res.status(200).json({
      status: 'success',
      data: {
        settings
      }
    });
  } catch (err) {
    next(err);
  }
};