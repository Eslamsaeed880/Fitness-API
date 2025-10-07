import express from 'express';
import isAuth from '../middleware/isAuth.js';
import { 
    getWorkouts, 
    createWorkout, 
    getWorkoutById,
    updateWorkout, 
    deleteWorkout 
} from '../controllers/workoutController.js';

const router = express.Router();

router.get('/', isAuth, getWorkouts);

router.post('/', isAuth, createWorkout);

router.get('/:id', isAuth, getWorkoutById);

router.put('/:id', isAuth, updateWorkout);

router.delete('/:id', isAuth, deleteWorkout);
