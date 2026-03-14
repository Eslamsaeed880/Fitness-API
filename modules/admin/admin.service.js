import APIError from "../../utils/APIError.js";

export default class AdminService {
    constructor (UserService, MuscleService, ExerciseService, ExerciseRequestService) {
        this.userService = UserService;
        this.muscleService = MuscleService;
        this.exerciseService = ExerciseService;
        this.exerciseRequestService = ExerciseRequestService;
    }

    async getAllUsers(page, limit, search, sortBy, sortOrder) {
        return await this.userService.getAllUsers(page, limit, search, sortBy, sortOrder);
    }

    async getUserById(userId) {
        return await this.userService.getUserById(userId);
    }

    async deleteUser(userId) {
        return await this.userService.deleteUser(userId);
    }

    async updateUserRole(userId, newRole) {
        return await this.userService.updateUserRole(userId, newRole);
    }

    async getAllMuscles(page, limit, search, sortBy, sortOrder) {
        return await this.muscleService.getAllMuscles(page, limit, search, sortBy, sortOrder);
    }

    async getMuscleById(muscleId) {
        return await this.muscleService.getMuscleById(muscleId);
    }

    async createMuscle(muscleData) {
        const muscle = await this.muscleService.createMuscle(muscleData);
        return muscle;
    }

    async updateMuscle(muscleId, muscleData) {
        const muscle = await this.muscleService.updateMuscle(muscleId, muscleData);
        return muscle;
    }

    async deleteMuscle(muscleId) {
        const muscle = await this.muscleService.deleteMuscle(muscleId);
        return muscle;
    }

    async getAllExercises(page, limit, search, sortBy, sortOrder) {
        return await this.exerciseService.getAllExercises(page, limit, search, sortBy, sortOrder);
    }

    async getExerciseById(exerciseId) {
        return await this.exerciseService.getExerciseById(exerciseId);
    }

    async createExercise(exerciseData, file) {
        const exercise = await this.exerciseService.createExercise(exerciseData, file);
        return exercise;
    }

    async updateExercise(exerciseId, exerciseData, file) {
        const exercise = await this.exerciseService.updateExercise(exerciseId, exerciseData, file);
        return exercise;
    }

    async deleteExercise(exerciseId) {
        const exercise = await this.exerciseService.deleteExercise(exerciseId);
        return exercise;
    }

    async getExerciseRequests(page, limit, status, search) {
        return await this.exerciseRequestService.getExerciseRequests(page, limit, status, search);
    }

    async getExerciseRequestById(exerciseRequestId) {
        return await this.exerciseRequestService.getExerciseRequestById(exerciseRequestId);
    }

    async deleteExerciseRequest(exerciseRequestId) {
        return await this.exerciseRequestService.deleteExerciseRequest(exerciseRequestId);
    }

    async updateExerciseRequestStatus(exerciseRequestId, status) {
        const exerciseRequest = await this.exerciseRequestService.getExerciseRequestById(exerciseRequestId);

        if(status === 'approved') {
            const exercise = await this.exerciseService.getExerciseByName(exerciseRequest.name);
            if(exercise) {
                throw new APIError(400, "An exercise with the same name already exists. Please ask the requester to choose a different name or modify the existing exercise.");
            }
        }

        const updatedExerciseRequest = await this.exerciseRequestService.updateExerciseRequestStatus(exerciseRequestId, status);


        return updatedExerciseRequest;
    }

}