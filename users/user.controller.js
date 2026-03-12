import User from "./user.model.js";
import APIResponse from "../utils/APIResponse.js";
import APIError from "../utils/APIError.js";
import UserService from "./user.service.js";

const userService = new UserService(User);

// @Desc: Get all users
// @Route: GET /api/v1/users?page=1&limit=10&search=keyword&sortBy=username&sortOrder=asc
// @Access: Private
export const getAllUsers = async (req, res) => {
    try {
        const { page = 1, limit = 10, search = '', sortBy = 'createdAt', sortOrder = 'desc' } = req.query;
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
        res.status(500).json(new APIError(err.statusCode || 500, null, err.message || 'Failed to fetch users'));
    }
}

// @Desc: Get user by ID
// @Route: GET /api/v1/users/:id
// @Access: Private
export const getUserById = async (req, res) => {
    try {
        const userId = req.params.id;
        const user = await userService.getUserById(userId);

        if (!user) {
            return res.status(404).json(new APIResponse(404, null, 'User not found'));
        }
        
        res.status(200).json(new APIResponse(200, { user }, 'User fetched successfully'));

    } catch (err) {
        console.error('Error fetching user:', err);
        res.status(500).json(new APIError(err.statusCode || 500, null, err.message || 'Failed to fetch user'));
    }
}

// @Desc: Update user profile picture
// @Route: PATCH /api/v1/users/:id/profile-picture
// @Access: Private (user can only update their own profile picture)
export const updateProfilePicture = async (req, res) => {
    try {
        const userId = req.params.id;
        const user = await userService.updateProfilePicture(userId, req.file);

        res.status(200).json(new APIResponse(200, { user }, 'Profile picture updated successfully'));
    } catch (err) {
        console.error('Error updating profile picture:', err);
        res.status(500).json(new APIError(err.statusCode || 500, null, err.message || 'Failed to update profile picture'));
    }
}

// @Desc: Update user cover image
// @Route: PATCH /api/v1/users/:id/cover
// @Access: Private (user can only update their own cover image)
export const updateCoverImage = async (req, res) => {
    try {
        const userId = req.params.id;
        const user = await userService.updateCoverImage(userId, req.file);

        res.status(200).json(new APIResponse(200, { user }, 'Cover image updated successfully'));
    } catch (err) {
        console.error('Error updating cover image:', err);
        res.status(500).json(new APIError(err.statusCode || 500, null, err.message || 'Failed to update cover image'));
    }
}