

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
        return await this.User.findById(userId).select('-password -birthDay -role -__v -createdAt -updatedAt -resetToken -resetTokenExpiry -gender -location');
    }

    async deleteUser(userId) {
        return await this.User.findByIdAndDelete(userId);
    }

}