import 'dotenv/config';
import { Worker } from 'bullmq';
import Exercise from '../exercise.model.js';
import APIError from '../../../utils/APIError.js';
import MediaService from '../../../infrastructure/media/media.service.js';
import { getBullmqConnection } from '../../../config/bullmq.connection.js';
import connectDB from '../../../config/mongodb.js';
import { EXERCISE_JOB_TYPES, EXERCISE_QUEUE_NAME } from './exercise.jobs.js';

console.log('[ExerciseWorker] Initializing...');
await connectDB();

const mediaService = new MediaService();

export const exerciseWorker = new Worker(
    EXERCISE_QUEUE_NAME,
    async (job) => {
        try {
            switch (job.name) {
                case EXERCISE_JOB_TYPES.CREATE: {
                    const { exerciseId, filePath, folder } = job.data;
                    const exercise = await Exercise.findById(exerciseId);

                    if (!exercise) {
                        throw new APIError(404, 'Exercise not found.');
                    }

                    try {
                        const uploadedMedia = await mediaService.uploadToCloudinary(filePath, folder);
                        exercise.media = {
                            url: uploadedMedia.url,
                            publicId: uploadedMedia.publicId,
                        };
                        exercise.status = 'ready';
                        await exercise.save();
                        return exercise;
                    } catch (err) {
                        exercise.status = 'failed';
                        await exercise.save();
                        throw err;
                    }
                }

                case EXERCISE_JOB_TYPES.UPDATE: {
                    const { exerciseId, exerciseData, filePath, folder } = job.data;
                    const exercise = await Exercise.findById(exerciseId);

                    if (!exercise) {
                        throw new APIError(404, 'Exercise not found.');
                    }

                    Object.assign(exercise, exerciseData);

                    if (filePath) {
                        if (exercise.media?.publicId) {
                            await mediaService.deleteFromCloudinary(exercise.media.publicId, 'image');
                        }

                        const uploadedMedia = await mediaService.uploadToCloudinary(filePath, folder);
                        exercise.media = {
                            url: uploadedMedia.url,
                            publicId: uploadedMedia.publicId,
                        };
                    }

                    await exercise.save();
                    return exercise;
                }

                case EXERCISE_JOB_TYPES.DELETE: {
                    const { exerciseId } = job.data;
                    const exercise = await Exercise.findByIdAndDelete(exerciseId);

                    if (!exercise) {
                        throw new APIError(404, 'Exercise not found.');
                    }

                    if (exercise.media?.publicId) {
                        await mediaService.deleteFromCloudinary(exercise.media.publicId, 'image');
                    }

                    return exercise;
                }

                default:
                    throw new Error(`Unknown exercise job: ${job.name}`);
            }
        } catch (err) {
            console.error('[ExerciseWorker] Job failed:', err);
            throw err;
        }
    },
    { connection: getBullmqConnection() }
);

exerciseWorker.on('active', (job) => {
    console.log(`[ExerciseWorker] Job ${job.id} started (${job.name})`);
});

exerciseWorker.on('progress', (job, progress) => {
    console.log(`[ExerciseWorker] Job ${job.id} progress: ${progress}`);
});

exerciseWorker.on('completed', (job) => {
    console.log(`[ExerciseWorker] Job ${job.id} completed successfully`);
});

exerciseWorker.on('failed', (job, err) => {
    console.error(`[ExerciseWorker] Job ${job?.id} failed:`, err.message);
});

exerciseWorker.on('error', (err) => {
    console.error('[ExerciseWorker] Worker error:', err);
});

console.log('Exercise worker started and listening for jobs...');

export default exerciseWorker;
