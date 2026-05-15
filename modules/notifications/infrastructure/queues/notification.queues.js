import { Queue } from "bullmq";
import { getBullmqConnection } from '../../../../config/bullmq.connection.js';

const connection = getBullmqConnection();

const notificationsQueue = new Queue("notifications", { connection });

export default { notificationsQueue };