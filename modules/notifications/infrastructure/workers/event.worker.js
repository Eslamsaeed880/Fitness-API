import { Worker } from 'bullmq';
import queues from '../queues/notification.queues.js';
import { getBullmqConnection } from '../../../../../config/bullmq.connection.js';
import dedupService from '../../application/services/dedup.service.js';

const connection = getBullmqConnection();

const EVENT_QUEUE_NAME = 'notification:events';

new Worker(EVENT_QUEUE_NAME, async (job) => {
    const { name, data } = job;

    // Dedup check (if applicable)
    try {
        const isDup = await dedupService.checkAndSet({
            type: name,
            actorId: data?.actorId,
            entityId: data?.entityId || data?.entity || data?.id,
            targetUserId: data?.targetUserId || data?.userId
        });

        if (isDup) {
            return; // skip duplicate events
        }
    } catch (e) {
        console.error('Dedup check failed', e.message);
    }

    // Normalize payload for fanout
    const payload = {
        event: name || job.name,
        data
    };

    // Forward to fanout queue
    await queues.notificationFanoutQueue.add('fanout', payload);
}, { connection });

console.log('Notification event worker started');
