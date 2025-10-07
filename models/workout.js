import mongoose from 'mongoose';

const workoutSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true,
        trim: true
    },
    notes: {
        type: String,
        trim: true
    },
    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    exercises: [{
        exerciseId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Exercise',
            required: true
        },
        notes: {
            type: String,
            trim: true
        },
        sets: [
            {
                setType: {
                    type: String,
                    enum: ['warmup', 'working', 'drop', 'failure'],
                    default: 'working'
                },
                setNumber: {
                    type: Number,
                    default: 1,
                    required: true
                },
                weightKg: {
                    type: Number,
                    min: 0,
                    required: true
                },
                reps: {
                    type: Number,
                    min: 0,
                    default: 10,
                    required: true
                },
                restSeconds: {
                    type: Number,
                    min: 0,
                    default: 120,
                    required: true
                }
            }
        ]
    }],
    session: {
        type: Boolean,
        default: false
    },
    isActive: {
        type: Boolean,
        default: true
    }
}, { timestamps: true });

const Workout = mongoose.model('Workout', workoutSchema);

export default Workout;
