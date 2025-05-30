import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import path from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

dotenv.config();

async function fixIndex() {
  try {
    console.log('Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');
    
    try {
      // Drop the conflicting index
      await mongoose.connection.db.collection('outdoorduties').dropIndex('user_1_date_1');
      console.log('Successfully dropped the conflicting index');
    } catch (err) {
      console.log('Error dropping index:', err.message);
    }
    
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  } catch (err) {
    console.error('Connection error:', err.message);
  }
}

fixIndex();