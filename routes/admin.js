import isAuth from '../middleware/isAuth.js';
import isAdmin from '../middleware/isAdmin.js';
import express from 'express';
import { 
    getAllUsers, 
    getUserById, 
    deleteUser, 
    updateUserRole, 
    getAllMuscles, 
    getMuscleById, 
    updateMuscle, 
    deleteMuscle,
    createMuscle,
    getAllExercises,
    getExerciseById,
    updateExercise,
    deleteExercise,
    createExercise
} from '../controllers/admin.js';

const router = express.Router();

router.get('/users', isAuth, isAdmin, getAllUsers);

router.get('/users/:id', isAuth, isAdmin, getUserById);

router.delete('/users/:id', isAuth, isAdmin, deleteUser);

router.patch('/users/:id', isAuth, isAdmin, updateUserRole);

router.get('/muscles', isAuth, isAdmin, getAllMuscles);

router.get('/muscles/:id', isAuth, isAdmin, getMuscleById);

router.put('/muscles/:id', isAuth, isAdmin, updateMuscle);

router.post('/muscles', isAuth, isAdmin, createMuscle);

router.delete('/muscles/:id', isAuth, isAdmin, deleteMuscle);

router.get('/exercises', isAuth, isAdmin, getAllExercises);

router.get('/exercises/:id', isAuth, isAdmin, getExerciseById);

router.put('/exercises/:id', isAuth, isAdmin, updateExercise);

router.post('/exercises', isAuth, isAdmin, createExercise);

router.delete('/exercises/:id', isAuth, isAdmin, deleteExercise);

export default router;
