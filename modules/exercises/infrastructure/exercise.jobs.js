export const EXERCISE_QUEUE_NAME = 'exercise';

export const EXERCISE_JOB_TYPES = Object.freeze({
    CREATE: 'create',
    UPDATE: 'update',
    DELETE: 'delete',
});

export const DEFAULT_EXERCISE_JOB_OPTIONS = Object.freeze({
    attempts: 3,
    backoff: {
        type: 'exponential',
        delay: 5000,
    },
    removeOnComplete: true,
    removeOnFail: false,
});

export function createExerciseCreateJob({ exerciseId, filePath, folder = 'media' }) {
    if (!exerciseId || !filePath) {
        throw new Error('exerciseId and filePath are required for create jobs');
    }

    return {
        name: EXERCISE_JOB_TYPES.CREATE,
        data: {
            exerciseId,
            filePath,
            folder,
        },
    };
}

export function createExerciseUpdateJob({ exerciseId, exerciseData, filePath, folder = 'media' }) {
    if (!exerciseId || !exerciseData) {
        throw new Error('exerciseId and exerciseData are required for update jobs');
    }

    return {
        name: EXERCISE_JOB_TYPES.UPDATE,
        data: {
            exerciseId,
            exerciseData,
            filePath,
            folder,
        },
    };
}

export function createExerciseDeleteJob({ exerciseId }) {
    if (!exerciseId) {
        throw new Error('exerciseId is required for delete jobs');
    }

    return {
        name: EXERCISE_JOB_TYPES.DELETE,
        data: {
            exerciseId,
        },
    };
}
