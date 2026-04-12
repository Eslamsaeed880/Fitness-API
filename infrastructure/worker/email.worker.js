import { Worker } from 'bullmq';
import EmailService from '../email/email.service.js';
import { getBullmqConnection } from '../../config/bullmq.connection.js';

const emailService = new EmailService();

export const emailWorker = new Worker(
    'email',
    async (job) => {
        const { type, from, to, subject, html } = job.data;

        return await emailService.sendEmail({ from, to, subject, html }); 
    },
    { connection: getBullmqConnection() }
);

emailWorker.on('completed', (job) => {
    console.log(`[EmailWorker] Job ${job.id} completed successfully`);
});

emailWorker.on('failed', (job, err) => {
    console.error(`[EmailWorker] Job ${job?.id} failed:`, err.message);
});

emailWorker.on('error', (err) => {
    console.error('[EmailWorker] Worker error:', err);
});

console.log('Email worker started and listening for jobs...');

export default emailWorker;