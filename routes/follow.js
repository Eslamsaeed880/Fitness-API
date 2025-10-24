import express from 'express';
import { follow, unfollow, getFollowers, getFollowing } from '../controllers/follow.js';
import isAuth from '../middleware/isAuth.js';

const router = express.Router();

router.post('/follow', isAuth, follow);

router.delete('/unfollow', isAuth, unfollow);

router.get('/followers', isAuth, getFollowers);

router.get('/following', isAuth, getFollowing);

export default router;