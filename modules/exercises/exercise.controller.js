import APIResponse from "../../utils/APIResponse.js";
import APIError from "../../utils/APIError.js";
import ExerciseService from "./exercise.service.js";
import Exercise from "./exercise.model.js";

const exerciseService = new ExerciseService(Exercise);

// @Desc: Get all exercises
// @Route: GET /api/v1/exercises?page=1&limit=10&search=keyword&sortBy=name&sortOrder=asc
// @Access: Public
export const getAllExercises = async (req, res) => {
    try {
        const { page = 1, limit = 10, search = '', sortBy = 'createdAt', sortOrder = 'desc' } = req.query;
        const exercisesData = await exerciseService.getAllExercises(parseInt(page), parseInt(limit), search, sortBy, sortOrder);

        res.status(200).json(new APIResponse(200, exercisesData, 'Exercises fetched successfully'));
    } catch (err) {
        console.error('Error fetching exercises:', err);
        res.status(500).json(new APIError(err.statusCode || 500, null, err.message || 'Failed to fetch exercises'));
    }
}

// @Desc: Get exercise by ID
// @Route: GET /api/v1/exercises/:id
// @Access: Public
export const getExerciseById = async (req, res) => {
    try {
        const exerciseId = req.params.id;
        const exercise = await exerciseService.getExerciseById(exerciseId);

        res.status(200).json(new APIResponse(200, { exercise }, 'Exercise fetched successfully'));
    } catch (err) {
        console.error('Error fetching exercise:', err);
        res.status(500).json(new APIError(err.statusCode || 500, null, err.message || 'Failed to fetch exercise'));
    }
}