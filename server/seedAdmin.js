import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';
import User from './models/User.js';

dotenv.config();

async function seedPreetiAdmin() {
  try {
    const mongoURI = process.env.MONGODB_URI;

    if (!mongoURI) {
      console.error('MONGODB_URI not found in .env file.');
      return;
    }

    await mongoose.connect(mongoURI);
    console.log('MongoDB connected for seeding Preeti (Admin).');

    // Check if Preeti already exists
    const existingAdmin = await User.findOne({ email: 'preeti@example.com' }); // Use email for uniqueness

    if (existingAdmin) {
      console.log('Preeti (Admin) already exists. Skipping seeding.');
      await mongoose.disconnect();
      return;
    }

    // Generate empId using the static method from the User model
    const preetiEmpId = await User.generateEmployeeId();

    // Create Preeti as an admin
    const preetiAdmin = new User({
      empId: preetiEmpId,
      fullName: {
        first: 'Preeti',
        middle: '',
        last: 'Sharma', // You can change this if you have a last name
      },
      email: 'preeti@example.com', // Replace with actual email
      mobile: '7896543210', // Replace with actual mobile number
      password: await bcrypt.hash('preetiPassword', 12), // Replace with a strong password
      department: 'Administration', // Replace with actual department
      designation: 'Super Admin', // Replace with actual designation
      role: 'admin', // Set the role to 'admin'
      isActive: true,
    });

    await preetiAdmin.save();
    console.log('Preeti (Admin) created successfully.');
  } catch (error) {
    console.error('Error seeding Preeti (Admin):', error);
  } finally {
    await mongoose.disconnect();
  }
}

// Execute the seedPreetiAdmin function
seedPreetiAdmin();
