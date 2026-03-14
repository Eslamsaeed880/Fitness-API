import APIError from "../../utils/APIError.js";

export default class ExerciseRequestService {
    constructor(ExerciseRequestModel, exerciseService, mediaService, muscleService) {
        this.ExerciseRequest = ExerciseRequestModel;
        this.exerciseService = exerciseService;
        this.mediaService = mediaService;
        this.muscleService = muscleService;
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

    async getExerciseRequests(filter = {}) {
        return await this.ExerciseRequest.find(filter).populate('createdBy', 'username');
    }

    async getExerciseRequestById(id) {
        const exerciseRequest = await this.ExerciseRequest.findById(id).populate('createdBy', 'username');

        if (!exerciseRequest) {
            throw new APIError(404, 'Exercise request not found');
        }

        return exerciseRequest;
    }

    async updateExerciseRequest(id, updateData) {
        const exerciseRequest = await this.ExerciseRequest.findByIdAndUpdate(id, updateData, { new: true });

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

            await this.exerciseService.createExercise(exerciseData);
        }

        if (!exerciseRequest) {
            throw new APIError(404, 'Exercise request not found');
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