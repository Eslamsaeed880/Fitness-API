import APIError from "../../utils/APIError.js";

class SplitService {
    constructor(splitModel) {
        this.Split = splitModel;
    }

    async getAllSplits(page, limit, search, sortBy, sortOrder) {
        const skip = (page - 1) * limit;
        const sort = { [sortBy]: sortOrder === 'asc' ? 1 : -1 };
        const searchRegex = new RegExp(search, 'i');

        return {
            splits: await this.Split.find({ name: { $regex: searchRegex } })
                .skip(skip)
                .limit(limit)
                .sort(sort)
                .select('-__v -createdAt -updatedAt'),
            page,
            totalResults: await this.Split.countDocuments({ name: { $regex: searchRegex } }),
            totalPages: Math.ceil(await this.Split.countDocuments({ name: { $regex: searchRegex } }) / limit)
        };
    }

    async getSplitById(splitId) {
        const split = await this.Split.findById(splitId);

        if (!split) {
            throw new APIError(404, 'Split not found.');
        }
        
        return split;
    }

    async createSplit(splitData) {
        const split = new this.Split(splitData);
        await split.save();
        return split;
    }

    async updateSplit(splitId, splitData) {
        const split = await this.Split.findByIdAndUpdate(splitId, splitData, { new: true });

        if (!split) {
            throw new APIError(404, 'Split not found.');
        }

        return split;
    }

    async deleteSplit(splitId) {
        const split = await this.Split.findByIdAndDelete(splitId);

        if (!split) {
            throw new APIError(404, 'Split not found.');
        }

        return split;
    }
}

export default SplitService;