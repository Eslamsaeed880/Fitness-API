import mongoose from "mongoose";

const workoutTemplateBlockSchema = new mongoose.Schema({
    templateId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'WorkoutTemplate',
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

const WorkoutTemplateBlock = mongoose.model('WorkoutTemplateBlock', workoutTemplateBlockSchema);

export default WorkoutTemplateBlock;