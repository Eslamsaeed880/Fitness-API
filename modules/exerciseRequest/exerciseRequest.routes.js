import express from 'express';
import isAuth from '../../middleware/isAuth.js';
import { createExerciseRequest } from './exerciseRequest.controller.js';
import { upload } from '../../middleware/multer.js';

const router = express.Router();

router.get('/', isAuth);

router.get('/:id', isAuth);

router.post('/', isAuth, upload.single('media'), createExerciseRequest);

router.delete('/:id', isAuth);

export default router;