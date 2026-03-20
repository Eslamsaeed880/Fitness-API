import User from '../users/user.model.js';
// import Exercise from '../models/exercise.model.js';
// import Post from '../../models/post.model.js';
import Muscle from '../muscles/muscle.model.js';
import Exercise from '../exercises/exercise.model.js';
import APIError from '../../utils/APIError.js';
import APIResponse from '../../utils/APIResponse.js';
import UserService from '../users/user.service.js';
import MuscleService from '../muscles/muscle.service.js';
import ExerciseService from '../exercises/exercise.service.js';
import AdminService from './admin.service.js';
import ExerciseRequest from '../exerciseRequest/exerciseRequest.model.js';
import ExerciseRequestService from '../exerciseRequest/exerciseRequest.service.js';


const adminService = new AdminService(
        new UserService(User), 
        new MuscleService(Muscle), 
        new ExerciseService(Exercise, new MuscleService(Muscle)),
        new ExerciseRequestService(
            ExerciseRequest, 
            new ExerciseService(Exercise, new MuscleService(Muscle)),
            null,
            null,
            null
        )
    );
    
// @Desc: Get all users with pagination, search, and sorting
// @Route: /api/v1/admin/users?page=1&limit=10&search=keyword&sort=asc
// @Access: Admin only
export const getAllUsers = async (req, res) => {
    try {
        const { page = 1, limit = 10, search = '', sort = 'asc' } = req.query;
        const users = await adminService.getAllUsers(parseInt(page), parseInt(limit), search, 'createdAt', sort);

        res.status(200).json(new APIResponse(200, {users}, 'Users retrieved successfully.'));
        
    } catch (err) {
        console.log(err.message);
        const status = err.statusCode || 500;
        res.status(status).json(new APIError(status, err.message || 'Server error.'));
    }
};

// @Desc: Get user by ID
// @Route: /api/v1/admin/users/:id
// @Access: Admin only
export const getUserById = async (req, res) => {
    try {
        const userId = req.params.id;
        const user = await adminService.getUserById(userId);

        res.status(200).json(new APIResponse(200, { user }, 'User retrieved successfully.'));
    } catch (err) {
        const status = err.statusCode || 500;
        res.status(status).json(new APIError(status, err.message || 'Server error.'));
    }
};

// @Desc: Delete user by ID
// @Route: /api/v1/admin/users/:id
// @Access: Admin only
export const deleteUser = async (req, res) => {
    try {
        const userId = req.params.id;
        await adminService.deleteUser(userId);

        res.status(200).json(new APIResponse(200, {}, 'User deleted successfully.'));
    } catch (err) {
        const status = err.statusCode || 500;
        res.status(status).json(new APIError(status, err.message || 'Server error.'));
    }
};

// @Desc: Update user role
// @Route: /api/v1/admin/users/:id
// @Access: Admin only
export const updateUserRole = async (req, res) => {
    try {
        const { role } = req.body;
        const userId = req.params.id;
        await adminService.updateUserRole(userId, role);

        res.status(200).json(new APIResponse(200, {}, 'User role updated successfully.'));
    } catch (err) {
        const status = err.statusCode || 500;
        res.status(status).json(new APIError(status, err.message || 'Server error.'));
    }
};

// @Desc: Create new muscle
// @Route: /api/v1/admin/muscles
// @Access: Admin only
export const createMuscle = async (req, res) => {
    try {
        const { name, description } = req.body;

        const muscle = await adminService.createMuscle({ name, description });

        res.status(201).json(new APIResponse(201, { muscle }, 'Muscle created successfully.'));

    } catch (err) {
        const status = err.statusCode || 500;

        if(err.code === 11000) {
            return res.status(400).json(new APIError(400, 'Muscle with this name already exists.'));
        }
        res.status(status).json(new APIError(status, err.message || 'Server error.'));
    }
}

// @Desc: Get all muscles
// @Route: /api/v1/admin/muscles?search=keyword&page=1&limit=10&sortOrder=asc&sortBy=name
// @Access: Admin only
export const getAllMuscles = async (req, res) => {
    try {
        const { page = 1, limit = 10, search = '', sortOrder = 'asc', sortBy = 'name' } = req.query;

        const muscles = await adminService.getAllMuscles(page, limit, search, sortBy, sortOrder);

        res.status(200).json(new APIResponse(200, muscles, 'Muscles retrieved successfully.'));
    } catch (err) {
        const status = err.statusCode || 500;
        res.status(status).json(new APIError(status, err.message || 'Server error.'));
    }
};

// @Desc: Get muscle by ID
// @Route: /api/v1/admin/muscles/:id
// @Access: Admin only
export const getMuscleById = async (req, res) => {
    try {
        const muscleId = req.params.id;
        const muscle = await adminService.getMuscleById(muscleId);

        res.status(200).json(new APIResponse(200, { muscle }, 'Muscle retrieved successfully.'));
    } catch (err) {
        const status = err.statusCode || 500;
        res.status(status).json(new APIError(status, err.message || 'Server error.'));
    }
}

// @Desc: Update muscle by ID
// @Route: /api/v1/admin/muscles/:id
// @Access: Admin only
export const updateMuscle = async (req, res) => {
    try {
        const { name, description } = req.body;
        const muscleId = req.params.id;
        const muscle = await adminService.updateMuscle(muscleId, { name, description });

        res.status(200).json(new APIResponse(200, { muscle }, 'Muscle updated successfully.'));
    } catch (err) {
        if(err.code === 11000) {
            return res.status(400).json(new APIError(400, 'Muscle with this name already exists.'));
        }
        const status = err.statusCode || 500;
        res.status(status).json(new APIError(status, err.message || 'Server error.'));
    }
}

// @Desc: Delete muscle by ID
// @Route: /api/v1/admin/muscles/:id
// @Access: Admin only
export const deleteMuscle = async (req, res) => {
    try {
        const muscleId = req.params.id;
        const muscle = await adminService.deleteMuscle(muscleId);

        res.status(200).json(new APIResponse(200, { muscle  }, 'Muscle deleted successfully.'));

    } catch (err) {
        const status = err.statusCode || 500;
        res.status(status).json(new APIError(status, err.message || 'Server error.'));
    }
}

// @Desc: Create new exercise
// @Route: /api/v1/admin/exercises
// @Access: Admin only
export const createExercise = async (req, res) => {
    try {
        const { 
            name, 
            description, 
            primaryMuscle, 
            secondaryMuscle, 
            equipments, 
            movementType 
        } = req.body;
        const userId = req.user.id;

        const exercise = await adminService.createExercise({ 
            name, 
            description, 
            primaryMuscle, 
            secondaryMuscle, 
            equipments,
            movementType,
            createdBy: userId, 
        }, 
        req.file);

        res.status(201).json(new APIResponse(201, { exercise }, 'Exercise created successfully.'));
    } catch (err) {
        const status = err.statusCode || 500;
        res.status(status).json(new APIError(status, err.message || 'Server error.'));
    }
};

// @Desc: Get all exercises with pagination, search, and sorting
// @Route: /api/v1/admin/exercises?page=1&limit=10&search=keyword&sortBy=name&sortOrder=asc
// @Access: Admin only
export const getAllExercises = async (req, res) => {
    try {
        const { page = 1, limit = 10, search = '', sortBy = 'createdAt', sortOrder = 'desc' } = req.query;
        const exercises = await adminService.getAllExercises(page, limit, search, sortBy, sortOrder);

        res.status(200).json(new APIResponse(200, exercises, 'Exercises retrieved successfully.'));
    } catch (err) {
        const status = err.statusCode || 500;
        res.status(status).json(new APIError(status, err.message || 'Server error.'));
    }
};

// @Desc: Get exercise by ID
// @Route: /api/v1/admin/exercises/:id
// @Access: Admin only
export const getExerciseById = async (req, res) => {
    try {
        const exerciseId = req.params.id;
        const exercise = await adminService.getExerciseById(exerciseId);
        
        res.status(200).json(new APIResponse(200, { exercise }, 'Exercise retrieved successfully.'));
    } catch (err) {
        const status = err.statusCode || 500;
        res.status(status).json(new APIError(status, err.message || 'Server error.'));
    }
};
// @Desc: Update exercise by ID
// @Route: /api/v1/admin/exercises/:id
// @Access: Admin only
export const updateExercise = async (req, res) => {
    try {
        const { 
            name, 
            description,
            primaryMuscle,
            secondaryMuscle,
            equipments,
            movementType
        } = req.body;

        const exercise = await adminService.updateExercise(req.params.id, { 
            name, 
            description,
            primaryMuscle,
            secondaryMuscle,
            equipments,
            movementType
        }, req.file);

        res.status(200).json(new APIResponse(200, exercise, 'Exercise updated successfully.'));
    } catch (err) {
        const status = err.statusCode || 500;
        res.status(status).json(new APIError(status, err.message || 'Server error.'));
    }
};

// @Desc: Delete exercise by ID
// @Route: /api/v1/admin/exercises/:id
// @Access: Admin only
export const deleteExercise = async (req, res) => {
    try {
        const exerciseId = req.params.id;
        const exercise = await adminService.deleteExercise(exerciseId);

        res.status(200).json(new APIResponse(200, exercise, 'Exercise deleted successfully.'));
    } catch (err) {
        const status = err.statusCode || 500;
        res.status(status).json(new APIError(status, err.message || 'Server error.'));
    }
};

// @Desc: Get exercise requests with pagination, search, and filtering by status
// @Route: /api/v1/admin/exercise-requests?page=1&limit=10&status=pending&search=keyword
// @Access: Admin only
export const getExerciseRequests = async (req, res) => {
    try {
        const { page = 1, limit = 10, status, search = '' } = req.query;
        const exerciseRequests = await adminService.getExerciseRequests(page, limit, status, search);

        res.status(200).json(new APIResponse(200, exerciseRequests, 'Exercise requests retrieved successfully'));
    } catch (err) {
        const status = err.statusCode || 500;
        res.status(status).json(new APIError(status, err.message || 'Server error.'));
    }
}

// @Desc: Get exercise request by ID
// @Route: /api/v1/admin/exercise-requests/:id
// @Access: Admin only
export const getExerciseRequestById = async (req, res) => {
    try {
        const exerciseRequestId = req.params.id;
        const exerciseRequest = await adminService.getExerciseRequestById(exerciseRequestId);

        res.status(200).json(new APIResponse(200, exerciseRequest, 'Exercise request retrieved successfully'));
    } catch (err) {
        const status = err.statusCode || 500;
        res.status(status).json(new APIError(status, err.message || 'Server error.'));
    }
}

// @Desc: Delete exercise request by ID
// @Route: /api/v1/admin/exercise-requests/:id
// @Access: Admin only
export const deleteExerciseRequest = async (req, res) => {
    try {
        const exerciseRequestId = req.params.id;
        await adminService.deleteExerciseRequest(exerciseRequestId);

        res.status(200).json(new APIResponse(200, {}, 'Exercise request deleted successfully'));
    } catch (err) {
        const status = err.statusCode || 500;
        res.status(status).json(new APIError(status, err.message || 'Server error.'));
    }
}

// @Desc: Update exercise request by ID (e.g. approve or reject)
// @Route: /api/v1/admin/exercise-requests/:id
// @Access: Admin only
export const updateExerciseRequestStatus = async (req, res) => {
    try {
        const exerciseRequestId = req.params.id;
        const { status } = req.body; // expected values: 'approved' or 'rejected'

        if (!['approved', 'rejected'].includes(status)) {
            return res.status(400).json(new APIError(400, 'Invalid status value. Must be "approved" or "rejected".'));
        }

        const exerciseRequest = await adminService.updateExerciseRequestStatus(exerciseRequestId, status);

         res.status(200).json(new APIResponse(200, exerciseRequest, `Exercise request ${status} successfully`));
    } catch (err) {
        const status = err.statusCode || 500;
        res.status(status).json(new APIError(status, err.message || 'Server error.'));
    }
}

export const getPostsByUser = async (req, res) => {
    try {
        const { userId } = req.params;
        const posts = await Post.find({ userId }).populate('userId', 'username email').exec();
        res.status(200).json(new APIResponse(200, posts, 'Posts retrieved successfully.'));
    } catch (err) {
        const status = err.statusCode || 500;
        res.status(status).json(new APIError(status, err.message || 'Server error.'));
    }
}

export const getPosts = async (req, res) => {
    try {
        const posts = await Post.find().populate('userId', 'username email').exec();
        res.status(200).json(new APIResponse(200, posts, 'Posts retrieved successfully.'));
    } catch (err) {
        const status = err.statusCode || 500;
        res.status(status).json(new APIError(status, err.message || 'Server error.'));
    }
};

export const deletePost = async (req, res) => {
    try {
        const { id } = req.params;
        const post = await Post.findByIdAndDelete(id);
        if (!post) {
            return res.status(404).json(new APIError(404, 'Post not found.'));
        }
        res.status(200).json(new APIResponse(200, null, 'Post deleted successfully.'));
    } catch (err) {
        const status = err.statusCode || 500;
        res.status(status).json(new APIError(status, err.message || 'Server error.'));
    }
};