import { body, param } from 'express-validator';
import WorkoutSession from '../models/workoutSession.js';

export const createWorkoutSessionValidation = [
    body('workoutId').isMongoId(),
    body('date').isISO8601(),
    body('duration').isInt({ min: 1 }),
];

export const updateWorkoutSessionValidation = [
    param('id')
        .isMongoId()
        .withMessage('Invalid workout session ID')
        .custom(async (value, { req }) => {
            const workoutSession = await WorkoutSession.findById(value);
            if (!workoutSession) {
                throw new Error('Workout session not found');
            }
            return true;
        }),
    body('date')
        .optional()
        .isISO8601(),
    body('duration')
        .optional()
        .isInt({ min: 1 }),
];

export const updateStatusValidation = [
    param('id')
        .isMongoId()
        .withMessage('Invalid workout session ID')
        .custom(async (value, { req }) => {
            const workoutSession = await WorkoutSession.findById(value);
            if (!workoutSession) {
                throw new Error('Workout session not found');
            }
            return true;
        }),
    body('status')
        .isIn(['completed', 'pending', 'skipped'])
        .withMessage('Invalid status')
];

export const getWorkoutSessionByIdValidation = [
    param('id')
        .isMongoId()
        .withMessage('Invalid workout session ID')
        .custom(async (value, { req }) => {
            const workoutSession = await WorkoutSession.findById(value);
            if (!workoutSession) {
                throw new Error('Workout session not found');
            }
            return true;
        })
];
