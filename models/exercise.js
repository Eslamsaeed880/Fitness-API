import mongoose from 'mongoose';

const exerciseSchema = new mongoose.Schema({
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
    muscleGroup: {
        type: String,
        enum: ['chest', 'back', 'shoulders', 'arms', 'core', 'legs', 'neck'],
        required: true
    },
    videoUrl: {
        type: String
    },
    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }
}, { timestamps: true });

exerciseSchema.index({ name: 'text', description: 'text' });

const Exercise = mongoose.model('Exercise', exerciseSchema);

export default Exercise;