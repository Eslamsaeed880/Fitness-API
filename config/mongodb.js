import mongoose from 'mongoose';
import config from './config.js';

const connectDb = async () => {
    console.log('[MongoDB] Connecting to database...');

    mongoose.connection.on('connected', () => {
        console.log('[MongoDB] DB Connected');
    });

    mongoose.connection.on('error', (err) => {
        console.error('[MongoDB] Connection error:', err.message);
    });

    if (!config.mongodbUri) {
        throw new Error('MONGODB_URI is not set');
    }

    await mongoose.connect(config.mongodbUri);
}

export default connectDb;