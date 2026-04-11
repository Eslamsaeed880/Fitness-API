import { Queue } from 'bullmq';
import IORedis from 'ioredis';
import MediaService from '../media/media.service.js';

const connection = new IORedis(process.env.REDIS_URL || 'redis://localhost:6379', {
    maxRetriesPerRequest: null,
});

export const mediaQueue = new Queue('media', { connection });
    
export async function enqueueMediaJob({
    type,
    payload
}) {
    if (!type || !payload) {
        throw new Error('Job type and payload are required');
    }

    try {
        const job = await mediaQueue.add(
            type, 
            payload, {
                attempts: 3,
                backoff: {
                    type: 'exponential',
                    delay: 5000
                },
                removeOnComplete: true,
                removeOnFail: false
           }
        );

        return job;
    } catch (err) {
        console.error('Error enqueuing media job:', err);
        throw new Error('Failed to enqueue media job');
    }
}