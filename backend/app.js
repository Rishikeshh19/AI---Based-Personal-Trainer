require('dotenv').config();
const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const cookieParser = require('cookie-parser');
const path = require('path');
const http = require('http');
const socketIo = require('socket.io');
const { connectDB } = require('./config/database');
const { cacheService } = require('./config/redis');
const logger = require('./utils/logger');
const errorHandler = require('./middleware/error');
const apiRoutes = require('./routes');

// Initialize Express app
const app = express();
const PORT = process.env.PORT || 8000;

// Create HTTP server for Socket.IO
const server = http.createServer(app);

// Initialize Socket.IO
const io = socketIo(server, {
  cors: {
    origin: process.env.FRONTEND_URL || '*',
    credentials: true,
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE'
  }
});

// Make io globally accessible
global.io = io;
global.cacheService = cacheService;

// Middleware
app.use(cors({
  origin: process.env.FRONTEND_URL || '*',
  credentials: true,
  methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
  optionsSuccessStatus: 204
}));

// Body parser
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

// Cookie parser
app.use(cookieParser());

// Dev logging middleware
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

// Set static folder
app.use(express.static(path.join(__dirname, 'public')));

// Socket.IO connection handling
io.on('connection', (socket) => {
  logger.info(`✓ User connected: ${socket.id}`);

  socket.on('disconnect', () => {
    logger.info(`✗ User disconnected: ${socket.id}`);
  });

  // Listen for user joining their progress room
  socket.on('joinProgressRoom', (userId) => {
    const roomName = `progress:${userId}`;
    socket.join(roomName);
    logger.info(`User ${socket.id} joined room: ${roomName}`);
  });

  // Listen for user leaving
  socket.on('leaveProgressRoom', (userId) => {
    const roomName = `progress:${userId}`;
    socket.leave(roomName);
    logger.info(`User ${socket.id} left room: ${roomName}`);
  });
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'healthy',
    service: 'AI Personal Trainer API',
    timestamp: new Date().toISOString(),
    version: '1.0.0',
    docs: `http://localhost:${PORT}/api-docs`
  });
});

// API routes
app.use('/api', apiRoutes);

// Root endpoint
app.get('/', (req, res) => {
  res.json({
    message: 'Welcome to the AI-Based Personal Trainer Assistant API!',
    version: '1.0.0',
    docs: `http://localhost:${PORT}/api-docs`
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: 'Route not found',
    path: req.originalUrl
  });
});

// Error handler middleware (must be after all other middleware and routes)
app.use(errorHandler);

// Start server
const startServer = async () => {
  try {
    // Connect to MongoDB
    await connectDB();

    // Start the HTTP server with Socket.IO
    server.listen(PORT, () => {
      logger.info(`🚀 Server running on port ${PORT}`);
      console.log(`Server is running on http://localhost:${PORT}`);
      console.log(`Socket.IO is running on ws://localhost:${PORT}`);
    });
  } catch (error) {
    logger.error('Failed to start server:', error);
    process.exit(1);
  }
};

startServer();

// Handle unhandled promise rejections
process.on('unhandledRejection', (err) => {
  logger.error('Unhandled Rejection:', err);
  // Close server & exit process
  process.exit(1);
});

module.exports = app;