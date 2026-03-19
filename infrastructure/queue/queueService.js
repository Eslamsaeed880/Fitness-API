import { Queue } from "bullmq";
import Redis from "ioredis";

const redisUrl = process.env.REDIS_URL;

export const connection = redisUrl
    ? new Redis(redisUrl, { maxRetriesPerRequest: null })
    : new Redis({
        host: process.env.REDIS_HOST || 'localhost',
        port: process.env.REDIS_PORT ? parseInt(process.env.REDIS_PORT, 10) : 6379,
        maxRetriesPerRequest: null,
    });

export const syncQueue = new Queue('sync-routine-likes', { connection });

export const initSyncJob = async () => {
    await syncQueue.add('flush-to-db', {}, {
        repeat: { every: 60_000 },
        jobId: 'minute-sync-job',
        removeOnComplete: true,
        removeOnFail: 100,
    });
    
    console.log(' --- Queue Service: Sync job initialized to run every minute');
};