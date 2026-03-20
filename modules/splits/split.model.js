import mongoose from 'mongoose';

const splitSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        unique: true,
        trim: true
    },
    description: {
        type: String,
        trim: true
    },
    workoutTemplates: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'WorkoutTemplate'
    }]
}, { timestamps: true });

const Split = mongoose.model('Split', splitSchema);

export default Split;