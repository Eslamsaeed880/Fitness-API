import { Queue } from "bullmq";
import connection from "../../../config/redis.config.js";

const notificationEventQueue = new Queue("notification:events", { connection });

const notificationFanoutQueue = new Queue("notification:fanout", { connection });

const notificationDeliveryQueue = new Queue("notification:delivery", { connection });

export default { notificationEventQueue, notificationFanoutQueue, notificationDeliveryQueue };