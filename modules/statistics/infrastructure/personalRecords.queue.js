import { Queue } from 'bullmq';
import IORedis from 'ioredis';

const connection = new IORedis(process.env.REDIS_URL || 'redis://localhost:6379', {
    maxRetriesPerRequest: null,
});

export const addToPersonalRecordsQueue = new Queue('addToPersonalRecords', { connection });

export async function enqueueAddToPersonalRecordsJob({ userId, workoutId, workout }) {
    const resolvedWorkoutId = workout?._id || workoutId;

    if (!userId || !resolvedWorkoutId) {
        throw new Error('User ID and workout ID are required to add to personal records');
    }

    try {
        const job = await addToPersonalRecordsQueue.add(
            'addToPersonalRecords',
            { userId, workoutId: resolvedWorkoutId }, {
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
        console.error('[AddToPersonalRecordsQueue] Failed to enqueue job:', err);
        throw new Error('Failed to enqueue job for adding to personal records');
    }
}