import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';
import User from './models/User.js';

dotenv.config();

async function seedAdmin() {
  try {
    const mongoURI = process.env.MONGODB_URI;

    if (!mongoURI) {
      console.error('MONGODB_URI not found in .env file.');
      return;
    }

    await mongoose.connect(mongoURI);
    console.log('MongoDB connected for seeding Admin (Admin).');

    // Check if Preeti already exists
    const existingAdmin = await User.findOne({ email: 'preeti@example.com' }); // Use email for uniqueness

    if (existingAdmin) {
      console.log('Admin (Admin) already exists. Skipping seeding.');
      await mongoose.disconnect();
      return;
    }

    // Generate empId using the static method from the User model
    const adminEmpId = await User.generateEmployeeId();

    // Create Preeti as an admin
    const adminAdmin = new User({
      empId: adminEmpId,
      fullName: {
        first: 'Admin',
        middle: '',
        last: 'Ji', // You can change this if you have a last name
      },
      email: 'admin@example.com', // Replace with actual email
      mobile: '7896543210', // Replace with actual mobile number
      password: await bcrypt.hash('admin123', 12), // Replace with a strong password
      department: 'Administration', // Replace with actual department
      designation: 'Admin', // Replace with actual designation
      role: 'admin', // Set the role to 'admin'
      isActive: true,
    });

    await adminAdmin.save();
    console.log('Admin (Admin) created successfully.');
  } catch (error) {
    console.error('Error seeding Admin (Admin):', error);
  } finally {
    await mongoose.disconnect();
  }
}

// Execute the seedAdmin function
seedAdmin();
