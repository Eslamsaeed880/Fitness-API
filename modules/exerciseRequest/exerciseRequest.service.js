import APIError from "../../utils/APIError.js";

export default class ExerciseRequestService {
    constructor(ExerciseRequestModel, exerciseService, mediaService, muscleService, userService) {
        this.ExerciseRequest = ExerciseRequestModel;
        this.exerciseService = exerciseService;
        this.mediaService = mediaService;
        this.muscleService = muscleService;
        this.userService = userService;
    }

    async createExerciseRequest(exerciseData, file) {
        exerciseData.equipments = this.exerciseService.toEquipmentsArray(exerciseData.equipments) || [];

        const primaryMuscle = await this.muscleService.getMuscleByName(exerciseData.primaryMuscle);
        const secondaryMuscle = await this.muscleService.getMuscleByName(exerciseData.secondaryMuscle);
        
        if (!primaryMuscle) {
            throw new APIError(400, 'Primary muscle group not found.');
        }
        
        if(exerciseData.secondaryMuscle && !secondaryMuscle) {
            throw new APIError(400, 'Secondary muscle not found.');
        }
        
        const exerciseRequest = new this.ExerciseRequest(exerciseData);

        if (file) {
            const uploaded = await this.mediaService.uploadToCloudinary(file.path, 'media');
            exerciseRequest.media = {
                url: uploaded.url,
                publicId: uploaded.publicId,
            };

            await exerciseRequest.save();
        } else {
            throw new APIError(400, 'Media file is required for exercise request creation.');
        }

        return exerciseRequest;
    }

    async getExerciseRequests(page = 1, limit = 10, status, search) {
        const skip = (page - 1) * limit;
        const filter = {};

        if (status) {
            filter.status = status;
        }

        if (search) {
            filter.$or = [
                { name: { $regex: search, $options: 'i' } },
                { description: { $regex: search, $options: 'i' } }
            ];
        }

        return {
            exerciseRequest: await this.ExerciseRequest.find(filter)
                .populate('createdBy', 'username')
                .skip(skip)
                .limit(limit),
            page,
            totalResults: await this.ExerciseRequest.countDocuments(filter),
            totalPages: Math.ceil(await this.ExerciseRequest.countDocuments(filter) / limit)
        }
    }

    async getMyExerciseRequests(userId) {
        return await this.ExerciseRequest
            .find({ createdBy: userId })
            .populate('createdBy', 'username')
            .select('-__v -updatedAt -movementType -media -secondaryMuscle -equipments')
            .sort({ createdAt: -1 });
    }

    async getExerciseRequestById(id) {
        const exerciseRequest = await this.ExerciseRequest.findById(id).populate('createdBy', 'username');

        if (!exerciseRequest) {
            throw new APIError(404, 'Exercise request not found');
        }

        return exerciseRequest;
    }

    async updateExerciseRequest(id, exerciseData, file) {
        exerciseData.equipments = this.exerciseService.toEquipmentsArray(exerciseData.equipments) || [];

        if(exerciseData.primaryMuscle) {
            const primaryMuscle = await this.muscleService.getMuscleByName(exerciseData.primaryMuscle);

            if (!primaryMuscle) {
                throw new APIError(400, 'Primary muscle group not found.');
            }
        }

        if(exerciseData.secondaryMuscle) {
            const secondaryMsucle = await this.muscleService.getMuscleByName(exerciseData.secondaryMuscle);

            if (!secondaryMsucle) {
                throw new APIError(400, 'Secondary muscle not found.');
            }
        }

        const exerciseRequest = await this.ExerciseRequest.findByIdAndUpdate(id, exerciseData, { new: true });

        if (!exerciseRequest) {
            throw new APIError(404, 'Exercise request not found');
        }
        
        if (file) {
            const uploaded = await this.mediaService.uploadToCloudinary(file.path, 'media');
            exerciseRequest.media = {
                url: uploaded.url,
                publicId: uploaded.publicId,
            };

            await exerciseRequest.save();
        }
        
        
        return exerciseRequest;
    }

    async updateExerciseRequestStatus(id, status) {
        const exerciseRequest = await this.ExerciseRequest.findByIdAndUpdate(id, { status }, { new: true });
        
        if (!exerciseRequest) {
            throw new APIError(404, 'Exercise request not found');
        }

        if (exerciseRequest.status === 'approved') {
            const exerciseData = {
                name: exerciseRequest.name,
                description: exerciseRequest.description,
                primaryMuscle: exerciseRequest.primaryMuscle,
                secondaryMuscles: exerciseRequest.secondaryMuscles,
                equipments: exerciseRequest.equipments,
                movementType: exerciseRequest.movementType,
                media: exerciseRequest.media
            };

            await this.exerciseService.acceptExerciseRequest(exerciseData);
        }

        return exerciseRequest;
    }

    async deleteExerciseRequest(id) {
        const exerciseRequest = await this.ExerciseRequest.findByIdAndDelete(id);

        if (!exerciseRequest) {
            throw new APIError(404, 'Exercise request not found');
        }

        return exerciseRequest;
    }
}