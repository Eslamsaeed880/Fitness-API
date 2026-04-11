import express from 'express';
import isAuth from '../../middleware/isAuth.js';
import { 
    createSplit,
    getSplitById,
    getAllSplits,
    deleteSplit,
    updateSplit
 } from './split.controller.js';
 
const router = express.Router();

router.get('/', isAuth, getAllSplits);

router.get('/:id', isAuth, getSplitById);

router.post('/', isAuth, createSplit);

router.put('/:id', isAuth, updateSplit);

router.delete('/:id', isAuth, deleteSplit);

export default router;