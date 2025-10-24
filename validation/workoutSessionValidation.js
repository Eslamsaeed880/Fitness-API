import { body, param } from 'express-validator';

export const createWorkoutSessionValidation = [
    body('workoutId').isMongoId(),
    body('date').isISO8601(),
    body('duration').isInt({ min: 1 }),
];

export const updateWorkoutSessionValidation = [
    param('id').isMongoId(),
    body('date').optional().isISO8601(),
    body('duration').optional().isInt({ min: 1 }),
];

export const updateStatusValidation = [
    param('id').isMongoId(),
    body('status').isIn(['completed', 'pending', 'skipped'])
];

export const getWorkoutSessionByIdValidation = [
    param('id').isMongoId()
];
