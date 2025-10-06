import mongoose from 'mongoose';

const exerciseSchema = new mongoose.Schema({
    name: { 
        type: String, 
        required: true, 
        unique: true 
    },
    description: {
        type: String
    },
    primaryMuscle: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'Muscle',
        required: true
    },
    secondaryMuscles: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Muscle'
        }
    ],
    videoUrl: {
        type: String
    }
});

const Exercise = mongoose.model('Exercise', exerciseSchema);

export default Exercise;