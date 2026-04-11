import IORedis from 'ioredis';
import config from './config.js';

let bullmqConnection;

export function getBullmqConnection() {
    if (!bullmqConnection) {
        bullmqConnection = new IORedis(config.redisUrl || 'redis://localhost:6379', {
            maxRetriesPerRequest: null,
        });

        bullmqConnection.on('error', (err) => {
            console.error('[BullMQ] Redis connection error:', err.message);
        });
    }

    return bullmqConnection;
}
