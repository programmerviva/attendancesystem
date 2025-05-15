import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';

dotenv.config();

// Connect to MongoDB
const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('MongoDB connected');
  } catch (error) {
    console.error('MongoDB connection error:', error);
    process.exit(1);
  }
};

// Define User schema directly in this file to avoid any issues with the model
const userSchema = new mongoose.Schema({
  empId: {
    type: String,
    unique: true,
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
  },
  mobile: {
    type: String,
    required: true,
  },
  password: {
    type: String,
    required: true,
  },
  department: {
    type: String,
    required: true,
  },
  designation: {
    type: String,
    required: true,
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
}, { timestamps: true });

// Create a test user
const createTestUser = async () => {
  try {
    await connectDB();
    
    // Create User model
    const User = mongoose.model('User', userSchema);
    
    // Generate a unique employee ID
    const currentYear = new Date().getFullYear();
    const randomNum = Math.floor(1000 + Math.random() * 9000);
    const empId = `${randomNum}${currentYear}`;
    
    // Hash password
    const hashedPassword = await bcrypt.hash('test123', 12);
    
    // Create user with manually hashed password
    const newUser = new User({
      empId,
      fullName: {
        first: 'Test',
        last: 'User',
      },
      email: 'test2@example.com',
      mobile: '1234567890',
      password: hashedPassword,
      department: 'IT',
      designation: 'Developer',
      role: 'employee',
    });
    
    // Save user directly to database
    await newUser.save();
    
    console.log('Test user created successfully:');
    console.log('Email: test2@example.com');
    console.log('Password: test123');
    
    // Disconnect from MongoDB
    await mongoose.disconnect();
    console.log('MongoDB disconnected');
  } catch (error) {
    console.error('Error creating test user:', error);
    await mongoose.disconnect();
  }
};

// Run the function
createTestUser();