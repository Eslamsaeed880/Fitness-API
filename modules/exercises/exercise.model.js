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
            required: true
        },
        url: {
            type: String,
            required: true
        },
    },
    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }
}, { timestamps: true });

const Exercise = mongoose.model('Exercise', exerciseSchema);

export default Exercise;