import SplitService from "./split.service.js";
import APIError from "../../utils/APIError.js";
import APIResponse from "../../utils/APIResponse.js";
import Split from "./split.model.js";

const splitService = new SplitService(Split);

// @Desc: Get all splits with pagination, search, and sorting
// @Route: GET /api/splits
// @Access: Public
export const getAllSplits = async (req, res) => {
    try {
        const { page = 1, limit = 10, search = '', sortBy = 'createdAt', sortOrder = 'desc' } = req.query;
        const userId = req.user.id; 
        const splitsData = await splitService.getAllSplits(userId, parseInt(page), parseInt(limit), search, sortBy, sortOrder);
        res.status(200).json(new APIResponse(200, splitsData, 'Splits retrieved successfully'));
    } catch (err) {
        console.error('Error fetching splits:', err);
        res.status(err.statusCode || 500).json(new APIError(err.statusCode || 500, err.message || 'Failed to fetch splits'));
    }
}

// @Desc: Get a single split by ID
// @Route: GET /api/splits/:id
// @Access: Public
export const getSplitById = async (req, res) => {
    try {
        const splitId = req.params.id;
        const userId = req.user.id;
        const split = await splitService.getSplitById(userId, splitId);
        res.status(200).json(new APIResponse(200, split, 'Split retrieved successfully'));
    } catch (err) {
        console.error('Error fetching split:', err);
        res.status(err.statusCode || 500).json(new APIError(err.statusCode || 500, err.message || 'Failed to fetch split'));
    }
}

// @Desc: Create a new split
// @Route: POST /api/splits
// @Access: Private
export const createSplit = async (req, res) => {
    try {
        const userId = req.user.id;
        const splitData = { ...req.body };
        const newSplit = await splitService.createSplit(userId, splitData);
        res.status(201).json(new APIResponse(201, newSplit, 'Split created successfully'));
    } catch (err) {
        console.error('Error creating split:', err);
        res.status(err.statusCode || 500).json(new APIError(err.statusCode || 500, err.message || 'Failed to create split'));
    }
}

// @Desc: Update an existing split
// @Route: PUT /api/splits/:id
// @Access: Private
export const updateSplit = async (req, res) => {
    try {
        const splitId = req.params.id;
        const userId = req.user.id;
        const splitData = { ...req.body };
        const updatedSplit = await splitService.updateSplit(userId, splitId, splitData);
        res.status(200).json(new APIResponse(200, updatedSplit, 'Split updated successfully'));
    } catch (err) {
        console.error('Error updating split:', err);
        res.status(err.statusCode || 500).json(new APIError(err.statusCode || 500, err.message || 'Failed to update split'));
    }
}

// @Desc: Delete a split
// @Route: DELETE /api/splits/:id
// @Access: Private
export const deleteSplit = async (req, res) => {
    try {
        const splitId = req.params.id;
        const userId = req.user.id;
        await splitService.deleteSplit(userId, splitId);
        res.status(200).json(new APIResponse(200, {}, 'Split deleted successfully'));
    } catch (err) {
        console.error('Error deleting split:', err);
        res.status(err.statusCode || 500).json(new APIError(err.statusCode || 500, err.message || 'Failed to delete split'));
    }
}