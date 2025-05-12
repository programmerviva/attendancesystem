import express from 'express';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import authRouter from './routes/authRoutes.js';
import { globalErrorHandler } from './controllers/errorController.js';
import initSocket from './socket/index.js';
import http from 'http';


const server = http.createServer(app);
initSocket(server);

// Replace app.listen with:
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});


// Load environment variables
dotenv.config();

const app = express();

// Middleware
app.use(express.json());

// MongoDB Connection
mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('Connected to MongoDB Atlas'))
  .catch(err => console.error('MongoDB connection error:', err));

// Routes
app.use('/api/v1/auth', authRouter);

// Basic route
app.get('/', (req, res) => {
  res.send('Attendance System API Running');
});

// Error handling middleware
app.use(globalErrorHandler);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});