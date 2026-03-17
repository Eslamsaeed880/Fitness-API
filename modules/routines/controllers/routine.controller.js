import RoutineService from "../services/routine.service.js";
import APIError from "../../../utils/APIError.js";
import APIResponse from "../../../utils/APIResponse.js";
import Routine from "../models/routine.model.js";
import RoutineExercise from "../models/routineExercise.model.js";
import ExerciseService from "../../exercises/exercise.service.js";
import RoutineExerciseSet from "../models/routineExerciseSet.model.js";
import Exercise from "../../exercises/exercise.model.js";

const routineService = new RoutineService(Routine, RoutineExercise, RoutineExerciseSet, new ExerciseService(Exercise));

// @Desc: Create a new routine
// @Route: POST /api/routines
// @Access: Private
export const createRoutine = async (req, res) => {
    try {
        const userId = req.user._id;
        const { name, description, isPublic, exercises } = req.body;
        console.log('Received routine creation request:', req.body.exercises);
        const routine = await routineService.createRoutine(userId, { name, description, isPublic }, exercises);

        res.status(201).json(new APIResponse(201, routine, 'Routine created successfully'));
    } catch (err) {
        console.error('Error creating routine:', err);
        res.status(err.statusCode || 500).json(new APIError(err.statusCode || 500, err.message || 'Failed to create routine'));
    }
}

// @Desc: Get routine by ID
// @Route: GET /api/routines/:id
// @Access: Private (only owner can access)
export const getRoutineById = async (req, res) => {
    try {
        const userId = req.user._id;
        const routineId = req.params.id;

        const routine = await routineService.getRoutineById(routineId, userId);

        if (!routine) {
            return res.status(404).json(new APIResponse(404, null, 'Routine not found'));
        }

        res.status(200).json(new APIResponse(200, routine, 'Routine fetched successfully'));
    } catch (err) {
        console.error('Error fetching routine:', err);
        res.status(err.statusCode || 500).json(new APIError(err.statusCode || 500, err.message || 'Failed to fetch routine'));
    }
}

// @Desc: Update routine details
// @Route: PUT /api/routines/:id
// @Access: Private (only owner can update)
export const updateRoutine = async (req, res) => {
    try {
        const userId = req.user._id;
        const routineId = req.params.id;
        const { name, description, isPublic } = req.body;

        const updatedRoutine = await routineService.updateRoutine(routineId, userId, { name, description, isPublic });

        res.status(200).json(new APIResponse(200, updatedRoutine, 'Routine updated successfully'));
    } catch (err) {
        console.error('Error updating routine:', err);
        res.status(err.statusCode || 500).json(new APIError(err.statusCode || 500, err.message || 'Failed to update routine'));
    }
}