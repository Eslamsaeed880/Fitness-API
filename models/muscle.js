import mongoose from 'mongoose';

const muscleSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        unique: true
    },
    description: {
        type: String
    },
    muscleGroup: {
        type: String,
        enum: ['chest', 'back', 'shoulders', 'arms', 'core', 'legs', 'neck'],
        required: true
    },
    category: {
        type: String,
        enum: ['Upper Body', 'Lower Body', 'Core'],
        required: true
    }
}, { timestamps: true });

const Muscle = mongoose.model('Muscle', muscleSchema);

export default Muscle;