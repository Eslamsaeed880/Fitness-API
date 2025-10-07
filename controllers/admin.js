import User from '../models/user.js';
import Exercise from '../models/exercise.js';

export const getAllUsers = async (req, res) => {
    try {
        const users = await User.find();
        res.status(200).json(users);
    } catch (err) {
        res.status(500).json({ message: 'Server error.', error: err.message });
    }
};

export const getUserById = async (req, res) => {
    try {
        const user = await User.findById(req.params.id);

        if (user) {
            res.status(200).json(user);
        } else {
            res.status(404).json({ message: 'User not found.' });
        }
    } catch (err) {
        res.status(500).json({ message: 'Server error.', error: err.message });
    }
};

export const deleteUser = async (req, res) => {
    try {
        const user = await User.findByIdAndDelete(req.params.id);

        if (user) {
            res.status(200).json({ message: 'User deleted successfully.' });
        } else {
            res.status(404).json({ message: 'User not found.' });
        }
    } catch (err) {
        res.status(500).json({ message: 'Server error.', error: err.message });
    }
};

export const updateUserRole = async (req, res) => {
    try {
        const { role } = req.body;
        const user = await User.findById(req.params.id);

        if (user) {
            user.role = role;
            await user.save();
            res.status(200).json({ message: 'User role updated successfully.' });
        } else {
            res.status(404).json({ message: 'User not found.' });
        }
    } catch (err) {
        res.status(500).json({ message: 'Server error.', error: err.message });
    }
};

export const createExercise = async (req, res) => {
    try {
        const { name, description, muscleGroup, videoUrl } = req.body;
        const userId = req.user._id;

        const newExercise = new Exercise({
            name,
            description,
            muscleGroup,
            videoUrl,
            createdBy: userId
        });
        await newExercise.save();
        res.status(201).json({ message: 'Exercise created successfully.', exercise: newExercise });
    } catch (err) {
        res.status(500).json({ message: 'Server error.', error: err.message });
    }
};

export const getAllExercises = async (req, res) => {
    try {
        const { search, primaryMuscle, sort = 'name' } = req.query;

        let filter = {};

        if (search) {
            filter.$text = { $search: search };
        }

        if (primaryMuscle) {
            const muscle = await Muscle.findOne({ 
                $text: { $search: primaryMuscle }
            });
            if (muscle) {
                filter.primaryMuscle = muscle._id;
            }
        }

        const sortOrder = sort === 'name' ? { name: 1 } : { name: -1 };

        const exercises = await Exercise.find(filter)
            .populate('muscleGroup')
            .sort(sortOrder);

        res.status(200).json(exercises);
    } catch (err) {
        res.status(500).json({ message: 'Server error.', error: err.message });
    }
};

export const getExerciseById = async (req, res) => {
    try {
        const exercise = await Exercise.findById(req.params.id)
            .populate('muscleGroup');

        if (exercise) {
            res.status(200).json(exercise);
        } else {
            res.status(404).json({ message: 'Exercise not found.' });
        }
    } catch (err) {
        res.status(500).json({ message: 'Server error.', error: err.message });
    }
};

export const updateExercise = async (req, res) => {
    try {
        const { name, description, muscleGroup } = req.body;
        const { videoUrl } = req.body || '';
        const exercise = await Exercise.findById(req.params.id);

        if (exercise) {
            exercise.name = name;
            exercise.description = description;
            exercise.muscleGroup = muscleGroup;
            exercise.videoUrl = videoUrl;

            await exercise.save();
            res.status(200).json({ message: 'Exercise updated successfully.', exercise });
        } else {
            res.status(404).json({ message: 'Exercise not found.' });
        }
    } catch (err) {
        res.status(500).json({ message: 'Server error.', error: err.message });
    }
};

export const deleteExercise = async (req, res) => {
    try {
        const exercise = await Exercise.findByIdAndDelete(req.params.id);

        if (exercise) {
            res.status(200).json({ message: 'Exercise deleted successfully.' });
        } else {
            res.status(404).json({ message: 'Exercise not found.' });
        }
    } catch (err) {
        res.status(500).json({ message: 'Server error.', error: err.message });
    }
};
