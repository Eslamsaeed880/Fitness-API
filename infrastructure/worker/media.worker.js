import { Worker } from 'bullmq';
import MediaService from '../media/media.service.js';
import { getBullmqConnection } from '../../config/bullmq.connection.js';

const mediaService = new MediaService();

export const mediaWorker = new Worker(
    'media',
    async (job) => {
        const { type, payload } = job.data;

        switch (type) {
            case 'upload': {
                const { filePath, folder } = payload;
                return await mediaService.uploadToCloudinary(filePath, folder);
            }
            case 'delete': {
                const { publicId, resourceType } = payload;
                return await mediaService.deleteFromCloudinary(publicId, resourceType);
            }
            default:
                throw new Error(`Unknown job type: ${type}`);
        }
    },
    { connection: getBullmqConnection() }
);

mediaWorker.on('completed', (job) => {
    console.log(`[MediaWorker] Job ${job.id} completed successfully`);
});

mediaWorker.on('failed', (job, err) => {
    console.error(`[MediaWorker] Job ${job?.id} failed:`, err.message);
});

mediaWorker.on('error', (err) => {
    console.error('[MediaWorker] Worker error:', err);
});

console.log('Media worker started and listening for jobs...');

export default mediaWorker;
