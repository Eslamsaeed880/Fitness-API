import express from 'express';
import isAuth from '../../../middleware/isAuth.js';
import { createWorkout, getWorkoutById } from '../controllers/workout.controller.js';

const router = express.Router();

router.post('/', isAuth, createWorkout);

router.get('/:id', isAuth, getWorkoutById);

export default router;