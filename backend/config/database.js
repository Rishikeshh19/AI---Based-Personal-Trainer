const mongoose = require('mongoose');
const logger = require('../utils/logger');

const MONGODB_URI = process.env.MONGODB_URI || process.env.MONGODB_URL || 'mongodb://localhost:27017';
const DB_NAME = process.env.DATABASE_NAME || 'ai_trainer';

// Connection options
const options = {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    serverSelectionTimeoutMS: 30000,
    socketTimeoutMS: 45000,
    maxPoolSize: 50,
    minPoolSize: 10,
    dbName: DB_NAME,
    retryWrites: true,
    w: 'majority',
    family: 4
};

// Connect to MongoDB
const connectDB = async () => {
    try {
        // Close existing connection if exists
        if (mongoose.connection.readyState !== 0) {
            await mongoose.disconnect();
        }

        // Connect to MongoDB
        await mongoose.connect(MONGODB_URI, options);

        logger.info(`✅ Connected to MongoDB at ${MONGODB_URI}/${DB_NAME}`);

        // Initialize models
        await initializeModels();

        return mongoose.connection;
    } catch (error) {
        logger.error('❌ MongoDB connection error:', error);
        process.exit(1);
    }
};

// Initialize all models
const initializeModels = async () => {
    try {
        // Import all model files
        require('../models/User');
        require('../models/Workout');
        // Add other models as needed

        logger.info('✅ Database models initialized');
    } catch (error) {
        logger.error('❌ Error initializing database models:', error);
        throw error;
    }
};

// Handle MongoDB connection events
mongoose.connection.on('connected', () => {
    logger.info('Mongoose connected to DB');
});

mongoose.connection.on('error', (err) => {
    logger.error('Mongoose connection error:', err);
});

mongoose.connection.on('disconnected', () => {
    logger.warn('Mongoose disconnected');
});

// Close the Mongoose connection when the app is terminated
// Note: Don't handle SIGINT/SIGTERM here as it interferes with normal operation
// The process manager (npm, pm2, etc.) will handle graceful shutdown
let isShuttingDown = false;

module.exports = {
    connectDB,
    mongoose,
    getDb: () => mongoose.connection.db
};
