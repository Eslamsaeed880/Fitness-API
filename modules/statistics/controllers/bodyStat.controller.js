import BodyStatService from "../services/bodyStat.service.js";
import BodyStat from "../models/bodyStat.model.js";
import APIError from "../../../utils/APIError.js";
import APIResponse from "../../../utils/APIResponse.js";

const bodyStatService = new BodyStatService(BodyStat);

// @Desc: Get all body stats for the authenticated user
// @Route: GET /api/v1/body-stats
// @Access: Private
export const getBodyStatsForUser = async (req, res) => {
    try {
        const userId = req.user.id;
        const stats = await bodyStatService.getBodyStatsForUser(userId);
        return res.status(200).json(new APIResponse(200, stats, 'Body stats retrieved successfully'));
    } catch (err) {
        return res.status(err.statusCode || 500).json(new APIError(err.statusCode || 500, err.message || 'Failed to retrieve body stats'));
    }
}

// @Desc: Add a new body stat entry for the authenticated user
// @Route: POST /api/v1/body-stats
// @Access: Private
export const addBodyStat = async (req, res) => {
    try {
        const userId = req.user.id;
        const bodyStats = req.body; 
        await bodyStatService.addBodyStat(userId, bodyStats);
        return res.status(200).json(new APIResponse(200, {}, 'Body stat added successfully'));
    } catch (err) {
        return res.status(err.statusCode || 500).json(new APIError(err.statusCode || 500, err.message || 'Failed to add body stat'));
    }
}   

// @Desc: Delete a body stat entry for the authenticated user
// @Route: DELETE /api/v1/body-stats/:bodyStatId
// @Access: Private
export const deleteBodyStat = async (req, res) => {
    try {
        const userId = req.user.id;
        const bodyStatId = req.params.bodyStatId;
        const result = await bodyStatService.deleteBodyStat(userId, bodyStatId);
        if (!result.success) {
            return res.status(404).json(new APIResponse(404, null, 'Body stat not found'));
        }
        return res.status(200).json(new APIResponse(200, {}, 'Body stat deleted successfully'));
    } catch (err) {
        return res.status(err.statusCode || 500).json(new APIError(err.statusCode || 500, err.message || 'Failed to delete body stat'));
    }
}

// @Desc: Update a body stat entry for the authenticated user
// @Route: PUT /api/v1/body-stats/:bodyStatId
// @Access: Private
export const updateBodyStat = async (req, res) => {
    try {
        const userId = req.user.id;
        const bodyStatId = req.params.bodyStatId;
        const updates = req.body; 
        await bodyStatService.updateBodyStat(userId, bodyStatId, updates);
        return res.status(200).json(new APIResponse(200, {}, 'Body stat updated successfully'));
    } catch (err) {
        return res.status(err.statusCode || 500).json(new APIError(err.statusCode || 500, err.message || 'Failed to update body stat'));
    }
}

// @Desc: Get a specific body stat entry by ID for the authenticated user
// @Route: GET /api/v1/body-stats/:bodyStatId
// @Access: Private
export const getBodyStatById = async (req, res) => {
    try {
        const userId = req.user.id;
        const bodyStatId = req.params.bodyStatId;
        const stat = await bodyStatService.getBodyStatById(userId, bodyStatId);
        return res.status(200).json(new APIResponse(200, stat, 'Body stat retrieved successfully'));
    } catch (err) {
        return res.status(err.statusCode || 500).json(new APIError(err.statusCode || 500, err.message || 'Failed to retrieve body stat')); 
    }
}