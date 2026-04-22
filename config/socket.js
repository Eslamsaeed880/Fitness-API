import { Server } from "socket.io";

let io;

export function initSocket(server) {
    io = new Server(server, {
        cors: {
            origin: "*", // Adjust this to your frontend URL in production
        }
    });

    io.on("connection", (socket) => {
        console.log("New client connected:", socket.id);

        socket.on("join", (userId) => {
            socket.join(`user:${userId}`);
            console.log(`User ${userId} joined room user:${userId}`);
        });

        socket.on("disconnect", () => {
            console.log("Client disconnected:", socket.id);
        });
    });
}

export function getIO() {
    if (!io) {
        throw new Error("Socket.io not initialized. Call initSocket(server) first.");
    }
    return io;
}