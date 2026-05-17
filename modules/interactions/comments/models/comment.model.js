import mongoose from "mongoose";
import { Schema } from "mongoose";

const CommentSchema = new Schema({
    userId: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    entityType: {
        type: String,
        enum: ['POST', 'ROUTINE', 'WORKOUT'],
        required: true
    },
    entityId: {
        type: Schema.Types.ObjectId,
        required: true
    },
    content: {
        type: String,
        required: true,
        trim: true
    },
    likes: {
        type: Number,
        default: 0
    },
    replies: {
        type: Number,
        default: 0
    },
    parentId: {
        type: Schema.Types.ObjectId,
        ref: 'Comment',
        default: null
    }
}, { timestamps: true });

CommentSchema.index({ entityType: 1, entityId: 1 });

const Comment = mongoose.model('Comment', CommentSchema);

export default Comment;