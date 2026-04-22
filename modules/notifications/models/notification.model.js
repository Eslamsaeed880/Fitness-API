import mongoose from "mongoose";

const notificationSchema = new mongoose.Schema({
    actorId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    type: {
        type: String,
        enum: ['LIKE', 'COMMENT', 'FOLLOW', 'ROUTINE_PUBLISHED', 'POST_PUBLISHED'],
        required: true
    },
    entityType: {
        type: String,
        enum: ['ROUTINE', 'POST', 'COMMENT', 'WORKOUT', 'USER'],
        required: true
    },
    entityId: {
        type: mongoose.Schema.Types.ObjectId,
        required: true
    },
    isRead: {
        type: Boolean,
        default: false
    }
}, { timestamps: true });

const Notification = mongoose.model('Notification', notificationSchema);

export default Notification;