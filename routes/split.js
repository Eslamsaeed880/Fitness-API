import express from 'express';
import { 
    createSplit, 
    getSplits,
    getSplitById,
    updateSplit,
    deleteSplit
} from '../controllers/split.js';
import isAuth from '../middleware/isAuth.js';

const router = express.Router();

router.post('/', isAuth, createSplit);

router.get('/', isAuth, getSplits);

router.get('/:id', isAuth, getSplitById);

router.put('/:id', isAuth, updateSplit);

router.delete('/:id', isAuth, deleteSplit);

export default router;