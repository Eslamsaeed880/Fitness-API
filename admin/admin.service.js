export default class AdminService {
    constructor (UserService, MuscleService) {
        this.userService = UserService;
        this.muscleService = MuscleService;
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

        if(!muscle) {
            throw new APIError(404, 'Muscle not found.');
        }

        return muscle;
    }

    async deleteMuscle(muscleId) {
        const muscle = await this.muscleService.deleteMuscle(muscleId);

        if(!muscle) {
            throw new APIError(404, 'Muscle not found.');
        }

        return muscle;
    }
}