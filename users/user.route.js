import express from 'express';
import { getAllUsers } from './user.controller.js';

const router = express.Router();

router.get('/', getAllUsers);

// router.get('/:id', );

// router.put('/:id', );

export default router;