import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';
import User from './models/User.js';

dotenv.config();

async function fixEmployeeLogin() {
  try {
    const mongoURI = process.env.MONGODB_URI;
    if (!mongoURI) {
      console.error('MONGODB_URI not found in .env file.');
      return;
    }

    await mongoose.connect(mongoURI);
    console.log('MongoDB connected for fixing employee login.');

    // Find the specific user
    const user = await User.findOne({ email: 'komu@gmail.com' });
    
    if (!user) {
      console.log('User not found. Please check the email address.');
      return;
    }
    
    console.log('User found:', user.email);
    
    // Hash the password manually
    const hashedPassword = await bcrypt.hash('123456', 12);
    
    // Update the password directly in the database
    await User.updateOne(
      { _id: user._id },
      { $set: { password: hashedPassword } }
    );
    
    console.log('Password updated successfully for user:', user.email);
    console.log('New login credentials:');
    console.log('Email: komu@gmail.com');
    console.log('Password: 123456');
    
    // Verify the password was updated
    const updatedUser = await User.findById(user._id);
    const isPasswordValid = await bcrypt.compare('123456', updatedUser.password);
    console.log('Password verification:', isPasswordValid ? 'SUCCESS' : 'FAILED');
    
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await mongoose.disconnect();
    console.log('MongoDB disconnected.');
  }
}

fixEmployeeLogin();