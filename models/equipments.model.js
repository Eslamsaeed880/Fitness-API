import mongoose from "mongoose";

const equipmentSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        unique: true,
        trim: true
    },
    description: {
        type: String,
        trim: true
    }
}, { timestamps: true });

const Equipment = mongoose.model('Equipment', equipmentSchema);

export default Equipment;