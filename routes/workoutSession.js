import express from 'express';
import { 
    createWorkoutSession, 
    getWorkoutSessions, 
    getWorkoutSessionById,
    updateWorkoutSession
} from '../controllers/workoutSession.js';
import isAuth from '../middleware/isAuth.js';

const router = express.Router();

router.post('/', isAuth, createWorkoutSession);

router.get('/', isAuth, getWorkoutSessions);

router.get('/:id', isAuth, getWorkoutSessionById);

router.put('/:id', isAuth, updateWorkoutSession);

export default router;