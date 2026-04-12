export default class EmailService {
    constructor(transporter) {
        this.transporter = transporter;
    }

    async sendEmail(to, subject, html) {
        try {
            if (!this.transporter) {
                throw new Error('Email transporter is not configured');
            }

            const message = {
                from: process.env.MAIL_SENDER,
                to,
                subject,
                html
            };

            await this.transporter.sendMail(message);
        } catch (err) {
            console.error('Error sending email:', err);
            throw new Error('Failed to send email');
        }
    }

}