export default class AdminService {
    constructor (UserService) {
        this.userService = UserService;
    }

    async getAllUsers(page, limit, search, sortBy, sortOrder) {
        return await this.userService.getAllUsers(page, limit, search, sortBy, sortOrder);
    }
}