import mongoose from 'mongoose';

const splitSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        unique: true
    },
    description: {
        type: String
    },
    days: [{
        dayName: {
            type: String,
            required: true
        },
        exercises: [{
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Exercise'
        }]
    }],
    creatorId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    }
}, { timestamps: true });

const Split = mongoose.model('Split', splitSchema);

export default Split;