import 'dotenv/config';
import express from 'express';
import passport, { configurePassport } from './middleware/googleAuth.js';
import connectDB from './config/mongodb.js';
import authRoutes from './routes/auth.js';
import adminRoutes from './routes/admin.js';
import followingRoutes from './routes/follow.js';
import workoutSessionRoutes from './routes/workoutSession.js';
import postRoutes from './routes/post.js';
import workoutRoutes from './routes/workout.js';
import helmet from 'helmet';
import cors from 'cors';
import limiter from './middleware/rateLimit.js';

const app = express();

configurePassport();

app.use(helmet());
app.use(cors());
app.use(limiter(15, 100));

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(passport.initialize());

connectDB();

app.use('/api/auth', authRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/workout', workoutRoutes);
app.use('/api/workout-session', workoutSessionRoutes);
app.use('/api/posts', postRoutes);
app.use('/api/following-details', followingRoutes);

app.use((req, res, next) => {
    const err = new Error('Not Found');
    err.status = 404;
    next(err);
});

app.use((err, req, res, next) => {
    const status = err.status || 500;
    const message = err.message || 'Internal Server Error';

    const payload = {
        error: {
            message,
            status,
        },
    };

    res.status(status).json(payload);
});

app.listen(process.env.PORT || 3000, () => {
    console.log("Server is running on port " + (process.env.PORT || 3000));
});
