import { body, param } from 'express-validator';

export const createWorkoutValidation = [
    body('name').isString().isLength({ min: 2, max: 50 }),
    body('description').optional().isString(),
];

export const updateWorkoutValidation = [
    param('id').isMongoId(),
    body('name').optional().isString().isLength({ min: 2, max: 50 }),
    body('description').optional().isString(),
];

export const deleteWorkoutValidation = [
    param('id').isMongoId()
];

export const getWorkoutByIdValidation = [
    param('id').isMongoId()
];
