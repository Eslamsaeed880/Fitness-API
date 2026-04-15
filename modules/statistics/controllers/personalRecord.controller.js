import APIError from "../../../utils/APIError.js";
import APIResponse from "../../../utils/APIResponse.js";
import PersonalRecordService from "../services/personalRecord.service.js";
import PersonalRecord from "../models/personalRecord.model.js";

const personalRecordService = new PersonalRecordService(PersonalRecord);

// @Desc: Get all personal records for the authenticated user
// @Route: GET /api/v1/personal-records
// @Access: Private
export const getPersonalRecordsForUser = async (req, res) => {
    try {
        const userId = req.user.id;
        const records = await personalRecordService.getPersonalRecordsForUser(userId);
        return res.status(200).json(new APIResponse(200, records, 'Personal records retrieved successfully'));
    } catch (err) {
        return res.status(err.statusCode || 500).json(new APIError(err.statusCode || 500, err.message || 'Failed to retrieve personal records'));
    }
}

// @Desc: Add personal Record for a specific exercises
// @Route: POST /api/v1/personal-records
// @Access: Private
export const addPersonalRecord = async (req, res) => {
    try {
        const userId = req.user.id;
        const exercises = req.body.exercises; 
        await personalRecordService.addPersonalRecord(userId, exercises);
        return res.status(200).json(new APIResponse(200, {}, 'Personal records added/updated successfully'));
    } catch (err) {
        return res.status(err.statusCode || 500).json(new APIError(err.statusCode || 500, err.message || 'Failed to add personal records'));
    }
}

// @Desc: Get Personal Record for a specific exercise
// @Route: GET /api/v1/personal-records/exercise/:exerciseId
// @Access: Private
export const getPersonalRecordForExercise = async (req, res) => {
    try {
        const userId = req.user.id;
        const exerciseId = req.params.exerciseId;
        const record = await personalRecordService.getPersonalrecordForExercise(userId, exerciseId);
        if (!record) {
            return res.status(404).json(new APIResponse(404, null, 'No personal record found for this exercise'));
        }
        return res.status(200).json(new APIResponse(200, record, 'Personal record retrieved successfully'));
    } catch (err) {
        return res.status(err.statusCode || 500).json(new APIError(err.statusCode || 500, err.message || 'Failed to retrieve personal record for exercise'));
    }
}

// @Delete: Delete a personal record for a specific exercise
// @Route: DELETE /api/v1/personal-records/:personalRecordId
// @Access: Private
export const deletePersonalRecord = async (req, res) => {
    try {
        const userId = req.user.id;
        const personalRecordId = req.params.personalRecordId;
        const result = await personalRecordService.deletePersonalRecord(userId, personalRecordId);
        if (!result.success) {
            return res.status(404).json(new APIResponse(404, null, 'Personal record not found'));
        }
        return res.status(200).json(new APIResponse(200, {}, 'Personal record deleted successfully'));
    } catch (err) {
        return res.status(err.statusCode || 500).json(new APIError(err.statusCode || 500, err.message || 'Failed to delete personal record'));
    }
}

// @Update: Update a personal record for a specific exercise
// @Route: PUT /api/v1/personal-records/:personalRecordId
// @Access: Private
export const updatePersonalRecord = async (req, res) => {
    try {
        const userId = req.user.id;
        const personalRecordId = req.params.personalRecordId;
        const updates = req.body;

        await personalRecordService.updatePersonalRecord(userId, personalRecordId, updates);

        return res.status(200).json(new APIResponse(200, {}, 'Personal record updated successfully'));
    } catch (err) {
        return res.status(err.statusCode || 500).json(new APIError(err.statusCode || 500, err.message || 'Failed to update personal record'));
    } 
}