import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';
import Admin from './models/Admin.js';

dotenv.config();

async function createAdminCollection() {
  try {
    const mongoURI = process.env.MONGODB_URI;
    const adminEmail = process.env.ADMIN_EMAIL || 'admin@example.com';
    const adminPassword = process.env.ADMIN_PASSWORD || 'admin123';

    if (!mongoURI) {
      console.error('MONGODB_URI not found in .env file.');
      return;
    }

    await mongoose.connect(mongoURI);
    console.log('MongoDB connected for creating Admin collection.');

    // Check if admin already exists in the Admin collection
    const existingAdmin = await Admin.findOne({ email: adminEmail });

    if (existingAdmin) {
      console.log(`Admin with email ${adminEmail} already exists in Admin collection.`);
      
      // Update password if needed
      existingAdmin.password = adminPassword;
      await existingAdmin.save();
      console.log('Admin password updated.');
    } else {
      // Create new admin in the Admin collection
      const newAdmin = new Admin({
        fullName: {
          first: 'Admin',
          last: 'User'
        },
        email: adminEmail,
        password: adminPassword,
        role: 'admin'
      });

      await newAdmin.save();
      console.log(`New admin created in Admin collection with email: ${adminEmail}`);
    }

    // Remove admin from User collection if exists
    try {
      const result = await mongoose.connection.collection('users').deleteMany({ role: 'admin' });
      if (result.deletedCount > 0) {
        console.log(`Removed ${result.deletedCount} admin(s) from users collection.`);
      }
    } catch (err) {
      console.log('No admin users found in users collection or error removing them.');
    }

    console.log('Admin collection setup completed successfully.');
  } catch (error) {
    console.error('Error creating Admin collection:', error);
  } finally {
    await mongoose.disconnect();
  }
}

// Execute the function
createAdminCollection();