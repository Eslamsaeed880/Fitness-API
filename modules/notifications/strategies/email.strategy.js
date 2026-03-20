import { NotificationStrategy } from "./notification.strategy.js";
import User from "../../users/user.model.js";
import emailService from "../../../infrastructure/email/email.service.js"

export class EmailNotificationStrategy extends NotificationStrategy {
    constructor(emailService) {
        super();
        this.emailService = emailService;
    }
    
    async send(userId, data) {
        const user = await User.findById(userId);
        await this.emailService.sendEmail(user.email, data.subject, data.message);

        return { type: 'email', userId };
    }
}