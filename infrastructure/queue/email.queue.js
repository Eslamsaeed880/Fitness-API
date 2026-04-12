import { Queue } from 'bullmq';
import IORedis from 'ioredis';
import EmailService from '../email/email.service.js';

const connection = new IORedis(process.env.REDIS_URL || 'redis://localhost:6379', {
    maxRetriesPerRequest: null,
});

export const emailQueue = new Queue('email', { connection });

export async function enqueueEmailJob({
    type,
    from,
    to,
    subject,
    html
}) {
    if (!to || !subject || !html) {
        throw new Error('To, subject, and html are required to send an email');
    }

    try {
        const job = await emailQueue.add(
            type,
            { from, to, subject, html }, {
                attempts: 3,
                backoff: {
                    type: 'exponential',
                    delay: 5000
                },
                removeOnComplete: true,
                removeOnFail: false
            }
        );

        return job;
    } catch (err) {
        console.error('[EmailQueue] Failed to enqueue email job:', err);
        throw new Error('Failed to enqueue email job');
    }
}