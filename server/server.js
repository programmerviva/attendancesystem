import express from 'express';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import authRouter from './routes/authRoutes.js';
import { globalErrorHandler } from './controllers/errorController.js';
import initSocket from './socket/index.js';
import http from 'http';
import cors from 'cors';

// Load environment variables
dotenv.config();

const app = express();

// Middleware
app.use(cors({
  origin: process.env.CLIENT_URL,
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
}));
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

const server = http.createServer(app); // Create server for socket.io
initSocket(server);

server.listen(PORT, () => {  //  Listen ONCE
  console.log(`Server running on port ${PORT}`);
});