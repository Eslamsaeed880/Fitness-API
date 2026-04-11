import { Worker } from 'bullmq';
import IORedis from 'ioredis';
import MediaService from '../media/media.service.js';

const connection = new IORedis(process.env.REDIS_URL || 'redis://localhost:6379', {
    maxRetriesPerRequest: null,
});

const mediaService = new MediaService();

export const mediaWorker = new Worker('media', async (job) => {
    try {
        const { type, payload } = job.data;

        switch (type) {
            case 'upload':
                return await mediaService.uploadToCloudinary(
                    payload.filePath,
                    payload.folder
                );

            case 'delete':
                return await mediaService.deleteFromCloudinary(
                    payload.publicId,
                    payload.type || 'image'
                );

            default:
                throw new Error(`Unknown job type: ${type}`);
        }
    } catch (err) {
        console.error('Media worker error:', err);
        throw err;
    }
}, { connection });

// Worker event handlers
mediaWorker.on('completed', (job) => {
    console.log(`Job ${job.id} completed successfully`);
});

mediaWorker.on('failed', (job, err) => {
    console.error(`Job ${job.id} failed with error:`, err.message);
});

mediaWorker.on('error', (err) => {
    console.error('Worker error:', err);
});

export default mediaWorker;
