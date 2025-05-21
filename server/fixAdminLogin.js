import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';

dotenv.config();

async function fixAdminLogin() {
  try {
    const mongoURI = process.env.MONGODB_URI;
    const adminEmail = process.env.ADMIN_EMAIL || 'admin@example.com';
    const adminPassword = process.env.ADMIN_PASSWORD || 'admin123';

    if (!mongoURI) {
      console.error('MONGODB_URI not found in .env file.');
      return;
    }

    await mongoose.connect(mongoURI);
    console.log('MongoDB connected for fixing admin login.');

    // Check if admin exists in admins collection
    const adminCollection = mongoose.connection.collection('admins');
    const admin = await adminCollection.findOne({ email: adminEmail });

    if (admin) {
      console.log(`Found admin with email ${adminEmail} in admins collection.`);
      
      // Hash the password
      const hashedPassword = await bcrypt.hash(adminPassword, 12);
      
      // Update the admin with the new password
      await adminCollection.updateOne(
        { email: adminEmail },
        { 
          $set: { 
            password: hashedPassword,
            passwordChangedAt: new Date()
          } 
        }
      );
      
      console.log('Admin password updated successfully.');
    } else {
      console.log(`No admin found with email ${adminEmail}. Creating new admin...`);
      
      // Hash the password
      const hashedPassword = await bcrypt.hash(adminPassword, 12);
      
      // Create new admin directly in the collection
      await adminCollection.insertOne({
        fullName: {
          first: 'Admin',
          last: 'User'
        },
        email: adminEmail,
        password: hashedPassword,
        role: 'admin',
        createdAt: new Date(),
        updatedAt: new Date()
      });
      
      console.log('New admin created successfully.');
    }

    // Also check users collection and remove any admin
    const usersCollection = mongoose.connection.collection('users');
    const result = await usersCollection.deleteMany({ role: 'admin' });
    
    if (result.deletedCount > 0) {
      console.log(`Removed ${result.deletedCount} admin(s) from users collection.`);
    }

    console.log('Admin login fixed successfully.');
    
    // Print admin credentials for verification
    console.log('\nAdmin Credentials:');
    console.log(`Email: ${adminEmail}`);
    console.log(`Password: ${adminPassword}`);
    console.log('\nPlease use these credentials to login.');
    
  } catch (error) {
    console.error('Error fixing admin login:', error);
  } finally {
    await mongoose.disconnect();
  }
}

// Execute the function
fixAdminLogin();