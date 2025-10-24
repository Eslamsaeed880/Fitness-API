import { body, param } from 'express-validator';

export const createExerciseValidation = [
    body('name').isString().isLength({ min: 2, max: 50 }),
    body('description').optional().isString(),
    body('category').isString().isLength({ min: 2, max: 30 })
];

export const updateExerciseValidation = [
    param('id').isMongoId(),
    body('name').optional().isString().isLength({ min: 2, max: 50 }),
    body('description').optional().isString(),
    body('category').optional().isString().isLength({ min: 2, max: 30 })
];

export const updateUserRoleValidation = [
    param('id').isMongoId(),
    body('role').isIn(['user', 'admin'])
];

export const deleteUserValidation = [
    param('id').isMongoId()
];

export const deleteExerciseValidation = [
    param('id').isMongoId()
];

export const getUserByIdValidation = [
    param('id').isMongoId()
];

export const getExerciseByIdValidation = [
    param('id').isMongoId()
];
