import getIO from "../../../../config/socket.js";

function emitToUser(userId, event, data) {
    const io = getIO();
    io.to(`user:${userId}`).emit(event, data);
}

export default { emitToUser };