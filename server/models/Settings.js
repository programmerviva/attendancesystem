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
  }
}, { timestamps: true });

const Settings = mongoose.model('Settings', settingsSchema);
export default Settings;