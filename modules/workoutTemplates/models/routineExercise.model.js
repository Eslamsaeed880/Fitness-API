import mongoose from "mongoose";

const RoutineExerciseSchema = new mongoose.Schema({
    routineId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Routine',
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
    type: {
        type: String,
        enum: ['dropset', 'superset', 'exercise'],
        default: 'exercise'
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
    },
    restSeconds: {
        type: Number,
        min: 0,
        default: 60
    }
}, { timestamps: true });

const RoutineExercise = mongoose.model('RoutineExercise', RoutineExerciseSchema);

export default RoutineExercise;