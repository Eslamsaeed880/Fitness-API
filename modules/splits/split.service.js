import APIError from "../../utils/APIError.js";

class SplitService {
    constructor(splitModel) {
        this.Split = splitModel;
    }

    async getAllSplits(userId, page, limit, search, sortBy, sortOrder) {
        const skip = (page - 1) * limit;
        const sort = { [sortBy]: sortOrder === 'asc' ? 1 : -1 };
        const searchRegex = new RegExp(search, 'i');

        return {
            splits: await this.Split.find({ name: { $regex: searchRegex }, userId })
                .skip(skip)
                .limit(limit)
                .sort(sort)
                .select('-__v -createdAt -updatedAt -routines'),
            page,
            totalResults: await this.Split.countDocuments({ name: { $regex: searchRegex }, userId }),
            totalPages: Math.ceil(await this.Split.countDocuments({ name: { $regex: searchRegex }, userId }) / limit)
        };
    }

    async getSplitById(userId, splitId) {
        const split = await this.Split.findOne({ _id: splitId, userId }).populate('routines', '-__v -createdAt -updatedAt');

        if (!split) {
            throw new APIError(404, 'Split not found.');
        }
        
        return split;
    }

    async createSplit(userId, splitData) {
        const split = new this.Split({ ...splitData, userId });
        await split.save();
        return split;
    }

    async updateSplit(userId, splitId, splitData) {
        const split = await this.Split.findOne({ _id: splitId, userId });

        split.name = splitData.name || split.name;
        split.description = splitData.description || split.description;
        if (splitData.routines) {
            split.routines = splitData.routines;
        }

        await split.save();

        if (!split) {
            throw new APIError(404, 'Split not found.');
        }

        return split;
    }

    async deleteSplit(userId, splitId) {
        const split = await this.Split.findOneAndDelete({ _id: splitId, userId });

        if (!split) {
            throw new APIError(404, 'Split not found.');
        }

        return split;
    }
}

export default SplitService;