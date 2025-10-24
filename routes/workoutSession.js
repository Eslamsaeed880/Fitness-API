import express from 'express';
import checkError from '../middleware/checkError.js';
import {
    createWorkoutSessionValidation,
    updateWorkoutSessionValidation,
    updateStatusValidation,
    getWorkoutSessionByIdValidation
} from '../validation/workoutSessionValidation.js';
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

router.post('/', isAuth, createWorkoutSessionValidation, checkError, createWorkoutSession);

router.get('/', isAuth, getWorkoutSessions);

router.get('/personal-records', isAuth, getPersonalRecords);

router.get('/:id', isAuth, getWorkoutSessionByIdValidation, checkError, getWorkoutSessionById);

router.put('/:id', isAuth, updateWorkoutSessionValidation, checkError, updateWorkoutSession);

router.patch('/:id', isAuth, updateStatusValidation, checkError, updateStatus);

export default router;