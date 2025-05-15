import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';

dotenv.config();

async function fixEmployeePassword() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');
    
    // Get the User model
    const User = mongoose.model('User');
    
    // Find the specific user
    const user = await User.findOne({ email: 'chandan@gmail.com' });
    
    if (!user) {
      console.log('User not found. Creating new user...');
      return;
    }
    
    console.log('User found:', user.email);
    
    // Update password directly in the database
    const hashedPassword = await bcrypt.hash('123456', 12);
    
    // Update using updateOne to bypass mongoose hooks
    await User.updateOne(
      { _id: user._id },
      { $set: { password: hashedPassword } }
    );
    
    console.log('Password updated for user:', user.email);
    console.log('New login credentials:');
    console.log('Email: chandan@gmail.com');
    console.log('Password: 123456');
    
    // Verify the password was updated
    const updatedUser = await User.findById(user._id);
    const isPasswordValid = await bcrypt.compare('123456', updatedUser.password);
    console.log('Password verification:', isPasswordValid ? 'SUCCESS' : 'FAILED');
    
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  }
}

fixEmployeePassword();