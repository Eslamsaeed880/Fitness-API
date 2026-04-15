import 'dotenv/config';
import { Worker } from 'bullmq';
import { getBullmqConnection } from '../../../config/bullmq.connection.js';
import connectDB from '../../../config/mongodb.js';
import PersonalRecordService from '../../statistics/services/personalRecord.service.js';
import PersonalRecord from '../../statistics/models/personalRecord.js';
import WorkoutExercise from '../models/workoutExercise.model.js';
import '../models/set.model.js';


console.log('[AddToPersonalRecordsWorker] Initializing...');
await connectDB();

export const addToPersonalRecordsWorker = new Worker(
    'addToPersonalRecords',
    async (job) => {
        const { userId, workout, workoutId: directWorkoutId } = job.data;
        const workoutId = workout?._id || directWorkoutId;

        if (!userId || !workoutId) {
            throw new Error('User ID and workout ID are required');
        }

        const personalRecordService = new PersonalRecordService(PersonalRecord);
        
        const exercises = await WorkoutExercise.find({ workoutId })
            .populate('setsId')
            .lean();

        const exercisesStructured = exercises
            .map((exercise) => {
                const performedSets = exercise?.setsId?.sets || [];
                const validSets = performedSets.filter(
                    (set) => typeof set.weightKg === 'number' && typeof set.reps === 'number'
                );

                if (!validSets.length) {
                    return null;
                }

                const bestWeightKg = Math.max(...validSets.map((set) => set.weightKg));
                const bestReps = Math.max(...validSets.map((set) => set.reps));
                const volume = validSets.reduce((total, set) => total + (set.weightKg * set.reps), 0);

                return {
                    exerciseId: exercise.exerciseId,
                    weightKg: bestWeightKg,
                    reps: bestReps,
                    volume
                };
            })
            .filter(Boolean);

        console.log(`[AddToPersonalRecordsWorker] Received job for user ${userId}, exercises ${JSON.stringify(exercisesStructured)}`);
        return await personalRecordService.addPersonalRecord(userId, exercisesStructured);
    },
    { connection: getBullmqConnection() }
);

addToPersonalRecordsWorker.on('completed', (job) => {
    console.log(`[AddToPersonalRecordsWorker] Job ${job.id} completed successfully`);
});

addToPersonalRecordsWorker.on('failed', (job, err) => {
    console.error(`[AddToPersonalRecordsWorker] Job ${job?.id} failed:`, err.message);
});

addToPersonalRecordsWorker.on('error', (err) => {
    console.error('[AddToPersonalRecordsWorker] Worker error:', err);
});

console.log('AddToPersonalRecords worker started and listening for jobs...');

export default addToPersonalRecordsWorker;