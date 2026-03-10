import mongoose from "mongoose";

const setSchema = new mongoose.Schema({
    workoutExerciseId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'WorkoutExercise'
    },
    setNumber: {
        type: Number,
        min: 1
    },
    setType: {
        type: String,
        enum: ['strength', 'cardio'],
        default: 'strength'
    },
    reps: {
        type: Number,
        min: 1
    },
    weightKg: {
        type: Number,
        min: 0,
    },
    distance: {
        type: Number,
        min: 0
    },
    durationSeconds: {
        type: Number,
        min: 0,
        default: 120
    },
    rpe: {
        type: Number,
        min: 1,
        max: 10
    },
    isWarmup: {
        type: Boolean,
        default: false
    }
}, { timestamps: true });

setSchema.index({ workoutExerciseId: 1 });

const Set = mongoose.model('Set', setSchema);

export default Set;