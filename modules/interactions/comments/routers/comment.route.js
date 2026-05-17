import express from 'express';
import isAuth from '../../../../middleware/isAuth.js';
import { 
    createComment
} from '../controllers/comment.controller.js';

const router = express.Router();

router.use(isAuth);

router.post('/', createComment);

export default router;