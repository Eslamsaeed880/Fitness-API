import User from "./user.model.js";
import APIResponse from "../utils/APIResponse.js";
import APIError from "../utils/APIError.js";
import UserService from "./user.service.js";

// @Desc: Get all users
// @Route: GET /api/v1/users?page=1&limit=10&search=keyword&sortBy=username&sortOrder=asc
// @Access: Private
export const getAllUsers = async (req, res) => {
    try {
        const { page = 1, limit = 10, search = '', sortBy = 'createdAt', sortOrder = 'desc' } = req.query;
        const userService = new UserService(User);
        const users = await userService.getAllUsers(parseInt(page), parseInt(limit), search, sortBy, sortOrder);

        const totalResults = await User.countDocuments({
            $or: [
                { username: { $regex: new RegExp(search, 'i') } },
                { fullName: { $regex: new RegExp(search, 'i') } },
                { email: { $regex: new RegExp(search, 'i') } }
            ]
        });
        const totalPages = Math.ceil(totalResults / limit);

        res.status(200).json(new APIResponse(200, { users, page, totalPages, totalResults }, 'Users fetched successfully'));

    } catch (err) {
        console.error('Error fetching users:', err);
        res.status(500).json(new APIResponse(err.statusCode || 500, null, err.message || 'Failed to fetch users'));
    }
}