import APIError from "../../utils/APIError.js";


export default class MuscleService {
    constructor(muscleModel) {
        this.Muscle = muscleModel;
    }

    async getAllMuscles(page, limit, search, sortBy, sortOrder) {
        const skip = (page - 1) * limit;
        const sort = { [sortBy]: sortOrder === 'asc' ? 1 : -1 };
        const searchRegex = new RegExp(search, 'i');

        return {
            muscles: await this.Muscle.find({ name: { $regex: searchRegex } })
                .skip(skip)
                .limit(limit)
                .sort(sort),
            page,
            totalResults: await this.Muscle.countDocuments({ name: { $regex: searchRegex } }),
            totalPages: Math.ceil(await this.Muscle.countDocuments({ name: { $regex: searchRegex } }) / limit)
        };
    }

    async getMuscleById(muscleId) {
        const muscle = await this.Muscle.findById(muscleId);

        if (!muscle) {
            throw new APIError(404, 'Muscle not found.');
        }
        
        return muscle;
    }

    async createMuscle(muscleData) {
        const muscle = new this.Muscle(muscleData);
        await muscle.save();
        return muscle;
    }

    async updateMuscle(muscleId, muscleData) {
        const muscle = await this.Muscle.findByIdAndUpdate(muscleId, muscleData, { new: true });
        if (!muscle) {
            throw new APIError(404, 'Muscle not found.');
        }
        return muscle;
    }

    async deleteMuscle(muscleId) {
        const muscle = await this.Muscle.findByIdAndDelete(muscleId);
        if (!muscle) {
            throw new APIError(404, 'Muscle not found.');
        }
        return muscle;
    }
}