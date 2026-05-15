# Fitness API

Fitness API is a Node.js and Express REST backend for fitness tracking, workout planning, exercise management, user profiles, body statistics, personal records, notifications, and admin operations. It is built as a modular platform that can grow into a larger fitness product with real-time features, smarter automation, and richer user engagement.

## Overview

The app mounts its public API under `/api/v1` and currently exposes modules for auth, users, admin, exercises, exercise requests, routines, workouts, personal records, body stats, splits, and notifications.

The current backend already includes a strong foundation: authentication, protected admin controls, media uploads, Redis-backed caching and queues, background workers, and scheduled cleanup jobs. The project is still in active development, and the next phase will expand it with AI integration, a chat application, and additional product features.

It also includes background processing for email, media, notifications, exercises, and personal-record jobs, plus a daily cleanup cron for old read notifications.

## Stack

- Express 5 for the HTTP API layer
- MongoDB and Mongoose for the primary data model and persistence
- Redis and BullMQ for queueing, caching, and worker-driven tasks
- JWT and Passport Google OAuth for authentication flows
- Cloudinary for exercise and profile media uploads
- Nodemailer for email delivery and recovery flows
- node-cron for scheduled cleanup tasks
- Helmet, CORS, and rate limiting for request hardening
- Multer for multipart file handling
- bcrypt for password hashing
- swagger-ui-express and OpenAPI documentation support

## API Surface

Auth routes live at `/api/v1/auth` and cover signup, login, Google OAuth, password reset, confirm reset, and password change.

Users routes live at `/api/v1/users` and support listing users, reading a user profile, and updating profile and cover images.

Admin routes live at `/api/v1/admin` and currently manage users, muscles, exercises, and exercise requests.

Exercises routes live at `/api/v1/exercises` and expose the public exercise catalog.

Exercise request routes live at `/api/v1/exercise-requests` and let authenticated users create, view, update, and delete their requests.

Routine routes live at `/api/v1/routines` and support CRUD plus routine exercise updates.

Workout routes live at `/api/v1/workout` and support CRUD, completion, summary lookup, and queries by user or routine.

Personal record routes live at `/api/v1/personal-records` and manage user records by exercise.

Body stat routes live at `/api/v1/body-stats` and manage body measurements over time.

Split routes live at `/api/v1/splits` and expose authenticated CRUD operations.

Notification routes live at `/api/v1/notifications` and support listing notifications and marking them read.

## In Progress

This project is not finished yet. It already has a solid backend structure, but the product is still being extended.

Planned next steps include:

- AI integration for smarter fitness experiences and automation
- A chat application for user communication and community interaction
- More fitness and social features to improve engagement and retention
- Additional polish for notifications, workflows, and admin tooling

## Local Setup

```bash
git clone https://github.com/Eslamsaeed880/Fitness-API.git
cd Fitness-API
npm install
```

Create a `.env` file in the project root. The app expects at least these variables:

```env
MONGODB_URI=mongodb://localhost:27017/fitness-api
PORT=3000
API_BASE_URL=http://localhost:3000

JWT_SECRET_KEY=replace-this
REFRESH_TOKEN_SECRET=replace-this-too
ACCESS_TOKEN_EXPIRY=1h
REFRESH_TOKEN_EXPIRY=7d

GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
GOOGLE_CALLBACK_URL=http://localhost:3000/api/v1/auth/google/callback

REDIS_URL=redis://localhost:6379
CORS_ORIGIN=http://localhost:3000

BCRYPT_SALT_ROUNDS=10
BASIC_PASSWORD=optional-fallback-password

CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=your-cloudinary-key
CLOUDINARY_API_SECRET=your-cloudinary-secret

MAIL_SENDER=your-sender-address
NODEMAILER_PASSWORD=your-mail-password
```

## Run

Development:

```bash
npm run dev
```

Production-style start:

```bash
npm start
```

The server listens on the configured `PORT`, or `3000` by default.

## Docker

The repository includes a `docker-compose.yml` that starts MongoDB, Redis, the API, and the worker processes.

```bash
docker compose up --build
```

## Architecture Notes

- `index.js` is the application entrypoint.
- `config/` contains MongoDB, Redis, BullMQ, and shared runtime configuration.
- `middleware/` contains auth, Google OAuth, rate limiting, upload, and error handling middleware.
- `modules/` contains the feature areas and their controllers, routes, services, models, jobs, queues, workers, and cron jobs.
- `infrastructure/` contains shared email, media, cache, queue, and worker integrations.

## Documentation

The OpenAPI document is kept in `swagger.json`. The Swagger UI mount in `index.js` is currently commented out.

## Status

- `npm test` is currently a placeholder script.
- The repo does not include a frontend application yet.
- The project is actively evolving and should be treated as work in progress.

## License

ISC