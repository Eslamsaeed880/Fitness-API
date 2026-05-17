import APIError from "../../../../utils/APIError.js";
import APIResponse from "../../../../utils/APIResponse.js";
import Comment from "../models/comment.model.js";
import CommentService from "../services/comment.service.js";
import RoutineService from "../../../routines/services/routine.service.js";
import WorkoutService from "../../../workouts/services/workout.service.js";
import Routine from "../../../routines/models/routine.model.js";
import Workout from "../../../workouts/models/workout.model.js";

const commentService = new CommentService(
    Comment, 
    null, 
    new RoutineService(Routine, null, null, null, null), 
    new WorkoutService(Workout, null, null, null, null)
);

export const createComment = async (req, res) => {
    try {
        const { entityType, entityId, content, parentId } = req.body;
        const userId = req.user.id;
        
        if (!entityType || !entityId || !content) {
            return res.status(400).json(new APIError(400, 'Missing required fields: entityType, entityId, content'));
        }

        const comment = await commentService.createComment(entityType, entityId, userId, content, parentId);
        res.status(201).json(new APIResponse(201, 'Comment created successfully', comment));

    } catch (err) {
        console.error('Error creating comment:', err);
        res.status(err.statusCode || 500).json(new APIError(err.statusCode || 500, err.message || 'Failed to create comment'));
    }
}