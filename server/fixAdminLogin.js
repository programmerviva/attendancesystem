import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';

dotenv.config();

async function fixAdminLogin() {
  try {
    const mongoURI = process.env.MONGODB_URI;
    const adminEmail = process.env.ADMIN_EMAIL || 'admin@example.com';
    const adminPassword = process.env.ADMIN_PASSWORD || 'admin123';
    const adminUserId = process.env.ADMIN_USERID || 'Admin1';

    if (!mongoURI) {
      console.error('MONGODB_URI not found in .env file.');
      return;
    }

    await mongoose.connect(mongoURI);
    console.log('MongoDB connected for fixing admin login.');

    // Find admin directly in the collection to bypass middleware
    const adminCollection = mongoose.connection.collection('admins');

    // Find admin by email
    const admin = await adminCollection.findOne({ email: adminEmail });

    if (!admin) {
      console.log(`No admin found with email ${adminEmail}. Creating new admin...`);

      // Hash password manually
      const hashedPassword = await bcrypt.hash(adminPassword, 12);

      // Create new admin directly in collection
      await adminCollection.insertOne({
        fullName: {
          first: 'Admin',
          last: 'User',
        },
        email: adminEmail,
        userId: adminUserId,
        password: hashedPassword,
        role: 'admin',
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      console.log(`New admin created with email: ${adminEmail} and userId: ${adminUserId}`);
    } else {
      // Reset admin password and add userId if it doesn't exist
      const hashedPassword = await bcrypt.hash(adminPassword, 12);
      await adminCollection.updateOne(
        { email: adminEmail },
        {
          $set: {
            password: hashedPassword,
            userId: adminUserId,
            updatedAt: new Date(),
          },
        }
      );
      console.log(`Admin updated with email: ${adminEmail} and userId: ${adminUserId}`);
    }

    console.log('Admin login fixed successfully.');
    console.log(`Admin login credentials: userId: ${adminUserId}, Password: ${adminPassword}`);
  } catch (error) {
    console.error('Error fixing admin login:', error);
  } finally {
    await mongoose.disconnect();
  }
}

// Execute the function
fixAdminLogin();
