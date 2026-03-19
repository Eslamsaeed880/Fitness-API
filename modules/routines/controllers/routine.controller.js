import RoutineService from "../services/routine.service.js";
import APIError from "../../../utils/APIError.js";
import APIResponse from "../../../utils/APIResponse.js";
import Routine from "../models/routine.model.js";
import RoutineExercise from "../models/routineExercise.model.js";
import ExerciseService from "../../exercises/exercise.service.js";
import RoutineExerciseSet from "../models/routineExerciseSet.model.js";
import Exercise from "../../exercises/exercise.model.js";
import UserService from "../../users/user.service.js";
import User from "../../users/user.model.js";

const routineService = new RoutineService(Routine, RoutineExercise, RoutineExerciseSet, new ExerciseService(Exercise), new UserService(User));

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

// @Desc: Update routine exercises and sets
// @Route: PUT /api/routines/:id/exercises
// @Access: Private (only owner can update)
export const updateRoutineExercises = async (req, res) => {
    try {
        const userId = req.user._id;
        const routineId = req.params.id;
        const exercisesData = req.body.exercises;

        console.log('Received routine exercises update request:', exercisesData);

        const updatedRoutine = await routineService.updateRoutineExercises(routineId, userId, exercisesData);

        res.status(200).json(new APIResponse(200, updatedRoutine, 'Routine exercises updated successfully'));
    } catch (err) {
        console.error('Error updating routine exercises:', err);
        res.status(err.statusCode || 500).json(new APIError(err.statusCode || 500, err.message || 'Failed to update routine exercises'));
    }
}

// @Desc: Delete a routine
// @Route: DELETE /api/routines/:id
// @Access: Private (only owner can delete)
export const deleteRoutine = async (req, res) => {
    try {
        const userId = req.user._id;
        const routineId = req.params.id;

        await routineService.deleteRoutine(routineId, userId);

        res.status(200).json(new APIResponse(200, {}, 'Routine deleted successfully'));
    } catch (err) {
        console.error('Error deleting routine:', err);
        res.status(err.statusCode || 500).json(new APIError(err.statusCode || 500, err.message || 'Failed to delete routine'));
    }
}

// @Desc: Like a routine
// @Route: POST /api/routines/:id/like
// @Access: Private
export const likeRoutine = async (req, res) => {
    try {
        const userId = req.user._id;
        const routineId = req.params.id;

        const result = await routineService.likeRoutine(routineId, userId);

        res.status(200).json(new APIResponse(200, result, 'Routine liked successfully'));
    } catch (err) {
        console.error('Error liking routine:', err);
        res.status(err.statusCode || 500).json(new APIError(err.statusCode || 500, err.message || 'Failed to like routine'));
    }
}

// @Desc: Unlike a routine
// @Route: DELETE /api/routines/:id/like
// @Access: Private
export const unlikeRoutine = async (req, res) => {
    try {
        const userId = req.user._id;
        const routineId = req.params.id;

        const result = await routineService.unlikeRoutine(routineId, userId);

        res.status(200).json(new APIResponse(200, result, 'Routine unliked successfully'));
    } catch (err) {
        console.error('Error unliking routine:', err);
        res.status(err.statusCode || 500).json(new APIError(err.statusCode || 500, err.message || 'Failed to unlike routine'));
    }
}

// @Desc: Get all liked routines for the authenticated user
// @Route: GET /api/routines/liked
// @Access: Private
export const getLikedRoutines = async (req, res) => {
    try {
        const userId = req.user._id;

        const likedRoutines = await routineService.getLikedRoutinesByUser(userId);

        res.status(200).json(new APIResponse(200, likedRoutines, 'Liked routines fetched successfully'));
    } catch (err) {
        console.error('Error fetching liked routines:', err);
        res.status(err.statusCode || 500).json(new APIError(err.statusCode || 500, err.message || 'Failed to fetch liked routines'));
    }
}

// @Desc: Create a comment on a routine
// @Route: POST /api/routines/:id/comment
// @Access: Private
export const createComment = async (req, res) => {
    try {
        const userId = req.user._id;
        const routineId = req.params.id;
        const { comment } = req.body;

        const newComment = await routineService.createComment(routineId, userId, comment);

        res.status(201).json(new APIResponse(201, newComment, 'Comment added successfully'));
    } catch (err) {
        console.error('Error adding comment:', err);
        res.status(err.statusCode || 500).json(new APIError(err.statusCode || 500, err.message || 'Failed to add comment'));
    }
}

// @Desc: Delete a comment from a routine
// @Route: DELETE /api/routines/:id/comment/:commentId
// @Access: Private (only comment owner can delete)
export const deleteComment = async (req, res) => {
    try {
        const userId = req.user._id;
        const routineId = req.params.id;
        const commentId = req.params.commentId;

        await routineService.deleteComment(routineId, commentId, userId);

        res.status(200).json(new APIResponse(200, {}, 'Comment deleted successfully'));
    } catch (err) {
        console.error('Error deleting comment:', err);
        res.status(err.statusCode || 500).json(new APIError(err.statusCode || 500, err.message || 'Failed to delete comment'));
    }
}