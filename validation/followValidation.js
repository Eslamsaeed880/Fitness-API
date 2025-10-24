import { body } from 'express-validator';
import Follow from '../models/follow.js';

export const followValidation = [
	body('followingId')
		.exists()
        .withMessage('followingId is required')
		.isMongoId()
        .withMessage('followingId must be a valid Mongo ID')
        .custom(async (value, { req }) => {
            if (value === req.user.id) {
                throw new Error('You cannot follow yourself');
            }
            return true;
        })
        .custom(async (value, { req }) => {
            const follower = await Follow.findOne({ followerId: req.user.id, followingId: value })
            if (follower) {
                throw new Error('You are already following this user');
            }
            return true;
        })
];

export const unfollowValidation = [
	body('followingId')
		.exists()
        .withMessage('followingId is required')
		.isMongoId()
        .withMessage('followingId must be a valid Mongo ID')
        .custom(async (value, { req }) => {
            const follower = await Follow.findOne({ followerId: req.user.id, followingId: value })
            if (!follower) {
                throw new Error('You are not following this user');
            }
            return true;
        })
];
