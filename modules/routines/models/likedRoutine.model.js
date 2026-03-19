import mongoose from 'mongoose';

const LikedRoutineSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    routineId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Routine',
        required: true
    }
}, { timestamps: true });

LikedRoutineSchema.index({ userId: 1, routineId: 1 }, { unique: true });

const LikedRoutine = mongoose.model('LikedRoutine', LikedRoutineSchema);

export default LikedRoutine;