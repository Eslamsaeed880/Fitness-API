import express from 'express';
import isAuth from '../../../middleware/isAuth.js';
import { 
    createRoutine, 
    getRoutineById, 
    updateRoutine, 
    updateRoutineExercises, 
    deleteRoutine, 
    likeRoutine, 
    unlikeRoutine 
} from '../controllers/routine.controller.js';

const router = express.Router();

router.post('/', isAuth, createRoutine);

router.get('/:id', isAuth, getRoutineById);

router.delete('/:id', isAuth, deleteRoutine);

router.put('/:id/exercises', isAuth, updateRoutineExercises);

router.put('/:id', isAuth, updateRoutine);

router.post('/:id/like', isAuth, likeRoutine);

router.delete('/:id/like', isAuth, unlikeRoutine);

export default router;