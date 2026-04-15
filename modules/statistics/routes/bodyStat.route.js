import express from 'express';
import isAuth from '../../../middleware/isAuth.js';
import {
    getBodyStatsForUser,
    addBodyStat,
    deleteBodyStat,
    updateBodyStat,
    getBodyStatById
} from '../controllers/bodyStat.controller.js';

const router = express.Router();

router.use(isAuth);

router.get('/', getBodyStatsForUser);

router.get('/:bodyStatId', getBodyStatById);

router.post('/', addBodyStat);

router.delete('/:bodyStatId', deleteBodyStat);

router.put('/:bodyStatId', updateBodyStat);

export default router;