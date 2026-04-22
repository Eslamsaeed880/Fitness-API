import eventBus from "../../../shared/eventBus.js";
// import notificationQueue from "../infrastructure/notification.queue.js";

eventBus.on("comment.added", async (data) => {
    // await notificationQueue.add("comment.added", data);
})
