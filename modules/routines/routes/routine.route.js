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

router.post('/:id/like', isAuth, likeRoutine);

router.delete('/:id/like', isAuth, unlikeRoutine);

router.post('/:id/comments', isAuth, createComment);

router.delete('/:id/comments/:commentId', isAuth, deleteComment);

router.get('/:id/comments', isAuth, getCommentsByRoutineId);

export default router;