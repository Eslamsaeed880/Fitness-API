import APIError from "../../../../utils/APIError.js";
import queue from "../../../notifications/infrastructure/queues/notification.queues.js";

export default class CommentService {
    constructor(CommentModel, PostService, RoutineService, WorkoutService) {
        this.Comment = CommentModel;
        this.postService = PostService;
        this.routineService = RoutineService;
        this.workoutService = WorkoutService;
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
            var parentComment = await this.Comment.findOneAndUpdate(
                { _id: parentId, entityId, entityType },
                { $inc: { replies: 1 } },
                { new: true }
            );

            if (!parentComment) {
                throw new APIError(404, 'Parent comment not found.');
            }
        };

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
}