import User from '../models/user.js';
import Muscle from '../models/muscle.js';

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

export const getAllMuscles = async (req, res) => {
    try {
        const muscles = await Muscle.find();
        res.status(200).json(muscles);
    } catch (err) {
        res.status(500).json({ message: 'Server error.', error: err.message });
    }
};

export const getMuscleById = async (req, res) => {
    try {
        const muscle = await Muscle.findById(req.params.id);

        if (muscle) {
            res.status(200).json(muscle);
        } else {
            res.status(404).json({ message: 'Muscle not found.' });
        }
    } catch (err) {
        res.status(500).json({ message: 'Server error.', error: err.message });
    }
};

export const createMuscle = async (req, res) => {
    try {
        const { name, category, muscleGroup, description } = req.body;

        const newMuscle = new Muscle({
            name,
            category,
            muscleGroup,
            description
        });

        await newMuscle.save();
        res.status(201).json({ message: 'Muscle created successfully.', muscle: newMuscle });
    } catch (err) {
        res.status(500).json({ message: 'Server error.', error: err.message });
    }
};

export const updateMuscle = async (req, res) => {
    try {
        const { name, category, muscleGroup, description } = req.body;
        const muscle = await Muscle.findById(req.params.id);

        if (muscle) {
            muscle.name = name;
            muscle.category = category;
            muscle.muscleGroup = muscleGroup;
            muscle.description = description;

            await muscle.save();
            res.status(200).json({ message: 'Muscle updated successfully.', muscle });
        } else {
            res.status(404).json({ message: 'Muscle not found.' });
        }
    } catch (err) {
        res.status(500).json({ message: 'Server error.', error: err.message });
    }
};

export const deleteMuscle = async (req, res) => {
    try {
        const muscle = await Muscle.findByIdAndDelete(req.params.id);

        if (muscle) {
            res.status(200).json({ message: 'Muscle deleted successfully.' });
        } else {
            res.status(404).json({ message: 'Muscle not found.' });
        }
    } catch (err) {
        res.status(500).json({ message: 'Server error.', error: err.message });
    }
};
