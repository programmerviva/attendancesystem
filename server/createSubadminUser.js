import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';
import User from './models/User.js';

dotenv.config();

async function createSubadminUser() {
  try {
    const mongoURI = process.env.MONGODB_URI;

    if (!mongoURI) {
      console.error('MONGODB_URI not found in .env file.');
      return;
    }

    await mongoose.connect(mongoURI);
    console.log('MongoDB connected for creating subadmin user.');

    // Create a hashed password
    const hashedPassword = await bcrypt.hash('subadmin123', 12);
    
    // Check if subadmin already exists
    const existingUser = await User.findOne({ email: 'subadmin@example.com' });

    if (existingUser) {
      console.log('Subadmin user already exists. Updating password...');
      
      // Update password directly with hashed value
      existingUser.password = hashedPassword;
      await existingUser.save({ validateBeforeSave: false });
      
      console.log('Password updated for subadmin user.');
      await mongoose.disconnect();
      return;
    }

    // Generate empId using the static method from the User model
    const empId = await User.generateEmployeeId();

    // Create subadmin user with manually hashed password
    const subadminUser = new User({
      empId: empId,
      fullName: {
        first: 'Sub',
        middle: '',
        last: 'Admin',
      },
      email: 'subadmin@example.com',
      mobile: '9876543211',
      password: hashedPassword, // Directly use hashed password
      department: 'Administration',
      designation: 'Team Lead',
      role: 'subadmin',
      isActive: true,
    });

    // Save without triggering pre-save hooks
    await User.create(subadminUser);
    console.log('Subadmin user created successfully with email: subadmin@example.com and password: subadmin123');
  } catch (error) {
    console.error('Error creating subadmin user:', error);
  } finally {
    await mongoose.disconnect();
  }
}

// Execute the function
createSubadminUser();