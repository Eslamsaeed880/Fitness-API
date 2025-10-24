import express from 'express';
import isAuth from '../middleware/isAuth.js';
import checkError from '../middleware/checkError.js';
import {
    createWorkoutValidation,
    updateWorkoutValidation,
    getWorkoutByIdValidation,
    deleteWorkoutValidation
} from '../validation/workoutValidation.js';
import { 
    getWorkouts, 
    createWorkout, 
    getWorkoutById,
    updateWorkout, 
    deleteWorkout 
} from '../controllers/workout.js';

const router = express.Router();

router.get('/', isAuth, getWorkouts);

router.post('/', isAuth, createWorkoutValidation, checkError, createWorkout);

router.get('/:id', isAuth, getWorkoutByIdValidation, checkError, getWorkoutById);

router.put('/:id', isAuth, updateWorkoutValidation, checkError, updateWorkout);

router.delete('/:id', isAuth, deleteWorkoutValidation, checkError, deleteWorkout);

export default router;