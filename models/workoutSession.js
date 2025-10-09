import mongoose from 'mongoose';

const workoutSessionSchema = new mongoose.Schema({
    workoutData: {
        title: {
            type: String,
            required: true,
            trim: true
        },
        notes: {
            type: String,
            trim: true
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
            sets: [{
                setType: {
                    type: String,
                    enum: ['warmup', 'working', 'drop', 'failure'],
                    default: 'working'
                },
                setNumber: {
                    type: Number,
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
                    required: true
                },
                restSeconds: {
                    type: Number,
                    min: 0,
                    default: 120
                },
                isCompleted: {
                    type: Boolean,
                    default: false
                },
                completedAt: {
                    type: Date
                }
            }]
        }]
    },
    sessionStatus: {
        type: String,
        enum: ['active', 'paused', 'completed', 'cancelled'],
        default: 'active'
    },
    startTime: {
        type: Date,
        default: Date.now
    },
    endTime: {
        type: Date
    },
    duration: {
        type: Number, 
        default: 0
    },
    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    originalWorkoutId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Workout'
    }
}, { timestamps: true });

workoutSessionSchema.pre('save', function(next) {
    if (this.endTime && this.startTime) {
        this.duration = Math.round((this.endTime - this.startTime) / (1000 * 60)); 
    }
    next();
});

const WorkoutSession = mongoose.model('WorkoutSession', workoutSessionSchema);

export default WorkoutSession;