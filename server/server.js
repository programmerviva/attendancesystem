import dotenv from 'dotenv';
dotenv.config()

import express from 'express';
import mongoose from 'mongoose';
import authRouter from './routes/authRoutes.js';
import employeeRouter from './routes/employeeRoutes.js';
import attendanceRouter from './routes/attendanceRoutes.js';
import leaveRouter from './routes/leaveRoutes.js';
import userRouter from './routes/userRoutes.js';
import activityRouter from './routes/activityRoutes.js';
import settingsRouter from './routes/settingsRoutes.js';
import { globalErrorHandler } from './controllers/errorController.js';
import initSocket from './socket/index.js';
import http from 'http';
import cors from 'cors';

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// MongoDB Connection
mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('Connected to MongoDB Atlas'))
  .catch(err => console.error('MongoDB connection error:', err));

// Routes
app.use('/api/v1/auth', authRouter);
app.use('/api/v1/employee', employeeRouter);
app.use('/api/v1/attendance', attendanceRouter);
app.use('/api/v1/leaves', leaveRouter);
app.use('/api/v1/users', userRouter);
app.use('/api/v1/activity', activityRouter);
app.use('/api/v1/settings', settingsRouter);

// Basic route
app.get('/', (req, res) => {
  res.send('Attendance System API Running');
});

// Error handling middleware
app.use(globalErrorHandler);

const PORT = process.env.PORT || 5000;

const server = http.createServer(app); // Create server for socket.io
initSocket(server);

server.listen(PORT, () => {  //  Listen ONCE
  console.log(`Server running on port ${PORT}`);
});