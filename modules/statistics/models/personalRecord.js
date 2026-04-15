import mongoose from 'mongoose';

const personalRecord = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    exerciseId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Exercise',
        required: true
    },
    weightKg: {
        type: Number,
        min: 0,
        required: true
    },
    reps: {
        type: Number,
        min: 1,
        required: true
    },
    volume: {
        type: Number,
        min: 0,
        required: true
    }
}, { timestamps: true });

personalRecord.index({ userId: 1, exerciseId: 1 }, { unique: true });

const PersonalRecord = mongoose.model('PersonalRecord', personalRecord);
export default PersonalRecord;
