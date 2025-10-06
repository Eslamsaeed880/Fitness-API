import User from '../models/user.js';
import isAuth from '../middleware/isAuth.js';
import isAdmin from '../middleware/isAdmin.js';
import express from 'express';
import { getAllUsers, getUserById, deleteUser, updateUserRole } from '../controllers/admin.js';

const router = express.Router();

router.get('/users', isAuth, isAdmin, getAllUsers);

router.get('/users/:id', isAuth, isAdmin, getUserById);

router.delete('/users/:id', isAuth, isAdmin, deleteUser);

router.patch('/users/:id', isAuth, isAdmin, updateUserRole);

export default router;
