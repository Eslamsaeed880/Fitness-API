import { body, param } from 'express-validator';

export const createPostValidation = [
    body('title').isString().isLength({ min: 2, max: 100 }),
    body('content').isString().isLength({ min: 2 }),
];

export const updatePostValidation = [
    param('id').isMongoId(),
    body('title').optional().isString().isLength({ min: 2, max: 100 }),
    body('content').optional().isString().isLength({ min: 2 }),
];

export const deletePostValidation = [
    param('id').isMongoId()
];

export const likePostValidation = [
    param('id').isMongoId()
];

export const commentPostValidation = [
    param('id').isMongoId(),
    body('comment').isString().isLength({ min: 1 })
];

export const deleteCommentValidation = [
    param('postId').isMongoId(),
    param('commentId').isMongoId()
];
