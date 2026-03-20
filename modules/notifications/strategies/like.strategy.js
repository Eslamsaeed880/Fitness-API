import { NotificationStrategy } from "./notification.strategy.js";

export class LikeNotificationStrategy extends NotificationStrategy {
    async send(userId, data) {
        return { type: 'like', userId, message: `User ${data.likerName} liked your ${data.model} "${data.title}"` };
    }
}