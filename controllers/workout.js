import Workout from '../models/workout.js';

export const createWorkout = async (req, res) => {
    try {
        const {title, notes, exercises=[]} = req.body;
        const userId = req.user.id;
        const workout = new Workout({
            title,
            notes,
            createdBy: userId,
            exercises
        });

        await workout.save();

        res.status(201).json(workout);

    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
        console.error('Error creating workout:', error);
    }
}

export const getWorkouts = async (req, res) => {
    try {
        const workouts = await Workout.find({ isActive: true }).populate('exercises.exerciseId').exec();
        res.status(200).json(workouts);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
        console.error('Error fetching workouts:', error);
    }
}

export const getWorkoutById = async (req, res) => {
    try {
        const { id } = req.params;
        const workout = await Workout.findOne({ _id: id, isActive: true })
            .populate({
                path: 'exercises.exerciseId',
                select: 'name description videoUrl'
            });

        if (!workout) {
            return res.status(404).json({ message: 'Workout not found' });
        }
        res.status(200).json(workout);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
        console.error('Error fetching workout by ID:', error);
    }
}

export const updateWorkout = async (req, res) => {
    try {
        const { id } = req.params;
        const { title, notes, exercises } = req.body;

        const workout = await Workout.findByIdAndUpdate({ _id: id, isActive: true }, {
            title,
            notes,
            exercises
        }, { new: true }).populate('exercises.exerciseId').exec();

        if (!workout) {
            return res.status(404).json({ message: 'Workout not found' });
        }
        res.status(200).json(workout);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
        console.error('Error updating workout:', error);
    }
}

export const deleteWorkout = async (req, res) => {
    try {
        const { id } = req.params;
        const workout = await Workout.findByIdAndDelete(id, { new: true });
        if (!workout) {
            return res.status(404).json({ message: 'Workout not found' });
        }
        res.status(200).json({ message: 'Workout deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
        console.error('Error deleting workout:', error);
    }
}
