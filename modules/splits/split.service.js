import APIError from "../../utils/APIError.js";
import { getFromCache, invalidateCache, setInCache } from "../../infrastructure/cache/cache.js";

class SplitService {
    constructor(splitModel) {
        this.Split = splitModel;
        this.prefix
    }

    getUserSplitsCacheKey(userId, page, limit, search, sortBy, sortOrder) {
        return `user:${userId}:splits:page:${page}:limit:${limit}:search:${search}:sortby:${sortBy}:sortorder:${sortOrder}`;
    }

    getSplitCacheKey(userId, splitId) {
        return `user:${userId}:split:${splitId}`;
    }

    async invalidateUserSplitsCache(userId) {
        return await invalidateCache(`user:${userId}:splits:*`);
    }

    async invalidateSplitCacheKey(userId, splitId) {
        return await invalidateCache(this.getSplitCacheKey(userId, splitId));
    }

    async getAllSplits(userId, page, limit, search, sortBy, sortOrder) {
        const key = this.getUserSplitsCacheKey(userId, page, limit, search, sortBy, sortOrder);
        const cachedSplits = await getFromCache(key);
        if (cachedSplits) {
            return cachedSplits;
        }

        const skip = (page - 1) * limit;
        const sort = { [sortBy]: sortOrder === 'asc' ? 1 : -1 };
        const searchRegex = new RegExp(search, 'i');

        const responseStructure = {
            splits: await this.Split.find({ name: { $regex: searchRegex }, userId })
                .skip(skip)
                .limit(limit)
                .sort(sort)
                .select('-__v -createdAt -updatedAt -routines'),
            page,
            totalResults: await this.Split.countDocuments({ name: { $regex: searchRegex }, userId }),
            totalPages: Math.ceil(await this.Split.countDocuments({ name: { $regex: searchRegex }, userId }) / limit)
        };

        await setInCache(key, responseStructure);

        return responseStructure; 
    }

    async getSplitById(userId, splitId) {
        const key = this.getSplitCacheKey(userId, splitId);
        const cachedSplit = await getFromCache(key);
        if (cachedSplit) {
            return cachedSplit;
        }

        const split = await this.Split.findOne({ _id: splitId, userId }).populate('routines', '-__v -createdAt -updatedAt');

        if (!split) {
            throw new APIError(404, 'Split not found.');
        }

        await setInCache(key, split);
        
        return split;
    }

    async createSplit(userId, splitData) {
        const split = new this.Split({ ...splitData, userId });
        const [] = await Promise.all([
            split.save(),
            this.invalidateUserSplitsCache(userId)
        ]);

        return split;
    }

    async updateSplit(userId, splitId, splitData) {
        const split = await this.Split.findOne({ _id: splitId, userId });

        if (!split) {
            throw new APIError(404, 'Split not found.');
        }

        split.name = splitData.name || split.name;
        split.description = splitData.description || split.description;
        if (splitData.routines) {
            split.routines = splitData.routines;
        }

        await split.populate('routines', '-__v -createdAt -updatedAt');

        const [] = await Promise.all([
            split.save(),
            setInCache(this.getSplitCacheKey(userId, splitId), split),
            this.invalidateUserSplitsCache(userId)
        ]);

        return split;
    }

    async deleteSplit(userId, splitId) {
        const split = await this.Split.findOneAndDelete({ _id: splitId, userId });

        const [] = await Promise.all([
            invalidateCache(this.getSplitCacheKey(userId, splitId)),
            this.invalidateUserSplitsCache(userId)
        ]);

        if (!split) {
            throw new APIError(404, 'Split not found.');
        }

        return split;
    }
}

export default SplitService;