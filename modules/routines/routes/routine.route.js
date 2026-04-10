import express from 'express';
import isAuth from '../../../middleware/isAuth.js';
import { 
    createRoutine, 
    getRoutineById, 
    updateRoutine, 
    updateRoutineExercises, 
    deleteRoutine, 
    likeRoutine, 
    unlikeRoutine, 
    getLikedRoutines,
    createComment,
    deleteComment,
    getCommentsByRoutineId,
    getAllRoutines
} from '../controllers/routine.controller.js';

const router = express.Router();

router.get('/', getAllRoutines);

router.post('/', isAuth, createRoutine);

router.get('/liked', isAuth, getLikedRoutines);

router.get('/:id', isAuth, getRoutineById);

router.delete('/:id', isAuth, deleteRoutine);

router.put('/:id/exercises', isAuth, updateRoutineExercises);

router.put('/:id', isAuth, updateRoutine);

export default router;