import mongoose from "mongoose";

const setSchema = new mongoose.Schema({
    sets: [
        {
            type: {
                type: String,
                enum: ['normal', 'failure', 'warmup'],
                default: 'normal'
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
            },
            rpe: {
                type: Number,
                min: 1,
                max: 10
            },
            restSeconds: {
                type: Number,
                min: 0
            }
        }
    ],
}, { timestamps: true });

setSchema.index({ workoutExerciseId: 1 });

const Set = mongoose.model('Set', setSchema);

export default Set;