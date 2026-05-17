import mongoose from 'mongoose';
import { Schema } from 'mongoose';

const LikeSchema = new Schema({
    userId: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    entityType: {
        type: String,
        enum: ['POST', 'ROUTINE', 'COMMENT', 'WORKOUT'],
        required: true
    },
    entityId: {
        type: Schema.Types.ObjectId,
        required: true
    }
}, { timestamps: true });

LikeSchema.index({ userId: 1, entityType: 1, entityId: 1 }, { unique: true });

const Like = mongoose.model('Like', LikeSchema);

export default Like;