import mongoose from 'mongoose';

const outdoorDutySchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    date: {
      type: Date,
      required: true,
    },
    reason: {
      type: String,
      required: true,
    },
    status: {
      type: String,
      enum: ['pending', 'approved', 'rejected'],
      default: 'pending',
    },
    approvedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    approvedAt: Date,
    remarks: String,
  },
  { timestamps: true }
);

// Create a compound index on user and date to ensure one outdoor duty request per user per day
outdoorDutySchema.index({ user: 1, date: 1 }, { unique: true });

const OutdoorDuty = mongoose.model('OutdoorDuty', outdoorDutySchema);
export default OutdoorDuty;