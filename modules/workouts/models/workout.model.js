import mongoose from 'mongoose';

const workoutSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    description: {
        type: String,
        trim: true
    },
    routineId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Routine'
    },
    startTime: {
        type: Date,
        default: Date.now
    },
    endTime: {
        type: Date,
        default: null
    },
    duration: {
        type: Number,
        default: 0
    },
}, { timestamps: true });

const Workout = mongoose.model('Workout', workoutSchema);

export default Workout;
