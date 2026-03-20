import { NotificationStrategy } from "./notification.strategy.js";

export class CommentNotificationStrategy extends NotificationStrategy {
    async send(userId, data) {
        
        return { type: 'comment', userId, message: `User ${data.commenterName} commented on your ${data.model} "${data.title}": "${data.commentText}"` };
    }
}