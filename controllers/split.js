import Split from '../models/split.js';

export const createSplit = async (req, res) => {
    try {
        const { name, description, days } = req.body;
        const creatorId = req.user.id;
        const newSplit = new Split({ name, description, days, creatorId });
        await newSplit.save();
        res.status(201).json(newSplit);
    } catch (error) {
        res.status(500).json({ message: 'Error creating split', error });
    }
};

export const getSplits = async (req, res) => {
    try {
        const splits = await Split.find({ creatorId: req.user.id });
        res.status(200).json(splits);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching splits', error });
    }
};

export const getSplitById = async (req, res) => {
    try {
        const split = await Split.findById(req.params.id);

        if (!split) {
            return res.status(404).json({ message: 'Split not found' });
        }

        res.status(200).json(split);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching split', error });
    }
};

export const updateSplit = async (req, res) => {
    try {
        const { name, description, days } = req.body;
        const split = await Split.findByIdAndUpdate(
            req.params.id,
            { 
                name, description, 
                days: [{ 
                    dayName: days.dayName, 
                    exercises: days.exercises 
                }] 
            },
            { new: true }
        );

        if (!split) {
            return res.status(404).json({ message: 'Split not found' });
        }
        res.status(200).json(split);
    } catch (error) {
        res.status(500).json({ message: 'Error updating split', error });
    }
};

export const deleteSplit = async (req, res) => {
    try {
        const split = await Split.findByIdAndDelete(req.params.id);

        if (!split) {
            return res.status(404).json({ message: 'Split not found' });
        }
        res.status(200).json({ message: 'Split deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Error deleting split', error });
    }
};
