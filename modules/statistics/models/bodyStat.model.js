import mongoose from 'mongoose';

const bodyStatSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    weightKg: {
        type: Number,
        min: 0
    },
    bodyFat: {
        type: Number,
        min: 0,
        max: 100
    },
    muscleMassKg: {
        type: Number,
        min: 0
    },
    goal:{
        type: String,
        enum: ['lose fat', 'gain muscle', 'maintain weight']
    }
}, { timestamps: true });

const BodyStat = mongoose.model('BodyStat', bodyStatSchema);

export default BodyStat;