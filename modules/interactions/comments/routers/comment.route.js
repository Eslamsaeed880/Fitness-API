import express from 'express';
import isAuth from '../../../../middleware/isAuth.js';
import { 
    createComment,
    getComments,
    deleteComment
} from '../controllers/comment.controller.js';

const router = express.Router();

router.get('/:entityId', getComments);

router.use(isAuth);

router.post('/', createComment);

router.delete('/:commentId', deleteComment);

export default router;