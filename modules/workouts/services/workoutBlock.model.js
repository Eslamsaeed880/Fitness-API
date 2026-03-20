import mongoose from "mongoose";

const workoutBlockSchema = new mongoose.Schema({
    workoutId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Workout',
        required: true
    },
    blockType: {
        type: String,
        enum: ['normal', 'superset', 'dropSet'],
        default: 'normal'
    },
    orderIndex: {
        type: Number,
        default: 0
    },
    restSeconds: {
        type: Number,
        min: 0,
        default: 120
    }
}, { timestamps: true });

const WorkoutBlock = mongoose.model('WorkoutBlock', workoutBlockSchema);

export default WorkoutBlock;