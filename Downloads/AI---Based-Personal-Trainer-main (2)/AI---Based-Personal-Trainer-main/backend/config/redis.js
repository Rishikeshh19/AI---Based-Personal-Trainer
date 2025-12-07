const redis = require('redis');
const logger = require('../utils/logger');

let redisAvailable = false;

// Create Redis client with better error handling
const client = redis.createClient({
    socket: {
        host: process.env.REDIS_HOST || 'localhost',
        port: process.env.REDIS_PORT || 6379,
        reconnectStrategy: (retries) => {
            // Stop trying after 5 attempts
            if (retries > 5) {
                logger.warn('⚠️  Redis unavailable - Running without cache (this is OK)');
                redisAvailable = false;
                return false; // Stop reconnecting
            }
            return Math.min(retries * 100, 1000);
        }
    },
    password: process.env.REDIS_PASSWORD || undefined,
});

// Handle Redis connection events
client.on('connect', () => {
    logger.info('✓ Redis client connected');
    redisAvailable = true;
});

client.on('error', (err) => {
    // Only log error once, not continuously
    if (redisAvailable) {
        logger.error('Redis Client Error', { error: err.message });
        redisAvailable = false;
    }
});

client.on('ready', () => {
    logger.info('✓ Redis client ready');
    redisAvailable = true;
});

client.on('reconnecting', () => {
    if (redisAvailable) {
        logger.warn('Redis client reconnecting...');
    }
});

// Try to connect to Redis, but don't crash if it fails
client.connect().catch((err) => {
    logger.warn('⚠️  Redis not available - Application will run without caching');
    logger.warn('   (This is normal if Redis is not installed)');
    redisAvailable = false;
});

// Cache service helper functions with graceful fallback
const cacheService = {
    // Set cache with expiration (in seconds)
    async set(key, value, expirationSeconds = 3600) {
        if (!redisAvailable) return; // Silently skip if Redis not available
        try {
            await client.setEx(key, expirationSeconds, JSON.stringify(value));
            logger.debug(`Cache SET: ${key}`);
        } catch (error) {
            logger.debug('Redis SET error (skipping)', { key });
        }
    },

    // Get cache
    async get(key) {
        if (!redisAvailable) return null; // Return null if Redis not available
        try {
            const value = await client.get(key);
            if (value) {
                logger.debug(`Cache HIT: ${key}`);
                return JSON.parse(value);
            }
            logger.debug(`Cache MISS: ${key}`);
            return null;
        } catch (error) {
            logger.debug('Redis GET error (skipping)', { key });
            return null;
        }
    },

    // Delete cache
    async delete(key) {
        if (!redisAvailable) return;
        try {
            await client.del(key);
            logger.debug(`Cache DELETE: ${key}`);
        } catch (error) {
            logger.debug('Redis DELETE error (skipping)', { key });
        }
    },

    // Clear cache pattern (e.g" "user:123:*")
    async deletePattern(pattern) {
        if (!redisAvailable) return;
        try {
            const keys = await client.keys(pattern);
            if (keys.length > 0) {
                await client.del(keys);
                logger.debug(`Cache DELETE PATTERN: ${pattern} (${keys.length} keys)`);
            }
        } catch (error) {
            logger.debug('Redis DELETE PATTERN error (skipping)', { pattern });
        }
    },

    // Get all keys matching pattern
    async getKeys(pattern) {
        if (!redisAvailable) return [];
        try {
            return await client.keys(pattern);
        } catch (error) {
            logger.debug('Redis KEYS error (skipping)', { pattern });
            return [];
        }
    },

    // Publish message to channel
    async publish(channel, message) {
        if (!redisAvailable) return;
        try {
            await client.publish(channel, JSON.stringify(message));
            logger.debug(`Redis PUBLISH: ${channel}`);
        } catch (error) {
            logger.debug('Redis PUBLISH error (skipping)', { channel });
        }
    }
};

module.exports = { client, cacheService };
