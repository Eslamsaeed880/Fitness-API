import express from 'express';
import isAuth from '../../../middleware/isAuth.js';
import { getNotifications, markAsRead, markAllRead } from '../controllers/notification.controller.js';

const router = express.Router();

router.get('/', isAuth, getNotifications);

router.patch('/mark-all-read', isAuth, markAllRead);

router.patch('/:id/read', isAuth, markAsRead);

export default router;
