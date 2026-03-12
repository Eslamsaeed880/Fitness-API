export default class AdminService {
    constructor (UserService) {
        this.userService = UserService;
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
        const user = await this.userService.updateUserRole(userId, newRole);
        return user;
    }
}