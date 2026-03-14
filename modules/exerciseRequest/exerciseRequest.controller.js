import APIError from "../../utils/APIError.js";
import APIResponse from "../../utils/APIResponse.js";
import ExerciseRequest from "./exerciseRequest.model.js";
import ExerciseRequestService from "./exerciseRequest.service.js";
import ExerciseService from "../exercises/exercise.service.js";
import MuscleService from "../muscles/muscle.service.js";
import MediaService from "../../infrastructure/media/media.service.js";
import Exercise from "../exercises/exercise.model.js";
import Muscle from "../muscles/muscle.model.js";

const exercieseRequestService = new ExerciseRequestService(
    ExerciseRequest, 
    new ExerciseService(Exercise, new MuscleService(), new MediaService()), 
    new MediaService(), 
    new MuscleService(Muscle)
);

// @Desc: Create a new exercise request
// @Route: POST /api/exercise-requests
// @Access: Private
export const createExerciseRequest = async (req, res) => {
    try {
        const { name, description, primaryMuscle, secondaryMuscle, equipments, movementType } = req.body;
        const userId = req.user._id;

        console.log('Received exercise request data:', req.body);
        console.log('Received file:', req.file);

        const exerciseRequest = await exercieseRequestService.createExerciseRequest({
            name,
            description,
            primaryMuscle,
            secondaryMuscle,
            equipments,
            movementType,
            createdBy: userId
        },
            req.file
        );

        res.status(201).json(new APIResponse(201, 'Exercise request created successfully', exerciseRequest));
    } catch (err) {
        console.error('Error creating exercise request:', err);
        res.status(err.statusCode || 500).json(new APIError(err.statusCode || 500, err.message || 'Failed to create exercise request'));
    }
}