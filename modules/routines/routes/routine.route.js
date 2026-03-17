import express from 'express';
import isAuth from '../../../middleware/isAuth.js';
import { createRoutine } from '../controllers/routine.controller.js';

const router = express.Router();

router.post('/', isAuth, createRoutine);

export default router;