import { Queue, QueueEvents } from 'bullmq';
import { getBullmqConnection } from '../../../config/bullmq.connection.js';
import {
    DEFAULT_EXERCISE_JOB_OPTIONS,
    EXERCISE_QUEUE_NAME,
    createExerciseCreateJob,
    createExerciseDeleteJob,
    createExerciseUpdateJob,
} from './exercise.jobs.js';

export const exerciseQueue = new Queue(EXERCISE_QUEUE_NAME, {
    connection: getBullmqConnection(),
});

export const exerciseQueueEvents = new QueueEvents(EXERCISE_QUEUE_NAME, {
    connection: getBullmqConnection(),
});

async function enqueueExerciseTask(job, waitForResult = true) {
    const queuedJob = await exerciseQueue.add(job.name, job.data, DEFAULT_EXERCISE_JOB_OPTIONS);
    if (!waitForResult) {
        return queuedJob;
    }

    return queuedJob.waitUntilFinished(exerciseQueueEvents);
}

export async function enqueueExerciseCreateJob(payload) {
    return enqueueExerciseTask(createExerciseCreateJob(payload), false);
}

export async function enqueueExerciseUpdateJob(payload) {
    return enqueueExerciseTask(createExerciseUpdateJob(payload));
}

export async function enqueueExerciseDeleteJob(payload) {
    return enqueueExerciseTask(createExerciseDeleteJob(payload));
}
