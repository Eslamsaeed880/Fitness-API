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
    secondaryMuscle: {
        type: String,
        trim: true
    },
    equipments: [{
        type: String,
        trim: true,
    }],
    movementType: {
        type: String,
        enum: ["compound", "isolation"],
        required: true,
        trim: true
    },
    status: {
        type: String,
        enum: ['pending', 'approved', 'rejected'],
        default: 'pending'
    },
    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }
}, { timestamps: true });

const ExerciseRequest = mongoose.model('ExerciseRequest', exerciseRequestSchema);

export default ExerciseRequest;