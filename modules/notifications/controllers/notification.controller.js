import Notification from '../models/notification.model.js';
import NotificationsService from '../services/notifications.service.js';
import APIError from '../../../utils/APIError.js';
import APIResponse from '../../../utils/APIResponse.js';

const notificationService = new NotificationsService(Notification);

export const getNotifications = async (req, res) => {
    try {
        const userId = req.user.id;
        const page = parseInt(req.query.page, 10) || 1;
        const limit = Math.min(parseInt(req.query.limit, 10) || 20, 100);

        const result = await notificationService.listNotifications(userId, { page, limit });
        const unread = await notificationService.getUnreadCount(userId);

        const notifications = result.items.map((notification) => notificationService.toDTO(notification));

        return res.status(200).json(
            new APIResponse(200, { notifications, total: result.total, page: result.page, limit: result.limit, unread }, 'Notifications retrieved successfully.')
        );
    } catch (err) {
        console.error('Error fetching notifications:', err);
        const status = err.statusCode || 500;
        return res.status(status).json(new APIError(status, err.message || 'Failed to fetch notifications.'));
    }
};

export const markAsRead = async (req, res) => {
    try {
        const userId = req.user.id;
        const id = req.params.id;

        const notification = await notificationService.markAsRead(userId, id);
        if (!notification) {
            return res.status(404).json(new APIError(404, 'Notification not found.'));
        }

        return res.status(200).json(
            new APIResponse(200, { notification: notificationService.toDTO(notification) }, 'Notification marked as read successfully.')
        );
    } catch (err) {
        console.error('Error marking notification as read:', err);
        const status = err.statusCode || 500;
        return res.status(status).json(new APIError(status, err.message || 'Failed to mark notification as read.'));
    }
};

export const markAllRead = async (req, res) => {
    try {
        const userId = req.user.id;
        await notificationService.markAllRead(userId);

        return res.status(200).json(new APIResponse(200, {}, 'All notifications marked as read successfully.'));
    } catch (err) {
        console.error('Error marking all notifications as read:', err);
        const status = err.statusCode || 500;
        return res.status(status).json(new APIError(status, err.message || 'Failed to mark notifications as read.'));
    }
};
