// import io from "../../../../config/socket.config.js";

function emitToUser(userId, event, data) {
    // io.to(`user:${userId}`).emit(event, data);
}

export default { emitToUser };