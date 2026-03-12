import APIError from "../utils/APIError.js";


export default class UserService {
    constructor(userModel) {
        this.User = userModel;
    }

    async getAllUsers(page, limit, search, sortBy, sortOrder) {
        const skip = (page - 1) * limit;
        const sort = { [sortBy]: sortOrder === 'asc' ? 1 : -1 };
        const searchRegex = new RegExp(search, 'i');

        return {
            user: await this.User.find({
                $or: [
                    { username: { $regex: searchRegex } },
                    { fullName: { $regex: searchRegex } },
                    { email: { $regex: searchRegex } }
                ]
            })
            .skip(skip)
            .limit(limit)
            .sort(sort)
            .select('-password -numberOfFollowers -birthDay -role -__v -createdAt -updatedAt -resetToken -resetTokenExpiry -gender -coverImage -profilePicture -socialLinks -location'),
            page,
            totalResults: await this.User.countDocuments({
                $or: [
                    { username: { $regex: searchRegex } },
                    { fullName: { $regex: searchRegex } },
                    { email: { $regex: searchRegex } }
                ]
            }),
            totalPages: Math.ceil(await this.User.countDocuments({
                $or: [
                    { username: { $regex: searchRegex } },
                    { fullName: { $regex: searchRegex } },
                    { email: { $regex: searchRegex } }
                ]
            }) / limit)
        }
    
    }

    async getUserById(userId) {
        const user = await this.User.findById(userId).select('-password -birthDay -role -__v -createdAt -updatedAt -resetToken -resetTokenExpiry -gender -location');
        if (!user) {
            throw new APIError(404, 'User not found.');
        }
        return user;
    }

    async deleteUser(userId) {
        const user = await this.User.findByIdAndDelete(userId);
        if (!user) {
            throw new APIError(404, 'User not found.');
        }
        return user;
    }

    async updateUserRole(userId, newRole) {
        const user = await this.User.findById(userId);
        if (!user) {
            throw new APIError(404, 'User not found.');
        }
        user.role = newRole;
        await user.save();

        return user;
    }

}