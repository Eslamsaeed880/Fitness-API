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
}