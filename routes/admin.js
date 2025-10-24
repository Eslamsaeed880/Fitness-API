import isAuth from '../middleware/isAuth.js';
import isAdmin from '../middleware/isAdmin.js';
import checkError from '../middleware/checkError.js';
import express from 'express';
import {
    createExerciseValidation,
    updateExerciseValidation,
    updateUserRoleValidation,
    deleteUserValidation,
    deleteExerciseValidation,
    getUserByIdValidation,
    getExerciseByIdValidation,
    getPostsByUserValidation,
    deletePostValidation
} from '../validation/adminValidation.js';
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

router.get('/users/:id', isAuth, isAdmin, getUserByIdValidation, checkError, getUserById);

router.delete('/users/:id', isAuth, isAdmin, deleteUserValidation, checkError, deleteUser);

router.patch('/users/:id', isAuth, isAdmin, updateUserRoleValidation, checkError, updateUserRole);

router.get('/exercises', isAuth, isAdmin, getAllExercises);

router.get('/exercises/:id', isAuth, isAdmin, getExerciseByIdValidation, checkError, getExerciseById);

router.put('/exercises/:id', isAuth, isAdmin, updateExerciseValidation, checkError, updateExercise);

router.post('/exercises', isAuth, isAdmin, createExerciseValidation, checkError, createExercise);

router.delete('/exercises/:id', isAuth, isAdmin, deleteExerciseValidation, checkError, deleteExercise);

router.get('/posts', isAuth, isAdmin, getPosts);

router.get('/posts/user/:userId', isAuth, isAdmin, getPostsByUserValidation, checkError, getPostsByUser);

router.delete('/posts/:id', isAuth, isAdmin, deletePostValidation, checkError, deletePost);

export default router;
