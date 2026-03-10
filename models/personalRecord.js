import mongoose from 'mongoose';

const exercisePRsSchema = new mongoose.Schema({
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

const ExercisePR = mongoose.model('ExercisePR', exercisePRsSchema);
export default ExercisePR;
