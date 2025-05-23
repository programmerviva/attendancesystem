import mongoose from 'mongoose';

const attendanceSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    date: {
      type: Date,
      default: Date.now,
      required: true,
    },
    checkIn: {
      time: Date,
      latitude: Number,
      longitude: Number,
      address: String,
      ipAddress: String,
      deviceInfo: String,
    },
    checkOut: {
      time: Date,
      latitude: Number,
      longitude: Number,
      address: String,
      ipAddress: String,
      deviceInfo: String,
    },
    workHours: {
      type: Number,
      default: 0,
    },
    status: {
      type: String,
      enum: ['present', 'absent', 'half-day', 'late', 'early-leave', 'on-leave'],
      default: 'absent',
    },
    remarks: String,
  },
  { timestamps: true }
);

// Create a compound index on user and date to ensure one attendance record per user per day
attendanceSchema.index({ user: 1, date: 1 }, { unique: true });

// Method to calculate work hours when checking out
attendanceSchema.methods.calculateWorkHours = function () {
  if (this.checkIn && this.checkIn.time && this.checkOut && this.checkOut.time) {
    // Calculate hours between check-in and check-out
    const checkInTime = new Date(this.checkIn.time);
    const checkOutTime = new Date(this.checkOut.time);
    const diffMs = checkOutTime - checkInTime;
    const diffHrs = diffMs / (1000 * 60 * 60);
    this.workHours = parseFloat(diffHrs.toFixed(2));

    // Determine status based on work hours
    if (this.workHours >= 8) {
      this.status = 'present';
    } else if (this.workHours >= 4) {
      this.status = 'half-day';
    } else {
      this.status = 'early-leave';
    }
  }
  return this.workHours;
};

const Attendance = mongoose.model('Attendance', attendanceSchema);
export default Attendance;
