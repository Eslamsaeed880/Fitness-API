import { Worker } from 'bullmq';
import { getBullmqConnection } from '../../../../../config/bullmq.connection.js';
import Notification from '../../models/notification.model.js';
import { getIO } from '../../../../../config/socket.js';
import redisClient from '../../../../infrastructure/cache/redis.js';

const connection = getBullmqConnection();
const DELIVERY_QUEUE_NAME = 'notification:delivery';

new Worker(DELIVERY_QUEUE_NAME, async (job) => {
    const { data } = job;
    const { recipient, event, payload } = data;

    if (!recipient) {
        console.warn('Delivery job without recipient', job.id);
        return;
    }

    try {
        const doc = new Notification({
            actorId: payload.actorId || payload.actor || null,
            userId: recipient,
            type: (payload.type || event || 'UNKNOWN').toUpperCase(),
            entityType: payload.entityType || payload.entity || 'USER',
            entityId: payload.entityId || payload.id || null
        });

        await doc.save();

        // increment unread counter
        try {
            await redisClient.incr(`notif:user:${recipient}:unread_count`);
        } catch (e) {
            console.error('Failed to increment unread counter', e.message);
        }

        // Emit via socket to recipient
        try {
            const io = getIO();
            io.to(`user:${recipient}`).emit('notification', {
                id: doc._id,
                actorId: doc.actorId,
                type: doc.type,
                entityType: doc.entityType,
                entityId: doc.entityId,
                createdAt: doc.createdAt
            });
        } catch (e) {
            console.error('Socket emit failed for notification delivery', e.message);
        }
    } catch (err) {
        console.error('Error persisting notification', err);
        throw err;
    }
}, { connection });

console.log('Notification delivery worker started');
