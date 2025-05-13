import mongoose from 'mongoose';
import validator from 'validator';
import bcrypt from 'bcryptjs';

const userSchema = new mongoose.Schema({
  empId: {
    type: String,
    unique: true,
    immutable: true,
    // Will be assigned in pre-save hook
  },
  fullName: {
    first: { type: String, required: true, trim: true },
    middle: { type: String, trim: true },
    last: { type: String, required: true, trim: true },
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    validate: [validator.isEmail, 'Invalid email format'],
  },
  mobile: {
    type: String,
    required: true,
    validate: {
      validator: (v) => /^[0-9]{10}$/.test(v),
      message: 'Mobile number must be 10 digits',
    },
  },
  profileImage: {
    type: String,
    default: '',
  },
  password: {
    type: String,
    required: true,
    minlength: 8,
    select: false,
  },
  lastLogin: Date,
  department: {
    type: String,
    enum: [
      'IT',
      'HR',
      'Finance',
      'Marketing',
      'Accounts',
      'Sales',
      'Administration',
      'Customer Service',
      'Legal',
    ],
    required: true,
  },
  designation: {
    type: String,
    required: true,
  },
  joiningDate: {
    type: Date,
    default: Date.now,
  },
  role: {
    type: String,
    enum: ['admin', 'subadmin', 'employee'],
    default: 'employee',
  },
  isActive: {
    type: Boolean,
    default: true,
  },
}, { timestamps: true, toJSON: { virtuals: true } });

userSchema.methods.correctPassword = async function(candidatePassword, userPassword) {
  return await bcrypt.compare(candidatePassword, userPassword);
};

userSchema.statics.generateEmployeeId = async function () {
  const currentYear = new Date().getFullYear();
  try {
    const lastUser = await this.findOne({}, { empId: 1 }, { sort: { empId: -1 } });
    let nextSequenceNumber = 1;
    if (lastUser && lastUser.empId) {
      const lastIdNumber = parseInt(lastUser.empId.slice(0, -4), 10);
      if (!isNaN(lastIdNumber)) {
        nextSequenceNumber = lastIdNumber + 1;
      }
    }
    const formattedSeq = nextSequenceNumber.toString().padStart(4, '0');
    return `${formattedSeq}${currentYear}`;
  } catch (error) {
    console.error("Error generating Employee ID:", error);
    throw new Error("Could not generate Employee ID.");
  }
};

// Pre-save hook to assign empId and hash password
userSchema.pre('save', async function (next) {
  if (this.isNew && !this.empId) {
    try {
      this.empId = await this.constructor.generateEmployeeId();
       // Check if empId already exists in the database (though unlikely with the new logic)
        const existingUser = await this.constructor.findOne({ empId: this.empId });
        if (existingUser) {
          // If empId already exists, generate a new one (as a fallback)
          this.empId = await this.constructor.generateEmployeeId();
        }
    } catch (error) {
      return next(error);
    }
  }
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 12);
  next();
});

const User = mongoose.model('User', userSchema);
export default User;
