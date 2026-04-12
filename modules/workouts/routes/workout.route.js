import express from 'express';
import isAuth from '../../../middleware/isAuth.js';
import { 
    createWorkout, 
    getWorkoutById, 
    updateWorkout, 
    deleteWorkout, 
    completeWorkout, 
    getWorkoutSummary, 
    getWorkoutsByUser, 
    getWorkoutsByRoutine 
} from '../controllers/workout.controller.js';    

const router = express.Router();

router.post('/', isAuth, createWorkout);

router.get('/:id', isAuth, getWorkoutById);

router.put('/:id', isAuth, updateWorkout);

router.delete('/:id', isAuth, deleteWorkout);

router.patch('/:id', isAuth, completeWorkout);

router.get('/:id/summary', isAuth, getWorkoutSummary);

router.get('/user/:id', isAuth, getWorkoutsByUser);

router.get('/routine/:id', isAuth, getWorkoutsByRoutine);

export default router;