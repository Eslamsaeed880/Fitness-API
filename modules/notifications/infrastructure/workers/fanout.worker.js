import { Worker } from 'bullmq';
import queues from '../queues/notification.queues.js';
import { getBullmqConnection } from '../../../../../config/bullmq.connection.js';

const connection = getBullmqConnection();

const FANOUT_QUEUE_NAME = 'notification:fanout';

new Worker(FANOUT_QUEUE_NAME, async (job) => {
    const { data } = job;
    const { event, data: payload } = data;

    // If explicit recipients provided, fan out to each
    if (payload && Array.isArray(payload.recipients) && payload.recipients.length) {
        for (const recipient of payload.recipients) {
            await queues.notificationDeliveryQueue.add('deliver', {
                recipient,
                event,
                payload
            });
        }
        return;
    }

    // If single userId provided, deliver to that user
    if (payload && payload.userId) {
        await queues.notificationDeliveryQueue.add('deliver', {
            recipient: payload.userId,
            event,
            payload
        });
        return;
    }

    // Fallback: if job contains a top-level userId
    if (data && data.userId) {
        await queues.notificationDeliveryQueue.add('deliver', {
            recipient: data.userId,
            event,
            payload: data
        });
        return;
    }

    console.warn('Fanout worker received job without recipients or userId', job.id);
}, { connection });

console.log('Notification fanout worker started');
