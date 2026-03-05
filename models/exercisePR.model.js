import mongoose from 'mongoose';

const exercisePRsSchema = new mongoose.Schema({
    exerciseId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Exercise',
        required: true
    },
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    maxWeightKg: {
        type: Number,
        min: 0,
        required: true
    },
    maxReps: {
        type: Number,
        min: 0,
        required: true
    },
    achievedAt: {
        type: Date,
        default: Date.now
    }
}, { timestamps: true });

const ExercisePR = mongoose.model('ExercisePR', exercisePRsSchema);
export default ExercisePR;
