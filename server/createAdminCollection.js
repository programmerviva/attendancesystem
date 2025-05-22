import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';
import Admin from './models/Admin.js';

dotenv.config();

async function createAdminCollection() {
  try {
    const mongoURI = process.env.MONGODB_URI;
    const adminEmail = 'newadmin@example.com'; // Updated email
    const adminPassword = process.env.ADMIN_PASSWORD || 'admin123';
    const adminUserId = process.env.ADMIN_USERID || 'Admin1';

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
      // Update password and userId if needed
      existingAdmin.password = adminPassword;
      existingAdmin.userId = adminUserId;
      await existingAdmin.save();
      console.log('Admin password and userId updated.');
    } else {
      // Create new admin in the Admin collection
      const newAdmin = new Admin({
        fullName: {
          first: 'Admin',
          last: 'User'
        },
        email: adminEmail,
        userId: adminUserId,
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
    console.log(`Admin login credentials: Email: ${adminEmail}, Password: ${adminPassword}`);
  } catch (error) {
    console.error('Error creating Admin collection:', error);
  } finally {
    await mongoose.disconnect();
  }
}

// Execute the function
createAdminCollection();