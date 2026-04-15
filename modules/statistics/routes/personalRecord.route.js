import express from "express";
import isAuth from "../../../middleware/isAuth.js";
import {
    getPersonalRecordForExercise,
    deletePersonalRecord,
    updatePersonalRecord,
    getPersonalRecordsForUser,
    addPersonalRecord
} from "../controllers/personalRecord.controller.js";

const router = express.Router();

router.use(isAuth);

router.get('/', getPersonalRecordsForUser);

router.post('/', addPersonalRecord);

router.get('/exercise/:exerciseId', getPersonalRecordForExercise);

router.delete('/:personalRecordId', deletePersonalRecord);

router.put('/:personalRecordId', updatePersonalRecord);

export default router;