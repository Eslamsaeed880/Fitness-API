import APIError from "../../../../utils/APIError.js";
import queue from "../../../notifications/infrastructure/queues/notification.queues.js";

export default class CommentService {
    constructor(CommentModel, PostService, RoutineService, WorkoutService) {
        this.Comment = CommentModel;
        this.postService = PostService;
        this.routineService = RoutineService;
        this.workoutService = WorkoutService;
    }

    async getOwnerId(entityType, entityId) {
        switch (entityType) {
            case 'POST':
                // Not implemented yet, but you would increment the comments count on the post here
                break;
            case 'ROUTINE':
                var [, ownerId] = await Promise.all([
                    this.routineService.incrementCommentsCount(entityId),
                    this.routineService.getUserIdByRoutineId(entityId) // Fetch routine to get ownerId for notification
                ]);

                if(!ownerId) {
                    throw new APIError(404, 'Routine not found.');
                }
                break;
            case 'WORKOUT':
                var [, ownerId] = await Promise.all([
                    this.workoutService.incrementCommentsCount(entityId),
                    this.workoutService.getUserIdByWorkoutId(entityId) // Fetch workout to get ownerId for notification
                ]);

                if(!ownerId) {
                    throw new APIError(404, 'Workout not found.');
                }

                break;
            default:
                throw new APIError(400, 'Invalid entity type for comment.');
        }

        return ownerId;
    }

    async createComment(entityType, entityId, userId, content, parentId = null) {
        const comment = new this.Comment({
            entityType,
            entityId,
            userId,
            content,
            parentId,
        });
        
        if (parentId) {
            // Check if parent exists and is not itself a reply BEFORE incrementing
            var parentComment = await this.Comment.findOne({
                _id: parentId,
                entityId,
                entityType
            });
            
            if (!parentComment) {
                throw new APIError(404, 'Parent comment not found.');
            }
            
            if (parentComment.parentId) {
                throw new APIError(400, 'Cannot reply to a reply. Only one level of nesting is allowed.');
            }
            
            // Now safe to increment after validation
            await this.Comment.findByIdAndUpdate(
                parentId,
                { $inc: { replies: 1 } }
            );
        };

        const ownerId = await this.getOwnerId(entityType, entityId);
        
        const [,,] = await Promise.all([
            queue.notificationsQueue.add('send-notification', {
                type: 'COMMENT',
                actorId: userId, // The user who made the comment
                userId: ownerId, // Notify the commenter themselves (for activity feed, etc.)
                entityType,
                entityId
            }),
            (parentId) &&
            queue.notificationsQueue.add('send-notification', {
                type: 'REPLY',
                actorId: userId, // The user who made the comment
                userId: parentComment.userId, // Notify the owner of the parent comment about the reply
                entityType: 'COMMENT',
                entityId: parentId
            }),
            comment.save()
        ]);

        return comment;
    }

    async getComments(entityId, entityType, page = 1, limit = 10) {
        const skip = (page - 1) * limit;

        const [comments, totalComments] = await Promise.all([
                this.Comment.find({ entityId, entityType, parentId: null })
                    .sort({ createdAt: -1 })
                    .skip(skip)
                    .limit(limit)
                    .populate('userId', 'username profilePicture'),
                this.Comment.countDocuments({ entityId, entityType, parentId: null })
        ]);

        const totalPages = Math.ceil(totalComments / limit);

        return {
            comments,
            pagination: {
                totalItems: totalComments,
                totalPages,
                currentPage: page,
                pageSize: limit
            }
        };
    }

    async getReplies(commentId, page = 1, limit = 10) {
        const skip = (page - 1) * limit;

        const [replies, totalReplies] = await Promise.all([
                this.Comment.find({ parentId: commentId })
                    .sort({ createdAt: -1 })
                    .skip(skip)
                    .limit(limit)
                    .populate('userId', 'username profilePicture'),
                this.Comment.countDocuments({ parentId: commentId })
        ]);

        const totalPages = Math.ceil(totalReplies / limit);

        return {
            replies,
            pagination: {
                totalItems: totalReplies,
                totalPages,
                currentPage: page,
                pageSize: limit
            }
        };
    }

    async deleteComment(commentId, userId) {
        const [comment, childrenComments, count] = await Promise.all([
            this.Comment.findById(commentId),
            this.Comment.deleteMany({ parentId: commentId }),
            this.Comment.countDocuments({ parentId: commentId }) + 1
        ]);

        if (!comment) {
            return { success: false, statusCode: 404, message: 'Comment not found.' };
        }

        const [,] = await Promise.all([
            comment.deleteOne(),
            (comment.parentId) &&
            this.Comment.findByIdAndUpdate(comment.parentId, { $inc: { replies: -1 } })
        ]);

        return { success: true, message: 'Comment deleted successfully.' };

    }

    async updateComment(commentId, userId, content) {
        const comment = await this.Comment.findById(commentId);

        if (!comment) {
            throw new APIError(404, 'Comment not found.');
        }

        if (comment.userId.toString() !== userId) {
            throw new APIError(403, 'You are not authorized to update this comment.');
        }

        comment.content = content;
        await comment.save();

        return comment;
    }
}