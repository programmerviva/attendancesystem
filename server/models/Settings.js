import mongoose from 'mongoose';

const settingsSchema = new mongoose.Schema({
  companyName: {
    type: String,
    default: 'PeakForce'
  },
  officeLocation: {
    type: String,
    default: 'Main Office'
  },
  officeHours: {
    start: {
      type: String,
      default: '09:00'
    },
    end: {
      type: String,
      default: '18:00'
    }
  },
  geofenceRadius: {
    type: Number,
    default: 150
  },
  leaveSettings: {
    annualLeave: {
      type: Number,
      default: 24
    },
    sickLeave: {
      type: Number,
      default: 12
    },
    casualLeave: {
      type: Number,
      default: 6
    }
  },
  // New fields for company holidays
  companyHolidays: [{
    date: {
      type: Date,
      required: true
    },
    name: {
      type: String,
      required: true
    },
    description: String
  }],
  // New fields for attendance policy
  attendancePolicy: {
    lateThreshold: {
      type: Number,
      default: 30, // minutes
      min: 1
    },
    halfDayThreshold: {
      type: Number,
      default: 240, // minutes (4 hours)
      min: 1
    },
    earlyLeaveThreshold: {
      type: Number,
      default: 30, // minutes
      min: 1
    }
  }
}, { timestamps: true });

const Settings = mongoose.model('Settings', settingsSchema);
export default Settings;