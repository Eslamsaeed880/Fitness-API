import APIError from "../../../utils/APIError.js";

export class NotificationStrategy {
    async send(userId, data) {
        throw new APIError(400, 'send() must be implemented');
    }
}

