import express from 'express';
import { 
    createWorkoutSession, 
    getWorkoutSessions, 
    getWorkoutSessionById,
    updateWorkoutSession,
    updateStatus,
    getPersonalRecords
} from '../controllers/workoutSession.js';
import isAuth from '../middleware/isAuth.js';

const router = express.Router();

router.post('/', isAuth, createWorkoutSession);

router.get('/', isAuth, getWorkoutSessions);

router.get('/personal-records', isAuth, getPersonalRecords);

router.get('/:id', isAuth, getWorkoutSessionById);

router.put('/:id', isAuth, updateWorkoutSession);

router.patch('/:id', isAuth, updateStatus);

export default router;