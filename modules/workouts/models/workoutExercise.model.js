import mongoose from "mongoose";

const workoutExerciseSchema = new mongoose.Schema({
    workoutId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Workout',
        required: true
    },
    orderIndex: {
        type: Number,
        default: 0,
    },
    exerciseId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Exercise',
        required: true
    },
    mode: {
        type: String,
        enum: ['strength', 'cardio'],
        default: 'strength'
    },
    setsId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Set'
    }
}, { timestamps: true });

const WorkoutExercise = mongoose.model('WorkoutExercise', workoutExerciseSchema);

export default WorkoutExercise;