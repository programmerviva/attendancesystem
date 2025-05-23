// server/socket/index.js
import { Server } from 'socket.io';

export default function initSocket(server) {
  const io = new Server(server, {
    cors: {
      origin: process.env.CLIENT_URL,
      methods: ['GET', 'POST'],
    },
  });

  io.on('connection', (socket) => {
    console.log('New client connected');
    // Add real-time event handlers here
  });

  return io;
}
