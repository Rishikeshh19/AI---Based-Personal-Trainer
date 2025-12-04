const redis = require('redis');
const logger = require('../utils/logger');

// Create Redis client
const client = redis.createClient({
    host: process.env.REDIS_HOST || 'localhost',
    port: process.env.REDIS_PORT || 6379,
    password: process.env.REDIS_PASSWORD || undefined,
    retryStrategy: (options) => {
        if (options.error && options.error.code === 'ECONNREFUSED') {
            logger.warn('Redis connection refused. Using in-memory fallback.');
            return new Error('Redis connection refused');
        }
        if (options.total_retry_time > 1000 * 60 * 60) {
            return new Error('Redis retry time exhausted');
        }
        if (options.attempt > 10) {
            return undefined;
        }
        return Math.min(options.attempt * 100, 3000);
    }
});

// Handle Redis connection events
client.on('connect', () => {
    logger.info('✓ Redis client connected');
});

client.on('error', (err) => {
    logger.error('Redis Client Error', { error: err.message });
});

client.on('ready', () => {
    logger.info('✓ Redis client ready');
});

client.on('reconnecting', () => {
    logger.warn('Redis client reconnecting...');
});

// Connect to Redis
client.connect().catch((err) => {
    logger.error('Failed to connect to Redis', { error: err.message });
});

// Cache service helper functions
const cacheService = {
    // Set cache with expiration (in seconds)
    async set(key, value, expirationSeconds = 3600) {
        try {
            await client.setEx(key, expirationSeconds, JSON.stringify(value));
            logger.debug(`Cache SET: ${key}`);
        } catch (error) {
            logger.error('Redis SET error', { key, error: error.message });
        }
    },

    // Get cache
    async get(key) {
        try {
            const value = await client.get(key);
            if (value) {
                logger.debug(`Cache HIT: ${key}`);
                return JSON.parse(value);
            }
            logger.debug(`Cache MISS: ${key}`);
            return null;
        } catch (error) {
            logger.error('Redis GET error', { key, error: error.message });
            return null;
        }
    },

    // Delete cache
    async delete(key) {
        try {
            await client.del(key);
            logger.debug(`Cache DELETE: ${key}`);
        } catch (error) {
            logger.error('Redis DELETE error', { key, error: error.message });
        }
    },

    // Clear cache pattern (e.g., "user:123:*")
    async deletePattern(pattern) {
        try {
            const keys = await client.keys(pattern);
            if (keys.length > 0) {
                await client.del(keys);
                logger.debug(`Cache DELETE PATTERN: ${pattern} (${keys.length} keys)`);
            }
        } catch (error) {
            logger.error('Redis DELETE PATTERN error', { pattern, error: error.message });
        }
    },

    // Get all keys matching pattern
    async getKeys(pattern) {
        try {
            return await client.keys(pattern);
        } catch (error) {
            logger.error('Redis KEYS error', { pattern, error: error.message });
            return [];
        }
    },

    // Publish message to channel
    async publish(channel, message) {
        try {
            await client.publish(channel, JSON.stringify(message));
            logger.debug(`Redis PUBLISH: ${channel}`);
        } catch (error) {
            logger.error('Redis PUBLISH error', { channel, error: error.message });
        }
    }
};

module.exports = { client, cacheService };
