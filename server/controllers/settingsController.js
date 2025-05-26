import Settings from '../models/Settings.js';
import AppError from '../utils/appError.js';
import mongoose from 'mongoose';

// Get system settings
export const getSettings = async (req, res, next) => {
  try {
    // Allow all authenticated users to get settings

    // Find settings or create default settings if none exist
    let settings = await Settings.findOne();

    if (!settings) {
      settings = await Settings.create({
        companyName: 'PeakForce',
        officeLocation: 'Main Office',
        officeHours: {
          start: '09:00',
          end: '18:00',
        },
        geofenceRadius: 150,
        leaveSettings: {
          annualLeave: 24,
          sickLeave: 12,
          casualLeave: 6,
        },
        companyHolidays: [],
      });
    }

    res.status(200).json({
      status: 'success',
      data: {
        settings,
      },
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
          end: '18:00',
        },
        geofenceRadius: 150,
        leaveSettings: {
          annualLeave: 24,
          sickLeave: 12,
          casualLeave: 6,
        },
        companyHolidays: [],
        ...req.body,
      });
    } else {
      // Update settings with request body
      Object.keys(req.body).forEach((key) => {
        // Ensure geofenceRadius is stored as a number with decimal precision
        if (key === 'geofenceRadius' && req.body[key]) {
          settings[key] = parseFloat(req.body[key]);
        } else {
          settings[key] = req.body[key];
        }
      });

      await settings.save();
    }

    res.status(200).json({
      status: 'success',
      data: {
        settings,
      },
    });
  } catch (err) {
    next(err);
  }
};

// Get all holidays - accessible to all authenticated users
export const getHolidays = async (req, res, next) => {
  try {
    // Find settings
    let settings = await Settings.findOne();

    if (!settings) {
      settings = await Settings.create({
        companyName: 'PeakForce',
        officeLocation: 'Main Office',
        officeHours: {
          start: '09:00',
          end: '18:00',
        },
        geofenceRadius: 150,
        leaveSettings: {
          annualLeave: 24,
          sickLeave: 12,
          casualLeave: 6,
        },
        companyHolidays: [],
      });
    }

    res.status(200).json({
      status: 'success',
      data: {
        holidays: settings.companyHolidays || [],
      },
    });
  } catch (err) {
    next(err);
  }
};

// Add a holiday
export const addHoliday = async (req, res, next) => {
  try {
    // Check if user is admin or subadmin
    if (req.user.role !== 'admin' && req.user.role !== 'subadmin') {
      return next(new AppError('You do not have permission to perform this action', 403));
    }

    const { date, name, description } = req.body;

    if (!date || !name) {
      return next(new AppError('Date and name are required', 400));
    }

    // Find settings
    let settings = await Settings.findOne();

    if (!settings) {
      settings = await Settings.create({
        companyName: 'PeakForce',
        officeLocation: 'Main Office',
        officeHours: {
          start: '09:00',
          end: '18:00',
        },
        geofenceRadius: 150,
        leaveSettings: {
          annualLeave: 24,
          sickLeave: 12,
          casualLeave: 6,
        },
        companyHolidays: [],
      });
    }

    // Add new holiday
    const newHoliday = {
      _id: new mongoose.Types.ObjectId(),
      date,
      name,
      description: description || '',
    };

    settings.companyHolidays.push(newHoliday);
    await settings.save();

    res.status(201).json({
      status: 'success',
      data: {
        holiday: newHoliday,
      },
    });
  } catch (err) {
    next(err);
  }
};

// Update a holiday
export const updateHoliday = async (req, res, next) => {
  try {
    // Check if user is admin or subadmin
    if (req.user.role !== 'admin' && req.user.role !== 'subadmin') {
      return next(new AppError('You do not have permission to perform this action', 403));
    }

    const { id } = req.params;
    const { date, name, description } = req.body;

    // Find settings
    let settings = await Settings.findOne();

    if (!settings) {
      return next(new AppError('Settings not found', 404));
    }

    // Find holiday index
    const holidayIndex = settings.companyHolidays.findIndex((h) => h._id.toString() === id);

    if (holidayIndex === -1) {
      return next(new AppError('Holiday not found', 404));
    }

    // Update holiday
    if (date) settings.companyHolidays[holidayIndex].date = date;
    if (name) settings.companyHolidays[holidayIndex].name = name;
    if (description !== undefined) settings.companyHolidays[holidayIndex].description = description;

    await settings.save();

    res.status(200).json({
      status: 'success',
      data: {
        holiday: settings.companyHolidays[holidayIndex],
      },
    });
  } catch (err) {
    next(err);
  }
};

// Delete a holiday
export const deleteHoliday = async (req, res, next) => {
  try {
    // Check if user is admin or subadmin
    if (req.user.role !== 'admin' && req.user.role !== 'subadmin') {
      return next(new AppError('You do not have permission to perform this action', 403));
    }

    const { id } = req.params;

    // Find settings
    let settings = await Settings.findOne();

    if (!settings) {
      return next(new AppError('Settings not found', 404));
    }

    // Filter out the holiday to delete
    settings.companyHolidays = settings.companyHolidays.filter((h) => h._id.toString() !== id);

    await settings.save();

    res.status(204).json({
      status: 'success',
      data: null,
    });
  } catch (err) {
    next(err);
  }
};
