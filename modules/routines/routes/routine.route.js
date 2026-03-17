import express from 'express';
import isAuth from '../../../middleware/isAuth.js';
import { createRoutine, getRoutineById } from '../controllers/routine.controller.js';

const router = express.Router();

router.post('/', isAuth, createRoutine);

router.get('/:id', isAuth, getRoutineById);

export default router;