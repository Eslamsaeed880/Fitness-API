import mongoose from "mongoose";

const RoutineExerciseSchema = new mongoose.Schema({
    routineId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Routine',
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
        ref: 'RoutineExerciseSet'
    }
}, { timestamps: true });

const RoutineExercise = mongoose.model('RoutineExercise', RoutineExerciseSchema);

export default RoutineExercise;