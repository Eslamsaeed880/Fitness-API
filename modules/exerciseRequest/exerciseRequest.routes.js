import express from 'express';
import isAuth from '../../middleware/isAuth.js';
import { 
    createExerciseRequest,
    getExerciseRequestById,
    getMyExerciseRequests
 } from './exerciseRequest.controller.js';
import { upload } from '../../middleware/multer.js';

const router = express.Router();

router.get('/', isAuth, getMyExerciseRequests);

router.get('/:id', isAuth, getExerciseRequestById);

router.post('/', isAuth, upload.single('media'), createExerciseRequest);

router.delete('/:id', isAuth);

export default router;