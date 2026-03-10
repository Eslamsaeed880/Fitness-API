import mongoose from 'mongoose';

const exerciseRequestSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
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
    secondaryMuscles: {
        type: String,
        trim: true
    },
    equipment: {
        type: String,
        trim: true,
    },
    movementType: {
        type: String,
        enum: ["compound", "isolation"],
        required: true,
        trim: true
    },
    media: {
        mediaType: {
            type: String,
            enum: ['image', 'video'],
            required: true
        },
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

const ExerciseRequest = mongoose.model('ExerciseRequest', exerciseRequestSchema);

export default ExerciseRequest;