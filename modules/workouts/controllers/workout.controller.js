import APIError from "../../../utils/APIError.js";
import APIResponse from "../../../utils/APIResponse.js";
import WorkoutService from "../services/workout.service.js";
import Workout from "../models/workout.model.js";
import WorkoutExercise from "../models/workoutExercise.model.js";
import Set from "../models/set.model.js";
import RoutineService from "../../routines/services/routine.service.js";
import UserService from "../../users/user.service.js";
import ExerciseService from "../../exercises/exercise.service.js";
import Routine from "../../routines/models/routine.model.js";
import RoutineExercise from "../../routines/models/routineExercise.model.js";
import RoutineExerciseSet from "../../routines/models/routineExerciseSet.model.js";
import Exercise from "../../exercises/exercise.model.js";
import User from "../../users/user.model.js";

const workoutService = new WorkoutService(
    Workout, 
    WorkoutExercise, 
    Set, 
    new RoutineService(Routine, RoutineExercise, RoutineExerciseSet, new ExerciseService(Exercise), new UserService(User)),
    new UserService(User),
    new ExerciseService(Exercise),
);

// @Desc: Create a new workout
// @Route: POST /api/v1/workout
// @Access: Private
export const createWorkout = async (req, res, next) => {
    try {
        const { description, routineId, exercises } = req.body;
        const workout = await workoutService.createWorkout(req.user.id, description, routineId, exercises);
        return res.status(201).json(new APIResponse(201, workout, 'Workout created successfully'));
    } catch (err) {
        next(new APIError(err.statusCode || 500, err.message || 'Failed to create workout'));
    }
}

// @Desc: Get workout by ID
// @Route: GET /api/v1/workout/:id
// @Access: Private
export const getWorkoutById = async (req, res, next) => {
    try {
        const workoutId = req.params.id;
        const userId = req.user.id;
        const workout = await workoutService.getWorkoutById(workoutId, userId);
        if (!workout) {
            return next(new APIError(404, 'Workout not found'));
        }
        return res.status(200).json(new APIResponse(200, workout, 'Workout retrieved successfully'));
    } catch (err) {
        next(new APIError(err.statusCode || 500, err.message || 'Failed to retrieve workout'));
    }
}