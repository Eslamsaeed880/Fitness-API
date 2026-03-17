import express from 'express';
import isAuth from '../../../middleware/isAuth.js';
import { createRoutine, getRoutineById, updateRoutine } from '../controllers/routine.controller.js';

const router = express.Router();

router.post('/', isAuth, createRoutine);

router.get('/:id', isAuth, getRoutineById);

router.put('/:id', isAuth, updateRoutine);

export default router;