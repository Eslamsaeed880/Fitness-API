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

// @Desc: Create a new comment on a post, routine, or workout
// @Route: POST /api/v1/comments
// @Access: Private
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

// @Desc: Get comments for a specific post, routine, or workout
// @Route: GET /api/v1/comments/:entityId?entityType=POST&page=1&limit=10
// @Access: Public
export const getComments = async (req, res) => {
    try {
        const { entityId } = req.params;
        const { entityType, page = 1, limit = 10 } = req.query;

        if (!entityId || !entityType) {
            return res.status(400).json(new APIError(400, 'Missing required parameters: entityId, entityType'));
        }

        const comments = await commentService.getComments(entityId, entityType, page, limit);
        res.status(200).json(new APIResponse(200, 'Comments retrieved successfully', comments));
    } catch (err) {
        console.error('Error retrieving comments:', err);
        res.status(err.statusCode || 500).json(new APIError(err.statusCode || 500, err.message || 'Failed to retrieve comments'));
    }
}

// @Desc: Delete a comment
// @Route: DELETE /api/v1/comments/:commentId
// @Access: Private (only comment owner or admin)
export const deleteComment = async (req, res) => {
    try {
        const { commentId } = req.params;
        const userId = req.user.id;

        if (!commentId) {
            return res.status(400).json(new APIError(400, 'Missing required parameter: commentId'));
        }

        const result = await commentService.deleteComment(commentId, userId);
        if (!result.success) {
            return res.status(result.statusCode).json(new APIError(result.statusCode, result.message));
        }

        res.status(200).json(new APIResponse(200, 'Comment deleted successfully'));
    } catch (err) {
        console.error('Error deleting comment:', err);
        res.status(err.statusCode || 500).json(new APIError(err.statusCode || 500, err.message || 'Failed to delete comment'));
    }
}

// @Desc: Update a comment
// @Route: PUT /api/v1/comments/:commentId
// @Access: Private (only comment owner)
export const updateComment = async (req, res) => {
    try {
        const { commentId } = req.params;
        const { content } = req.body;
        const userId = req.user.id;

        if (!commentId || !content) {
            return res.status(400).json(new APIError(400, 'Missing required parameters: commentId, content'));
        }

        const comment = await commentService.updateComment(commentId, userId, content);
        res.status(200).json(new APIResponse(200, 'Comment updated successfully', comment));
    } catch (err) {
        console.error('Error updating comment:', err);
        res.status(err.statusCode || 500).json(new APIError(err.statusCode || 500, err.message || 'Failed to update comment'));
    }
}

// @Desc: Get replies for a specific comment
// @Route: GET /api/v1/comments/:commentId/replies?page=1&limit=10
// @Access: Public
export const getReplies = async (req, res) => {
    try {
        const { commentId } = req.params;
        const { page = 1, limit = 10 } = req.query;

        if (!commentId) {
            return res.status(400).json(new APIError(400, 'Missing required parameter: commentId'));
        }

        const replies = await commentService.getReplies(commentId, page, limit);
        res.status(200).json(new APIResponse(200, 'Replies retrieved successfully', replies));
    } catch (err) {
        console.error('Error retrieving replies:', err);
        res.status(err.statusCode || 500).json(new APIError(err.statusCode || 500, err.message || 'Failed to retrieve replies'));
    }
}