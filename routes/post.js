import express from 'express';
import { 
    createPost, 
    getPosts, 
    getPostById, 
    updatePost, 
    deletePost, 
    likePost, 
    unlikePost, 
    commentPost,
    deleteComment
} from '../controllers/post.js';
import isAuth from '../middleware/isAuth.js';
const router = express.Router();

router.post('/', isAuth, createPost);

router.get('/', getPosts);

router.get('/:id', getPostById);

router.put('/:id', isAuth, updatePost);

router.delete('/:id', isAuth, deletePost);

router.post('/:id/like', isAuth, likePost);      

router.delete('/:id/like', isAuth, unlikePost); 

router.post('/:id/comment', isAuth, commentPost);

router.delete('/:postId/comment/:commentId', isAuth, deleteComment);

export default router;