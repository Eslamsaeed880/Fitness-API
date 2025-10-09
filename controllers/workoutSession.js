import WorkoutSession from '../models/workoutSession.js';
import Workout from '../models/workout.js';
import ExercisePR from '../models/exercisePRs.js';
import { updateExercisePRs } from '../middleware/updatePRs.js';

export const createWorkoutSession = async (req, res) => {
    try {
        const { workoutId } = req.body;
        const userId = req.user.id;
        const workout = await Workout.findById(workoutId);

        if (!workout) {
            return res.status(404).json({ message: 'Workout not found.' });
        }

        const newSession = new WorkoutSession({
            workoutData: {
                title: workout.title,
                notes: workout.notes,
                exercises: workout.exercises
            },
            originalWorkoutId: workout._id,
            createdBy: userId
        });

        await newSession.save();
        res.status(201).json(newSession);
    } catch (err) {
        res.status(500).json({ message: 'Server error.', error: err.message });
    }
};

export const getWorkoutSessions = async (req, res) => {
    try {
        const userId = req.user.id;
        const sessions = await WorkoutSession.find({ createdBy: userId })
            .select('workoutData.title workoutData.notes sessionStatus startTime endTime duration')
            .sort({ createdAt: -1 });

        res.status(200).json(sessions);
    } catch (err) {
        res.status(500).json({ message: 'Server error.', error: err.message });
    }
};

export const getWorkoutSessionById = async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.user.id;
        const session = await WorkoutSession.findOne({ _id: id, createdBy: userId });

        if (!session) {
            return res.status(404).json({ message: 'Session not found.' });
        }

        res.status(200).json(session);
    } catch (err) {
        res.status(500).json({ message: 'Server error.', error: err.message });
    }
};

export const updateWorkoutSession = async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.user.id;
        const { workoutData } = req.body;
        const session = await WorkoutSession.findOne({
            _id: id,
            createdBy: userId
        });

        if (!session) {
            return res.status(404).json({ message: 'Session not found.' });
        }

        session.workoutData = workoutData;

        await session.save();

        res.status(200).json({ session });
    } catch (err) {
        res.status(500).json({ message: 'Server error.', error: err.message });
    }
};

export const updateStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.user.id;
        const { sessionStatus } = req.body;

        const session = await WorkoutSession.findOne({
            _id: id,
            createdBy: userId
        });

        if (!session) {
            return res.status(404).json({ message: 'Session not found.' });
        }

        session.sessionStatus = sessionStatus;

        if (sessionStatus === 'completed' && session.endTime == null) {
            session.endTime = new Date();
            session.duration = Math.round((session.endTime - session.startTime) / (1000 * 60));
            
            await updateExercisePRs(userId, session.workoutData);
        }

        await session.save();

        res.status(200).json({ session });

    } catch (err) {
        res.status(500).json({ message: 'Server error.', error: err.message });
    }
}

export const getPersonalRecords = async (req, res) => {
    try {
        const userId = req.user.id;
        const personalRecords = await ExercisePR.find({ userId: userId })
            .populate('exerciseId', 'name description muscleGroup');

        res.status(200).json(personalRecords);
    } catch (err) {
        res.status(500).json({ message: 'Server error.', error: err.message });
    }
}