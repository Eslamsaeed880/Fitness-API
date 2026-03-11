import express from 'express';
import { getAllUsers, getUserById } from './user.controller.js';

const router = express.Router();

router.get('/', getAllUsers);

router.get('/:id', getUserById);

// router.put('/:id', );

export default router;