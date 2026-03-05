import mongoose from 'mongoose';
import config from './config.js';

const connectDb = async () => {
    mongoose.connection.on('connected', () => {
        console.log("DB Connected");
    });

    if (!config.mongodbUri) {
        throw new Error('MONGODB_URI is not set');
    }

    await mongoose.connect(config.mongodbUri);
}

export default connectDb;