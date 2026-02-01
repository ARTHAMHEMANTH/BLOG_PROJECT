const express = require('express');
const router = express.Router();
const Post = require('../models/Post');

// Get all posts
router.get('/', async (req, res) => {
    try {
        const posts = await Post.find().sort({ createdAt: -1 });
        res.json(posts);
    } catch (err) {
        res.status(500).send('Server Error');
    }
});

// Get posts by user
router.get('/user/:username', async (req, res) => {
    try {
        const posts = await Post.find({ username: { $regex: new RegExp(`^${req.params.username}$`, 'i') } }).sort({ createdAt: -1 });
        res.json(posts);
    } catch (err) {
        res.status(500).send('Server Error');
    }
});

// Create post
router.post('/', async (req, res) => {
    try {
        const { userId, username, content, image } = req.body;
        if (!content && !image) {
            return res.status(400).json({ msg: 'Content or image is required' });
        }

        const newPost = new Post({
            userId,
            username,
            content,
            image
        });

        const post = await newPost.save();
        res.json(post);
    } catch (err) {
        res.status(500).send('Server Error');
    }
});

// Like/Unlike post
router.put('/:id/like', async (req, res) => {
    try {
        const post = await Post.findById(req.params.id);
        const { userId } = req.body;

        if (post.likes.includes(userId)) {
            // Unlike
            post.likes = post.likes.filter(id => id.toString() !== userId);
        } else {
            // Like
            post.likes.push(userId);
        }

        await post.save();
        res.json(post.likes);
    } catch (err) {
        res.status(500).send('Server Error');
    }
});

// Comment on post
router.post('/:id/comment', async (req, res) => {
    try {
        const post = await Post.findById(req.params.id);
        const { userId, username, text } = req.body;

        const newComment = {
            userId,
            username,
            text
        };

        post.comments.unshift(newComment);
        await post.save();
        res.json(post.comments);
    } catch (err) {
        res.status(500).send('Server Error');
    }
});

// Delete post
router.delete('/:id', async (req, res) => {
    try {
        const post = await Post.findById(req.params.id);

        if (!post) {
            return res.status(404).json({ msg: 'Post not found' });
        }

        // Check user ownership
        const { userId } = req.query;

        if (!userId) {
            return res.status(400).json({ msg: 'userId is required in query params to delete' });
        }

        console.log("Delete attempt:", {
            postId: post._id,
            postUserId: post.userId,
            postUsername: post.username,
            requestUserId: userId
        });

        const isOwner = post.userId?.toString() === userId || post.username === userId;

        if (!isOwner) {
            console.log("Ownership check failed for:", userId);
            return res.status(401).json({ msg: 'User not authorized to delete this post' });
        }

        await Post.findByIdAndDelete(req.params.id);
        res.json({ msg: 'Post removed' });
    } catch (err) {
        console.error("DELETE POST ERROR:", err);
        res.status(500).json({ msg: 'Server Error deleting post', error: err.message });
    }
});

module.exports = router;
