import isAuth from '../middleware/isAuth.js';
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

} from '../controllers/admin.js';

const router = express.Router();

router.get('/users', isAuth, isAdmin, getAllUsers);

router.get('/users/:id', isAuth, isAdmin, getUserById);

router.delete('/users/:id', isAuth, isAdmin, deleteUser);

router.patch('/users/:id', isAuth, isAdmin, updateUserRole);

router.get('/exercises', isAuth, isAdmin, getAllExercises);

router.get('/exercises/:id', isAuth, isAdmin, getExerciseById);

router.put('/exercises/:id', isAuth, isAdmin, updateExercise);

router.post('/exercises', isAuth, isAdmin, createExercise);

router.delete('/exercises/:id', isAuth, isAdmin, deleteExercise);

router.get('/posts', isAuth, isAdmin, getPosts);

router.get('/posts/user/:userId', isAuth, isAdmin, getPostsByUser);

router.delete('/posts/:id', isAuth, isAdmin, deletePost);

export default router;
