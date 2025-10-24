import express from 'express';
import { follow, unfollow, getFollowers, getFollowing } from '../controllers/follow.js';
import { followValidation, unfollowValidation } from '../validation/followValidation.js';
import checkError from '../middleware/checkError.js';
import isAuth from '../middleware/isAuth.js';

const router = express.Router();

router.post('/follow', isAuth, followValidation, checkError, follow);

router.delete('/unfollow', isAuth, unfollowValidation, checkError, unfollow);

router.get('/followers', isAuth, getFollowers);

router.get('/following', isAuth, getFollowing);

export default router;