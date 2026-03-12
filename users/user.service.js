import APIError from "../utils/APIError.js";
import { uploadToCloudinary } from "../utils/cloudinary.js";

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

    async updateProfilePicture(userId, file) {
        const user = await this.User
            .findOne({ _id: userId })
            .select('-password -email -resetToken -__v -resetTokenExpiry -authProvider -role -watchedVideos');
    
        if (!user) {
            throw new APIError(404, 'User not found.');
        }
    
        if (user._id.toString() !== userId) {
            throw new APIError(403, 'Unauthorized to update this profile.');
        }
    
        if (!file) {
            user.profilePicture.publicId = undefined;
            user.profilePicture.url = undefined;
            await user.save();
            // await invalidateUserCaches('profile:' + userId);
            return user;
        }
    
        const uploaded = await uploadToCloudinary(file.path, 'profile_pictures');
        if(!uploaded || !uploaded.url || !uploaded.public_id) {
            throw new APIError(500, "Failed to upload profile picture");
        }

        user.profilePicture.publicId = uploaded.public_id;
        user.profilePicture.url = uploaded.url;
        await user.save();
        return user;
    }
}