import mongoose from 'mongoose';

const RoutineSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    name: {
        type: String,
        required: true,
        trim: true
    },
    description: {
        type: String,
        trim: true
    },
    likes: {
        type: Number,
        default: 0
    },
    isPublic: {
        type: Boolean,
        default: false
    }
}, { timestamps: true });

const Routine = mongoose.model('Routine', RoutineSchema);

export default Routine;