import mongoose from 'mongoose';

const exerciseSchema = new mongoose.Schema({
    name: { 
        type: String, 
        required: true, 
        unique: true,
        lowercase: true,
        trim: true
    },
    description: {
        type: String,
        trim: true
    },
    primaryMuscle: {
        type: String,
        required: true,
        trim: true
    },
    secondaryMuscle: {
        type: String,
        trim: true
    },
    equipments: [{
        type: String,
        trim: true
    }],
    movementType: {
        type: String,
        enum: ["compound", "isolation"],
        required: true,
        trim: true
    },
    media: {
        publicId: {
            type: String,
        },
        url: {
            type: String,
        },
    },
    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    status: {
        type: String,
        enum: ['processing', 'failed', 'ready'],
        default: 'processing'
    },
}, { timestamps: true });

const Exercise = mongoose.model('Exercise', exerciseSchema);

export default Exercise;