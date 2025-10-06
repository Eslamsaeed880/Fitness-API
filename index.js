import dotenv from 'dotenv';

dotenv.config();

import express from 'express';
import passport, { configurePassport } from './middleware/googleAuth.js';
import connectDB from './config/mongodb.js';
import authRoutes from './routes/auth.js';
import adminRoutes from './routes/admin.js';
import splitRoutes from './routes/split.js';

configurePassport();

const app = express();

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({extended: true}))
app.use(passport.initialize());

connectDB();

app.use('/api/auth', authRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/split', splitRoutes);

app.listen(process.env.PORT || 3000, () => {
    console.log("Server is running on port " + (process.env.PORT || 3000));
});
