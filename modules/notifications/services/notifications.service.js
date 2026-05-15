import { incrementCounter, decrementCounter, setCounter, getCounter } from '../../../infrastructure/cache/cache.js';
import APIError from '../../../utils/APIError.js';


class NotificationsService {
    constructor(NotificationModel) {
        this.Notification = NotificationModel;
    }

    async createNotification(data) {
        const doc = new this.Notification(data);
        return doc.save();
    }

    // Helper to format and return minimal notification DTO
    toDTO(notificationDoc) {
        return {
            id: notificationDoc._id,
            actorId: notificationDoc.actorId,
            userId: notificationDoc.userId,
            type: notificationDoc.type,
            entityType: notificationDoc.entityType,
            entityId: notificationDoc.entityId,
            isRead: notificationDoc.isRead,
            createdAt: notificationDoc.createdAt
        };
    }

    async listNotifications(userId, { page = 1, limit = 20 } = {}) {
        const skip = (page - 1) * limit;
        const [items, total] = await Promise.all([
            this.Notification.find({ userId }).sort({ createdAt: -1 }).skip(skip).limit(limit),
            this.Notification.countDocuments({ userId })
        ]);
        return { items, total, page, limit };
    }

    async markAsRead(userId, id) {
        const notif = await this.Notification.findOne({ _id: id, userId });
        if (!notif) {
            throw new APIError(404, 'Notification not found.');
        }

        if (!notif.isRead) {
            notif.isRead = true;
            await notif.save();
            try {
                await decrementCounter(`notif:user:${userId}:unread_count`);
            } catch (e) {
                console.error('Failed to decrement unread counter', e.message);
            }
        }
        return notif;
    }

    async markAllRead(userId) {
        await this.Notification.updateMany({ userId, isRead: false }, { $set: { isRead: true } });

        try {
            await setCounter(`notif:user:${userId}:unread_count`, 0);
        } catch (e) {
            console.error('Failed to reset unread counter', e.message);
        }
        return true;
    }

    async getUnreadCount(userId) {
        try {
            return await getCounter(`notif:user:${userId}:unread_count`);
        } catch (e) {
            console.error('Failed to get unread counter', e.message);
            return this.Notification.countDocuments({ userId, isRead: false });
        }
    }
}

export default NotificationsService;
