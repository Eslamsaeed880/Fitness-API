import Post from '../models/post.js';
import Like from '../models/like.js';
import Comment from '../models/comment.js';

export const createPost = async (req, res) => {
    try {
        const { title, content } = req.body;
        const userId = req.user.id;
        const post = new Post({
            title,
            content,
            userId
        });

        await post.save();
        res.status(201).json(post);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
        console.error('Error creating post:', error);
    }
};

export const getPosts = async (req, res) => {
    try {
        const posts = await Post.find().populate('userId', 'username email').exec();
        res.status(200).json(posts);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
        console.error('Error fetching posts:', error);
    }
};

export const getPostById = async (req, res) => {
    try {
        const { id } = req.params;
        const post = await Post
            .findById(id)
            .populate('userId', 'name');

        const comments = await Comment
            .find({ postId: id })
            .populate('userId', 'name')
            .exec();

        if (!post) {
            return res.status(404).json({ message: 'Post not found' });
        }

        res.status(200).json({ post, comments });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
        console.error('Error fetching post:', error);
    }
};

export const deleteComment = async (req, res) => {
    try {
        const { postId } = req.params;
        const { commentId } = req.query;
        const userId = req.user.id;
        const post = await Post.findById(postId);
        const comment = await Comment.findOneAndDelete({ 
            _id: commentId, 
            userId: userId, 
            postId: postId 
        });
        
        if (!comment) {
            return res.status(404).json({ message: 'Comment not found or unauthorized' });
        }

        if(post){
            post.commentsCount = Math.max(0, post.commentsCount - 1);
            await post.save();
        }
        
        res.status(200).json({ message: 'Comment deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
        console.error('Error deleting comment:', error);
    }
};

export const deletePost = async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.user.id;
        const post = await Post.findOneAndDelete({ _id: id, userId: userId });

        if (!post) {
            return res.status(404).json({ message: 'Post not found or unauthorized' });
        }

        await Like.deleteMany({ postId: id });
        await Comment.deleteMany({ postId: id });

        res.status(200).json({ message: 'Post deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
        console.error('Error deleting post:', error);
    }
};

export const likePost = async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.user.id;
        
        const existingLike = await Like.findOne({ postId: id, userId });
        if (existingLike) {
            return res.status(400).json({ message: 'Post already liked' });
        }

        const like = new Like({
            postId: id,
            userId
        });

        await Post.findByIdAndUpdate(id, { $inc: { likesCount: 1 } });
        
        await like.save();

        res.status(200).json({ message: 'Post liked successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
        console.error('Error liking post:', error);
    }
};

export const unlikePost = async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.user.id;
        const deletedLike = await Like.findOneAndDelete({ postId: id, userId });
        
        if (!deletedLike) {
            return res.status(404).json({ message: 'Like not found' });
        }

        await Post.findByIdAndUpdate(id, { $inc: { likesCount: -1 } });
        
        res.status(200).json({ message: 'Post unliked successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
        console.error('Error unliking post:', error);
    }
};

export const commentPost = async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.user.id;
        const { comment } = req.body;
        const newComment = new Comment({
            postId: id,
            userId,
            content: comment
        });

        await Post.findByIdAndUpdate(id, { $inc: { commentsCount: 1 } });
        await newComment.save();

        res.status(200).json(newComment);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
        console.error('Error commenting on post:', error);
    }
};