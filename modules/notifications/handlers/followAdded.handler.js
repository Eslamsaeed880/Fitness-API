import eventBus from "../../../shared/eventBus.js";
// import notificationQueue from "../infrastructure/notification.queue.js";

eventBus.on("follow.added", async (data) => {
    // await notificationQueue.add("follow.added", data);
})