import APIError from '../../utils/APIError.js';
import { v2 } from 'cloudinary';
import config from '../../config/config.js';

v2.config({
    cloud_name: config.cloudinary.cloudName,
    api_key: config.cloudinary.apiKey,
    api_secret: config.cloudinary.apiSecret,
});

export default class MediaService {
    constructor() {
        this.cloudinary = v2;
    }

    async uploadToCloudinary(filePath, folder) {
        try {
            const result = await this.cloudinary.uploader.upload(filePath, {
                folder,
                resource_type: 'auto'
            });

            return {
                url: result.secure_url,
                publicId: result.public_id,
                duration: result.duration
            };
        } catch (err) {
            console.error('Error uploading image:', err);
            throw new APIError(500, 'Failed to upload image');
        }
    }

    async deleteFromCloudinary(publicId, type = 'image') {
        try {
            await this.cloudinary.uploader.destroy(publicId, {
                resource_type: `${type}`
            });
            
        } catch (err) {
            console.error('Error deleting image:', err);
            throw new APIError(500, 'Failed to delete image');
        }
    }
}