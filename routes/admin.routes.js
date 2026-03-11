import isAdmin from '../middleware/isAdmin.js';
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
    getAllMuscles,
    createMuscle,
    getMuscleById,
    updateMuscle,
    deleteMuscle,
    getPosts,
    getPostsByUser,
    deletePost,
} from '../controllers/admin.controller.js';

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

router.get('/equipments', isAdmin);

router.get('/equipments/:id', isAdmin);

router.post('/equipments', isAdmin);

router.put('/equipments/:id', isAdmin);

router.delete('/equipments/:id', isAdmin);

// router.get('/exercises', isAdmin, getAllExercises);

// router.get('/exercises/:id', isAdmin, getExerciseById);

// router.put('/exercises/:id', isAdmin, updateExercise);

// router.post('/exercises', isAdmin, createExercise);

// router.delete('/exercises/:id', isAdmin, deleteExercise);

// router.get('/posts', isAdmin, getPosts);

// router.get('/posts/user/:userId', isAdmin, getPostsByUser);

// router.delete('/posts/:id', isAdmin, deletePost);

export default router;
