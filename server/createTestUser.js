import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';
import User from './models/User.js';

dotenv.config();

async function createTestEmployee() {
  try {
    const mongoURI = process.env.MONGODB_URI;

    if (!mongoURI) {
      console.error('MONGODB_URI not found in .env file.');
      return;
    }

    await mongoose.connect(mongoURI);
    console.log('MongoDB connected for creating test employee.');

    // Create a test admin-created employee
    const hashedPassword = await bcrypt.hash('test123', 12);
    
    // Check if test employee already exists
    const existingUser = await User.findOne({ email: 'test@example.com' });

    if (existingUser) {
      console.log('Test employee already exists. Updating password...');
      
      // Update password directly with hashed value
      existingUser.password = hashedPassword;
      await existingUser.save({ validateBeforeSave: false });
      
      console.log('Password updated for test employee.');
      await mongoose.disconnect();
      return;
    }

    // Generate empId using the static method from the User model
    const empId = await User.generateEmployeeId();

    // Create test employee with manually hashed password
    const testEmployee = new User({
      empId: empId,
      fullName: {
        first: 'Admin',
        middle: '',
        last: 'Created',
      },
      email: 'test@example.com',
      mobile: '9876543210',
      password: hashedPassword, // Directly use hashed password
      department: 'IT',
      designation: 'Developer',
      role: 'employee',
      isActive: true,
    });

    // Save without triggering pre-save hooks
    await User.create(testEmployee);
    console.log('Test employee created successfully with email: test@example.com and password: test123');
  } catch (error) {
    console.error('Error creating test employee:', error);
  } finally {
    await mongoose.disconnect();
  }
}

// Execute the function
createTestEmployee();