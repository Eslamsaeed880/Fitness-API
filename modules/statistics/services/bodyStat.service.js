import APIError from "../../../utils/APIError.js";
import { getFromCache, invalidateCache, setInCache } from "../../../infrastructure/cache/cacheAside.js";

export default class BodyStatService {
    constructor(BodyStatModel) {
        this.BodyStatModel = BodyStatModel;
        this.prefix = 'body-stats';
    }

    async addBodyStat(userId, bodyStats) {
        try {
            const newStat = new this.BodyStatModel({ userId, ...bodyStats });

            const [] = await Promise.all([
                newStat.save(),
                invalidateCache(`${this.prefix}:${userId}`)
            ]);

            return { success: true };
        } catch (err) {
            console.error('Error in addBodyStat:', err);
            throw new APIError(500, 'Failed to add body stat');
        }
     }

    async getBodyStatsForUser(userId) {
    try {
        const key = `${this.prefix}:${userId}`;
        const cachedStats = await getFromCache(key);
        if (cachedStats) {
            return cachedStats;
        }

        const stats = await this.BodyStatModel.find({ userId }).sort({ createdAt: -1 }).lean();
        await setInCache(key, stats);
        return stats;
    } catch (err) {
        console.error('Error in getBodyStatsForUser:', err);
        throw new APIError(500, 'Failed to fetch body stats');
        }
    }

    async deleteBodyStat(userId, bodyStatId) {
        try {
            const result = await this.BodyStatModel.deleteOne({ userId, _id: bodyStatId });

            const [] = await Promise.all([
                invalidateCache(`${this.prefix}:${userId}`),
                invalidateCache(`${this.prefix}:${bodyStatId}:${userId}`)
            ]);

            return { success: result.deletedCount > 0 };
        } catch (err) {
            console.error('Error in deleteBodyStat:', err);
            throw new APIError(500, 'Failed to delete body stat');
        }
    }

    async updateBodyStat(userId, bodyStatId, updates) {
        try {
            const stat = await this.BodyStatModel.findOne({ userId, _id: bodyStatId });
            if (!stat) {
                throw new APIError(404, 'Body stat not found');
            }

            stat.weightKg = updates.weightKg !== undefined ? updates.weightKg : stat.weightKg;
            stat.bodyFat = updates.bodyFat !== undefined ? updates.bodyFat : stat.bodyFat;
            stat.muscleMassKg = updates.muscleMassKg !== undefined ? updates.muscleMassKg : stat.muscleMassKg;
            stat.goal = updates.goal !== undefined ? updates.goal : stat.goal;
            console.log('Updated stat values:', {
                weightKg: stat.weightKg,
                bodyFat: stat.bodyFat,
                muscleMassKg: stat.muscleMassKg,
                goal: stat.goal
            });

            const [] = await Promise.all([
                stat.save(),
                setInCache(`${this.prefix}:${bodyStatId}:${userId}`, stat),
                invalidateCache(`${this.prefix}:${userId}`)
            ]);

            return { success: true };
        } catch (err) {
            console.error('Error in updateBodyStat:', err);
            throw new APIError(500, 'Failed to update body stat');
        }
    }

    async getBodyStatById(userId, bodyStatId) {
        try {
            const key = `${this.prefix}:${bodyStatId}:${userId}`;
            const cachedStat = await getFromCache(key);
            if (cachedStat) {
                return cachedStat;
            }

            const stat = await this.BodyStatModel.findOne({ userId, _id: bodyStatId }).lean();
            if (!stat) {
                throw new APIError(404, 'Body stat not found');
            }

            await setInCache(key, stat);

            return stat;
        } catch (err) {
            console.error('Error in getBodyStatById:', err);
            if (err instanceof APIError) {
                throw err;
            }
            throw new APIError(500, 'Failed to fetch body stat by ID');
        }
    }
}