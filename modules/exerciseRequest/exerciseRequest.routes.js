import express from 'express';
import isAuth from '../../middleware/isAuth.js';
import { 
    createExerciseRequest,
    getExerciseRequestById,
    getMyExerciseRequests,
    deleteExerciseRequest,
    updateExerciseRequest
 } from './exerciseRequest.controller.js';

const router = express.Router();

router.get('/', isAuth, getMyExerciseRequests);

router.get('/:id', isAuth, getExerciseRequestById);

router.post('/', isAuth, createExerciseRequest);

router.put('/:id', isAuth, updateExerciseRequest);

router.delete('/:id', isAuth, deleteExerciseRequest);

export default router;