import 'dotenv/config';
import express from 'express';
import passport, { configurePassport } from './middleware/googleAuth.js';
import connectDB from './config/mongodb.js';
import authRoutes from './routes/auth.js';
import adminRoutes from './routes/admin.js';
import workoutSessionRoutes from './routes/workoutSession.js';
import workoutRoutes from './routes/workout.js';
import helmet from 'helmet';
import cors from 'cors';

const app = express();

configurePassport();

app.use(helmet());
app.use(cors());

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(passport.initialize());

connectDB();

app.use('/api/auth', authRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/workout', workoutRoutes);
app.use('/api/workout-session', workoutSessionRoutes);


app.listen(process.env.PORT || 3000, () => {
    console.log("Server is running on port " + (process.env.PORT || 3000));
});
