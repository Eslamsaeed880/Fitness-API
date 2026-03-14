import mongoose from "mongoose";

const workoutTemplateExerciseSchema = new mongoose.Schema({
    blockId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'WorkoutTemplateBlock',
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
    },
    targetSets: {
        type: Number,
        min: 1,
        default: 1
    },
    targetReps: {
        type: Number,
        min: 1,
        default: 1
    },
    targetWeightKg: {
        type: Number,
        min: 0,
        default: 0
    }
}, { timestamps: true });

const workoutTemplateExercise = mongoose.model('WorkoutTemplateExercise', workoutTemplateExerciseSchema);

export default workoutTemplateExercise;