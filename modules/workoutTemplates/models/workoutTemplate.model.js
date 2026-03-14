import mongoose from 'mongoose';

const workoutTemplateSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    name: {
        type: String,
        required: true,
        trim: true
    },
    description: {
        type: String,
        trim: true
    },
    isPublic: {
        type: Boolean,
        default: false
    }
}, { timestamps: true });

const WorkoutTemplate = mongoose.model('WorkoutTemplate', workoutTemplateSchema);

export default WorkoutTemplate;