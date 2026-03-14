import isAdmin from '../../middleware/isAdmin.js';
import express from 'express';
import { 
    getAllUsers, 
    getUserById, 
    deleteUser, 
    updateUserRole,
    getAllExercises,
    getExerciseById,
    updateExercise,
    deleteExercise,
    createExercise,
    getExerciseRequests,
    getExerciseRequestById,
    updateExerciseRequestStatus,
    deleteExerciseRequest,
    getAllMuscles,
    createMuscle,
    getMuscleById,
    updateMuscle,
    deleteMuscle,
    getPosts,
    getPostsByUser,
    deletePost,
} from './admin.controller.js';
import { upload } from '../../middleware/multer.js';

const router = express.Router();

router.get('/users', isAdmin, getAllUsers);

router.get('/users/:id', isAdmin, getUserById);

router.delete('/users/:id', isAdmin, deleteUser);

router.patch('/users/:id', isAdmin, updateUserRole);

router.get('/muscles', isAdmin, getAllMuscles);

router.get('/muscles/:id', isAdmin, getMuscleById);

router.post('/muscles', isAdmin, createMuscle);

router.put('/muscles/:id', isAdmin, updateMuscle);

router.delete('/muscles/:id', isAdmin, deleteMuscle);

router.get('/exercises', isAdmin, getAllExercises);

router.get('/exercises/:id', isAdmin, getExerciseById);

router.put('/exercises/:id', isAdmin, upload.single('media'), updateExercise);

router.post('/exercises', isAdmin, upload.single('media'), createExercise);

router.delete('/exercises/:id', isAdmin, deleteExercise);

router.get('/exercise-requests', isAdmin, getExerciseRequests);

router.get('/exercise-requests/:id', isAdmin, getExerciseRequestById);

router.patch('/exercise-requests/:id', isAdmin, updateExerciseRequestStatus);

router.delete('/exercise-requests/:id', isAdmin, deleteExerciseRequest);

// router.get('/posts', isAdmin, getPosts);

// router.get('/posts/user/:userId', isAdmin, getPostsByUser);

// router.delete('/posts/:id', isAdmin, deletePost);

export default router;
