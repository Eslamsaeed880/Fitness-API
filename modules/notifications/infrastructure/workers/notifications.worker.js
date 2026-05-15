import 'dotenv/config';
import { Worker } from 'bullmq';
import connectDB from '../../../../config/mongodb.js';
import { getBullmqConnection } from '../../../../config/bullmq.connection.js';
import { incrementCounter } from '../../../../infrastructure/cache/cache.js';
import dedupService from '../../services/dedup.service.js';
import Notification from '../../models/notification.model.js';
import { emitToUser } from '../socket/notification.gateway.js';

await connectDB();

const connection = getBullmqConnection();
const NOTIFICATIONS_QUEUE_NAME = 'notifications';

new Worker(NOTIFICATIONS_QUEUE_NAME, async (job) => {
    const { type, actorId, userId, entityType, entityId } = job.data;

    if (!userId) {
        console.warn('Notification job missing userId', job.id);
        return;
    }

    // Dedup check (same user shouldn't get duplicate notifications)
    try {
        const isDup = await dedupService.checkAndSet({
            type,
            actorId,
            entityId,
            targetUserId: userId
        });

        if (isDup) {
            console.log(`Duplicate notification skipped: ${type} from ${actorId} to ${userId}`);
            return;
        }
    } catch (e) {
        console.error('Dedup check failed', e.message);
    }

    // Save notification to DB
    try {
        const notification = new Notification({
            type: type || 'NOTIFICATION',
            actorId,
            userId,
            entityType,
            entityId,
            isRead: false
        });

        const savedNotification = await notification.save();

        // Increment unread counter in Redis
        await incrementCounter(`notif:user:${userId}:unread_count`);

        // Emit to user via Socket.IO
        emitToUser(userId, 'notification', {
            id: savedNotification._id,
            type: savedNotification.type,
            actorId: savedNotification.actorId,
            entityType: savedNotification.entityType,
            entityId: savedNotification.entityId,
            createdAt: savedNotification.createdAt,
            isRead: false
        });

        console.log(`Notification sent: ${type} to user ${userId}`);
    } catch (err) {
        console.error('Error processing notification job', err);
        throw err;
    }
}, { connection });

console.log('Notifications worker started');

export default {};
