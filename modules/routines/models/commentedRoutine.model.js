import mongoose from "mongoose";

const CommentedRoutineSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    routineId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Routine',
        required: true
    },
    comment: {
        type: String,
        required: true,
        trim: true
    }
}, { timestamps: true });

commentedRoutineSchema.index({ userId: 1, routineId: 1 }, { unique: true });

const CommentedRoutine = mongoose.model('CommentedRoutine', CommentedRoutineSchema);

export default CommentedRoutine;