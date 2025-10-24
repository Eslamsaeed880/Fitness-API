import express from 'express';
import checkError from '../middleware/checkError.js';
import {
    createPostValidation,
    updatePostValidation,
    getPostByIdValidation,
    deletePostValidation,
    likePostValidation,
    unlikePostValidation,
    commentPostValidation,
    deleteCommentValidation
} from '../validation/postValidation.js';
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

router.post('/', isAuth, createPostValidation, checkError, createPost);

router.get('/', getPosts);

router.get('/:id', getPostByIdValidation, checkError, getPostById);

router.put('/:id', isAuth, updatePostValidation, checkError, updatePost);

router.delete('/:id', isAuth, deletePostValidation, checkError, deletePost);

router.post('/:id/like', isAuth, likePostValidation, checkError, likePost);

router.delete('/:id/like', isAuth, unlikePostValidation, checkError, unlikePost);

router.post('/:id/comment', isAuth, commentPostValidation, checkError, commentPost);

router.delete('/:postId/comment/:commentId', isAuth, deleteCommentValidation, checkError, deleteComment);

export default router;