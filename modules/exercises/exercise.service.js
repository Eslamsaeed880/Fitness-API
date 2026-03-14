import APIError from "../../utils/APIError.js";
import MediaService from "../../infrastructure/media/media.service.js";

export default class ExerciseService {
    constructor(exerciseModel, muscleService) {
        this.Exercise = exerciseModel;
        this.muscleService = muscleService;
        this.mediaService = new MediaService();
    }

    toEquipmentsArray(value) {
        if (value === undefined || value === null || value === '') {
            return undefined;
        }

        if (Array.isArray(value)) {
            return value;
        }

        if (typeof value === 'string') {
            let parsed;
            try {
                parsed = JSON.parse(value);
            } catch (err) {
                throw new APIError(400, 'equipments must be a valid JSON array');
            }
            if (!Array.isArray(parsed)) {
                throw new APIError(400, 'equipments must be an array');
            }
            return parsed;
        }

        throw new APIError(400, 'equipments must be an array');
    }

    async getAllExercises(page, limit, search, sortBy, sortOrder) {
        const skip = (page - 1) * limit;
        const sort = { [sortBy]: sortOrder === 'asc' ? 1 : -1 };
        const searchRegex = new RegExp(search, 'i');

        return {
            exercises: await this.Exercise.find({ name: { $regex: searchRegex } })
                .skip(skip)
                .limit(limit)
                .sort(sort)
                .select('-__v -createdAt -updatedAt -movementType -equipments -secondaryMuscle'),
            page,
            totalResults: await this.Exercise.countDocuments({ name: { $regex: searchRegex } }),
            totalPages: Math.ceil(await this.Exercise.countDocuments({ name: { $regex: searchRegex } }) / limit)
        };
    }

    async getExerciseById(exerciseId) {
        const exercise = await this.Exercise.findById(exerciseId);

        if (!exercise) {
            throw new APIError(404, 'Exercise not found.');
        }
        
        return exercise;
    }

    async createExercise(exerciseData, file) {
        exerciseData.equipments = this.toEquipmentsArray(exerciseData.equipments) || [];

        const primaryMuscle = await this.muscleService.getMuscleByName(exerciseData.primaryMuscle);
        const secondaryMuscle = await this.muscleService.getMuscleByName(exerciseData.secondaryMuscle);
        
        if (!primaryMuscle) {
            throw new APIError(400, 'Primary muscle group not found.');
        }
        
        if(exerciseData.secondaryMuscle && !secondaryMuscle) {
            throw new APIError(400, 'Secondary muscle not found.');
        }
        
        const exercise = new this.Exercise(exerciseData);

        if (file) {
            const uploaded = await this.mediaService.uploadToCloudinary(file.path, 'media');
            exercise.media = {
                url: uploaded.url,
                publicId: uploaded.publicId,
            };

            await exercise.save();
        } else {
            throw new APIError(400, 'Media file is required for exercise creation.');
        }

        return exercise;
    }

    async updateExercise(exerciseId, exerciseData, file) {
        const parsedEquipments = this.toEquipmentsArray(exerciseData.equipments);
        if (parsedEquipments !== undefined) {
            exerciseData.equipments = parsedEquipments;
        } else {
            delete exerciseData.equipments;
        }

        const exercise = await this.Exercise.findByIdAndUpdate(exerciseId, exerciseData, { new: true });
        if (!exercise) {
            throw new APIError(404, 'Exercise not found.');
        }

        if (file) {
            const uploaded = await this.mediaService.uploadToCloudinary(file.path, 'media');
            exercise.media = {
                url: uploaded.url,
                publicId: uploaded.publicId,
            };
        }

        await exercise.save();

        return exercise;
    }

    async acceptExerciseRequest(exerciseRequest) {
        const exerciseData = {
            name: exerciseRequest.name,
            description: exerciseRequest.description,
            primaryMuscle: exerciseRequest.primaryMuscle,
            secondaryMuscle: exerciseRequest.secondaryMuscle,
            equipments: exerciseRequest.equipments,
            movementType: exerciseRequest.movementType,
            media: exerciseRequest.media
        };

        const exercise = await new this.Exercise(exerciseData);
        await exercise.save();
        
        return exercise;
    }

    async deleteExercise(exerciseId) {
        const exercise = await this.Exercise.findByIdAndDelete(exerciseId);
        if (!exercise) {
            throw new APIError(404, 'Exercise not found.');
        }
        return exercise;
    }
}