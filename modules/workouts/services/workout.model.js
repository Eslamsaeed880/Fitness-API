import mongoose from 'mongoose';

const workoutSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    templateId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'WorkoutTemplate'
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
    notes: {
        type: String,
        trim: true
    }
}, { timestamps: true });

const Workout = mongoose.model('Workout', workoutSchema);

export default Workout;
