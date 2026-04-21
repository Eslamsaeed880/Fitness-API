import APIError from "../../utils/APIError.js";
import { getFromCache, invalidateCache, setInCache } from "../../infrastructure/cache/cache.js";

export default class MuscleService {
    constructor(muscleModel) {
        this.Muscle = muscleModel;
        this.ttl = 360; // Cache TTL in seconds (6 minutes)
    }

    getMusclesCacheKey(page, limit, search, sortBy, sortOrder) {
        return `muscles:page:${page}:limit:${limit}:search:${search}:sortby:${sortBy}:sortorder:${sortOrder}`;
    }

    getMuscleCacheKey(muscle) {
        return `muscle:${muscle}`;
     }

    async invalidateMusclesCache() {
        return await invalidateCache(`muscles:*`);
    }

    async invalidateMuscleCacheKey(muscleId) {
        return await invalidateCache(this.getMuscleCacheKey(muscleId));
    }

    async getAllMuscles(page, limit, search, sortBy, sortOrder) {
        const key = this.getMusclesCacheKey(page, limit, search, sortBy, sortOrder);
        const cachedMuscles = await getFromCache(key);

        if (cachedMuscles) {
            return cachedMuscles;
        }

        const skip = (page - 1) * limit;
        const sort = { [sortBy]: sortOrder === 'asc' ? 1 : -1 };
        const searchRegex = new RegExp(search, 'i');

        const responseStructure = {
            muscles: await this.Muscle.find({ name: { $regex: searchRegex } })
                .skip(skip)
                .limit(limit)
                .sort(sort),
            page,
            totalResults: await this.Muscle.countDocuments({ name: { $regex: searchRegex } }),
            totalPages: Math.ceil(await this.Muscle.countDocuments({ name: { $regex: searchRegex } }) / limit)
        };

        await setInCache(key, responseStructure, this.ttl);

        return responseStructure;
    }

    async getMuscleById(muscleId) {
        const key = this.getMuscleCacheKey(muscleId);
        const cachedMuscle = await getFromCache(key);

        if (cachedMuscle) {
            return cachedMuscle;
        }

        const muscle = await this.Muscle.findById(muscleId);

        if (!muscle) {
            throw new APIError(404, 'Muscle not found.');
        }

        await setInCache(key, muscle, this.ttl);

        return muscle;
    }

    async getMuscleByName(muscleName) {
        const  key = this.getMuscleCacheKey(muscleName);
        const cachedMuscle = await getFromCache(key);

        if (cachedMuscle) {
            return cachedMuscle;
        }

        const muscle = await this.Muscle.findOne({ name: muscleName });
        
        if (!muscle) {
            throw new APIError(404, 'Muscle not found.');
        }

        await setInCache(key, muscle, this.ttl);

        return muscle;
    }

    async createMuscle(muscleData) {
        const muscle = new this.Muscle(muscleData);

        const [] = await Promise.all([
            muscle.save(),
            this.invalidateMusclesCache(),
            this.invalidateMuscleCacheKey(muscle._id),
            this.invalidateMuscleCacheKey(muscle.name)
        ]);

        return muscle;
    }

    async updateMuscle(muscleId, muscleData) {
        const muscle = await this.Muscle.findByIdAndUpdate(muscleId, muscleData, { new: true });
        if (!muscle) {
            throw new APIError(404, 'Muscle not found.');
        }

        const [] = await Promise.all([
            this.invalidateMusclesCache(),
            setInCache(this.getMuscleCacheKey(muscleId), muscle, this.ttl),
            setInCache(this.getMuscleCacheKey(muscle.name), muscle, this.ttl)
        ]);

        return muscle;
    }

    async deleteMuscle(muscleId) {
        const muscle = await this.Muscle.findByIdAndDelete(muscleId);

        if (!muscle) {
            throw new APIError(404, 'Muscle not found.');
        }
        
        const [] = await Promise.all([
            this.invalidateMusclesCache(),
            this.invalidateMuscleCacheKey(muscle._id),
            this.invalidateMuscleCacheKey(muscle.name)
        ]);

        return muscle;
    }
}