import mongoose from 'mongoose';
import APIError from '../utils/APIError.js';

const muscleSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        unique: true,
        trim: true,
        lowercase: true
    },
    description: {
        type: String,
        trim: true
    }
}, { timestamps: true });

const Muscle = mongoose.model('Muscle', muscleSchema);

export default Muscle;