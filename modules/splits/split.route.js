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

router.use(isAuth);

router.get('/', getAllSplits);

router.get('/:id', getSplitById);

router.post('/', createSplit);

router.put('/:id', updateSplit);

router.delete('/:id', deleteSplit);

export default router;