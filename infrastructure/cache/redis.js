import { createClient } from 'redis';
import config from '../../config/config.js';

const redisClient = createClient({
    url: config.redisUrl || 'redis://localhost:6379',
    socket: {
        reconnectStrategy: (retries) => Math.min(retries * 50, 500),
    },
});

redisClient.on('error', (err) => {
    console.error('[CacheService] Redis client error:', err.message);
});

redisClient.on('connect', () => {
    console.log('[CacheService] Connected to Redis');
});

try {
    await redisClient.connect();
} catch (err) {
    console.error('[CacheService] Failed to connect to Redis on startup:', err.message);
    console.error('Make sure Redis is running at:', config.redisUrl || 'redis://localhost:6379');
}

export default redisClient;
