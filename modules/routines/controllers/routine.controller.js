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