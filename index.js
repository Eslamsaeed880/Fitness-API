import 'dotenv/config';
import express from 'express';
import passport, { configurePassport } from './middleware/googleAuth.js';
import connectDB from './config/mongodb.js';
import authRoutes from './auth/auth.routes.js';
import adminRoutes from './routes/admin.routes.js';
import userRoutes from './users/user.route.js';
// import followingRoutes from './routes/follow.routes.js';
// import postRoutes from './routes/post.routes.js';
// import workoutRoutes from './routes/workout.routes.js';
import helmet from 'helmet';
import cors from 'cors';
import limiter from './middleware/rateLimit.js';
import swaggerUi from 'swagger-ui-express';
import swaggerDocument from './swagger.json' assert { type: 'json' };

const app = express();

configurePassport();

app.use(helmet());
app.use(cors());
app.use(limiter(15, 100));

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(passport.initialize());

connectDB();

app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/admin', adminRoutes);
app.use('/api/v1/users', userRoutes);
// app.use('/api/v1/workout', workoutRoutes);
// app.use('/api/v1/workout-session', workoutSessionRoutes);
// app.use('/api/v1/posts', postRoutes);
// app.use('/api/v1/following-details', followingRoutes);

app.use((req, res, next) => {
    const err = new Error('Not Found');
    err.status = 404;
    next(err);
});

app.use((err, req, res, next) => {
    const status = err.statusCode || err.status || 500;
    const message = err.message || 'Internal Server Error';

    const payload = {
        error: {
            message,
            status,
        },
    };

    if (err.errors) {
        payload.error.details = err.errors;
    }

    res.status(status).json(payload);
});

app.listen(process.env.PORT || 3000, () => {
    console.log("Server is running on port " + (process.env.PORT || 3000));
});
