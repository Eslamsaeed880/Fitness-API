import express from 'express';
import isAuth from '../../../middleware/isAuth.js';
import { createWorkout } from '../controllers/workout.controller.js';

const router = express.Router();

router.post('/', isAuth, createWorkout);

export default router;