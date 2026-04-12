import { Worker } from 'bullmq';
import nodemailer from 'nodemailer';
import EmailService from '../email/email.service.js';
import { getBullmqConnection } from '../../config/bullmq.connection.js';
import config from '../../config/config.js';

const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: config.mail.sender,
        pass: config.mail.password
    }
});

const emailService = new EmailService(transporter);

export const emailWorker = new Worker(
    'email',
    async (job) => {
        const { type, from, to, subject, html } = job.data;

        return await emailService.sendEmail(
            to,
            subject,
            html
        ); 
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