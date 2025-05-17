import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const userSchema = new mongoose.Schema({
  fullName: {
    first: {
      type: String,
      required: [true, 'First name is required']
    },
    last: {
      type: String,
      required: [true, 'Last name is required']
    }
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    lowercase: true,
    trim: true
  },
  password: {
    type: String,
    required: [true, 'Password is required'],
    minlength: 8,
    select: false
  },
  role: {
    type: String,
    enum: ['admin', 'subadmin', 'employee'],
    default: 'employee'
  },
  department: {
    type: String,
    required: [true, 'Department is required']
  },
  designation: {
    type: String,
    required: [true, 'Designation is required']
  },
  joiningDate: {
    type: Date,
    default: Date.now
  },
  leaveBalance: {
    sick: {
      type: Number,
      default: 0
    },
    vacation: {
      type: Number,
      default: 0
    },
    short: {
      type: Number,
      default: 0
    },
    comp: {
      type: Number,
      default: 0
    }
  },
  compOffDates: [{
    date: {
      type: Date,
      required: true
    },
    used: {
      type: Boolean,
      default: false
    }
  }],
  passwordChangedAt: Date,
  passwordResetToken: String,
  passwordResetExpires: Date,
  active: {
    type: Boolean,
    default: true,
    select: false
  }
}, {
  timestamps: true
});

// Pre-save hook to hash password
userSchema.pre('save', async function(next) {
  // Only run this function if password was modified
  if (!this.isModified('password')) return next();

  // Hash the password with cost of 12
  this.password = await bcrypt.hash(this.password, 12);
  next();
});

// Method to check if password is correct
userSchema.methods.correctPassword = async function(candidatePassword, userPassword) {
  return await bcrypt.compare(candidatePassword, userPassword);
};

// Method to check if password was changed after a token was issued
userSchema.methods.changedPasswordAfter = function(JWTTimestamp) {
  if (this.passwordChangedAt) {
    const changedTimestamp = parseInt(this.passwordChangedAt.getTime() / 1000, 10);
    return JWTTimestamp < changedTimestamp;
  }
  return false;
};

const User = mongoose.model('User', userSchema);

export default User;