import mongoose from 'mongoose';

const RoutineExerciseSetSchema = new mongoose.Schema({
    sets: [
        {
            type: {
                type: String,
                enum: ['normal', 'failure', 'warmup'],
                default: 'normal'
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
        }
    ]
}, { timestamps: true });

const RoutineExerciseSet = mongoose.model('RoutineExerciseSet', RoutineExerciseSetSchema);

export default RoutineExerciseSet;