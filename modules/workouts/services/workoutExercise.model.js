import mongoose from "mongoose";

const workoutExerciseSchema = new mongoose.Schema({
    blockId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'WorkoutBlock',
        required: true
    },
    exerciseId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Exercise',
        required: true
    },
    orderIndex: {
        type: Number,
        default: 0,
    }
}, { timestamps: true });

const WorkoutExercise = mongoose.model('WorkoutExercise', workoutExerciseSchema);

export default WorkoutExercise;