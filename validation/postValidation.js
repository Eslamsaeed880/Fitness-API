import { body, param } from 'express-validator';
import Post from '../models/post.js';
import Like from '../models/like.js';

export const createPostValidation = [
    body('title')
        .isString()
        .isLength({ min: 2, max: 100 }),
    body('content')
        .isString()
        .isLength({ min: 2 }),
];

export const getPostByIdValidation = [
    param('id')
        .isMongoId()
        .custom(async (value, { req }) => {
            const post = await Post.findById(value);
            if (!post) {
                throw new Error('Post not found');
            }
            return true;
        })
];

export const updatePostValidation = [
    param('id')
        .isMongoId(),
    body('title')
        .optional()
        .isString()
        .isLength({ min: 2, max: 100 }),
    body('content')
        .optional()
        .isString()
        .isLength({ min: 2 }),
];

export const deletePostValidation = [
    param('id')
        .isMongoId()
        .custom(async (value, { req }) => {
            const postId = value;
            const post = await Post.findById(postId);
            const userId = req.user.id;
            if (!post) {
                throw new Error('Post not found');
            }
            if (post.userId.toString() !== userId) {
                throw new Error('You are not authorized to delete this post');
            }
        })
];

export const likePostValidation = [
    param('id')
        .isMongoId()
        .custom(async (value, { req }) => {
            const userId = req.user.id;
            const postId = value;
            const likedPost = await Like.findOne({ userId, postId });
            if (likedPost) {
                throw new Error('You have already liked this post');
            }
            return true;
        })
];

export const unlikePostValidation = [
    param('id')
        .isMongoId()
        .custom(async (value, { req }) => {
            const userId = req.user.id;
            const postId = value;
            const likedPost = await Like.findOne({ userId, postId });
            if (!likedPost) {
                throw new Error('You have not liked this post yet');
            }
            return true;
        })
];

export const commentPostValidation = [
    param('id')
        .isMongoId(),
    body('comment')
        .isString()
        .isLength({ min: 1 })
];

export const deleteCommentValidation = [
    param('postId')
        .isMongoId(),
    param('commentId')
        .isMongoId()
];
