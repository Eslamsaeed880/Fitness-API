import { NotificationStrategy } from "./notification.strategy.js";

export class FollowNotificationStrategy extends NotificationStrategy {
    async send(userId, data) {
        
        return { type: 'follow', userId, message: `User ${data.followerName} started following you` };
    }
}