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
        const { page = 1, limit = 10, search } = req.query;
        let filter = { creatorId: req.user.id };
        
        if (search) {
            filter.$text = { $search: search };
        }
        
        const skip = (parseInt(page) - 1) * parseInt(limit);
        
        let sortObj = { createdAt: -1 };
        
        if (search) {
            sortObj = { score: { $meta: 'textScore' }, createdAt: -1 };
        }
        
        const splits = await Split.find(filter)
            .populate({
                path: 'days.exercises',
                populate: [
                    { path: 'primaryMuscle', select: 'name category' },
                    { path: 'secondaryMuscles', select: 'name category' }
                ]
            })
            .sort(sortObj)
            .skip(skip)
            .limit(parseInt(limit));
        
        const totalSplits = await Split.countDocuments(filter);
        const totalPages = Math.ceil(totalSplits / parseInt(limit));
        
        res.status(200).json({
            splits,
            pagination: {
                currentPage: parseInt(page),
                totalPages,
                totalSplits,
                hasNext: parseInt(page) < totalPages,
                hasPrev: parseInt(page) > 1,
                limit: parseInt(limit)
            }
        });
    } catch (error) {
        res.status(500).json({ message: 'Error fetching splits', error });
    }
};

export const getSplitById = async (req, res) => {
    try {
        const split = await Split.findById(req.params.id)
            .populate({
                path: 'days.exercises',
                populate: [
                    { path: 'primaryMuscle', select: 'name category' },
                    { path: 'secondaryMuscles', select: 'name category' }
                ]
            });

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
            { name, description, days },
            { new: true }
        ).populate({
            path: 'days.exercises',
            populate: [
                { path: 'primaryMuscle', select: 'name category' },
                { path: 'secondaryMuscles', select: 'name category' }
            ]
        });

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
