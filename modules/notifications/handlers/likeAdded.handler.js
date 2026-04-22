import eventBus from "../../../shared/eventBus.js";

eventBus.on("like.added", async (data) => {
    // await notificationQueue.add("like.added", data);
});