export default class EmailService {
    constructor(transporter) {
        this.transporter = transporter;
    }

    async sendEmail(to, subject, html) {
        try {
            const mailOptions = {
                from: process.env.MAILSENDER,
                to,
                subject,
                html
            };
            await this.transporter.sendMail(mailOptions);
        } catch (err) {
            console.error('Error sending email:', err);
            throw new Error('Failed to send email');
        }
    }

}