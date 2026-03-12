import express from 'express';
import { getAllUsers, getUserById, updateProfilePicture } from './user.controller.js';
import isAuth from '../middleware/isAuth.js';
import { upload } from '../middleware/multer.js';

const router = express.Router();

router.get('/', getAllUsers);

router.get('/:id', getUserById);

router.patch('/:id/profile-picture', isAuth, upload.single('profilePicture'), updateProfilePicture);

router.patch('/:id/cover', isAuth, upload.single('cover'), )

export default router;