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
    getPosts,
    getPostsByUser,
    deletePost

} from '../controllers/admin.controller.js';

const router = express.Router();

router.get('/users', isAdmin, getAllUsers);

router.get('/users/:id', isAdmin, getUserById);

router.delete('/users/:id', isAdmin, deleteUser);

router.patch('/users/:id', isAdmin, updateUserRole);

router.get('/muscle', isAdmin);

router.get('/muscle/:id', isAdmin);

router.post('/muscle', isAdmin);

router.put('/muscle/:id', isAdmin);

router.delete('/muscle/:id', isAdmin);

router.get('/equipment', isAdmin);

router.get('/equipment/:id', isAdmin);

router.post('/equipment', isAdmin);

router.put('/equipment/:id', isAdmin);

router.delete('/equipment/:id', isAdmin);

router.get('/exercises', isAdmin, getAllExercises);

router.get('/exercises/:id', isAdmin, getExerciseById);

// router.put('/exercises/:id', isAdmin, updateExercise);

// router.post('/exercises', isAdmin, createExercise);

// router.delete('/exercises/:id', isAdmin, deleteExercise);

router.get('/posts', isAdmin, getPosts);

router.get('/posts/user/:userId', isAdmin, getPostsByUser);

router.delete('/posts/:id', isAdmin, deletePost);

export default router;
