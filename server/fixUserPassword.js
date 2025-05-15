import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';
import User from './models/User.js';

dotenv.config();

async function fixUserPassword() {
  try {
    const mongoURI = process.env.MONGODB_URI;
    if (!mongoURI) {
      console.error('MONGODB_URI not found in .env file.');
      return;
    }

    await mongoose.connect(mongoURI);
    console.log('MongoDB connected for fixing user password.');

    // Find the user
    const user = await User.findOne({ email: 'test@example.com' });
    
    if (!user) {
      console.log('User not found. Creating new user...');
      
      // Create a new user with a simple password
      const newUser = new User({
        fullName: { first: 'Test', last: 'User' },
        email: 'test@example.com',
        mobile: '9876543210',
        password: 'test123', // Will be hashed by the model's pre-save hook
        department: 'IT',
        designation: 'Developer',
        role: 'employee'
      });
      
      await newUser.save();
      console.log('New user created with email: test@example.com and password: test123');
    } else {
      console.log('User found. Updating password...');
      
      // Update the password directly in the database to bypass any hooks
      const passwordHash = await bcrypt.hash('test123', 12);
      
      // Update using updateOne to bypass mongoose hooks
      await User.updateOne(
        { _id: user._id },
        { $set: { password: passwordHash } }
      );
      
      console.log('Password updated for user test@example.com');
      console.log('New password hash:', passwordHash);
    }
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await mongoose.disconnect();
  }
}

fixUserPassword();