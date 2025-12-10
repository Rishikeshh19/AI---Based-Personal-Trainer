require('dotenv').config();
const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const cookieParser = require('cookie-parser');
const compression = require('compression');
const helmet = require('helmet');
const path = require('path');
const http = require('http');
const socketIo = require('socket.io');
const { connectDB } = require('./config/database');
const { cacheService } = require('./config/redis');
const logger = require('./utils/logger');
const errorHandler = require('./middleware/error');
const { metricsMiddleware } = require('./middleware/metrics');
const apiRoutes = require('./routes');

// Initialize Express app
const app = express();
const PORT = process.env.PORT || 8000;

// Create HTTP server for Socket.IO
const server = http.createServer(app);

// Initialize Socket.IO
const io = socketIo(server, {
  cors: {
    origin: ['http://localhost:5173', 'http://localhost:5174', 'http://localhost:5175', 'http://localhost:3000', process.env.FRONTEND_URL || '*'],
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS']
  },
  transports: ['websocket', 'polling'],
  perMessageDeflate: {
    threshold: 1024,
    serverNoContextTakeover: true,
    clientNoContextTakeover: true,
    serverMaxWindowBits: 10,
    concurrencyLimit: 10,
    zlibDeflateOptions: {
      chunkSize: 1024,
      memLevel: 7,
      level: 3
    }
  }
});

// Make io globally accessible
global.io = io;
global.cacheService = cacheService;

// Performance & Security Middleware
app.use(helmet({
  crossOriginResourcePolicy: false,
}));
app.use(compression({ level: 6, threshold: 1024 }));

// CORS Configuration
const allowedOrigins = [
  'http://localhost:5173',
  'http://localhost:5174',
  'http://localhost:5175',
  'http://localhost:3000',
  process.env.FRONTEND_URL
].filter(Boolean);

app.use(cors({
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);
    
    if (allowedOrigins.indexOf(origin) !== -1 || process.env.NODE_ENV === 'development') {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'HEAD', 'PUT', 'PATCH', 'POST', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
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

// Metrics middleware for Prometheus
app.use(metricsMiddleware);

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
  
  // Listen for user joining their notification room
  socket.on('joinNotificationRoom', (userId) => {
    const roomName = `user:${userId}`;
    socket.join(roomName);
    logger.info(`User ${socket.id} joined notification room: ${roomName}`);
  });
  
  // Listen for user leaving notification room
  socket.on('leaveNotificationRoom', (userId) => {
    const roomName = `user:${userId}`;
    socket.leave(roomName);
    logger.info(`User ${socket.id} left notification room: ${roomName}`);
  });

  // Dashboard real-time updates
  socket.on('joinDashboard', (userId) => {
    const roomName = `dashboard:${userId}`;
    socket.join(roomName);
    logger.info(`User ${socket.id} joined dashboard room: ${roomName}`);
  });

  socket.on('leaveDashboard', (userId) => {
    const roomName = `dashboard:${userId}`;
    socket.leave(roomName);
    logger.info(`User ${socket.id} left dashboard room: ${roomName}`);
  });

  // Handle errors
  socket.on('error', (error) => {
    logger.error(`Socket error for ${socket.id}:`, error);
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
  // Log but don't exit - allow server to continue
  console.error('Unhandled Promise Rejection:', err);
});

// Handle uncaught exceptions
process.on('uncaughtException', (err) => {
  logger.error('Uncaught Exception:', err);
  console.error('Uncaught Exception:', err);
});

module.exports = app;