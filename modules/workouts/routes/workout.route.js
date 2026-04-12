import express from 'express';
import isAuth from '../../../middleware/isAuth.js';
import { createWorkout, getWorkoutById, updateWorkout, deleteWorkout } from '../controllers/workout.controller.js';

const router = express.Router();

router.post('/', isAuth, createWorkout);

router.get('/:id', isAuth, getWorkoutById);

router.put('/:id', isAuth, updateWorkout);

router.delete('/:id', isAuth, deleteWorkout);

export default router;