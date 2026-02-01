const express = require('express');
const router = express.Router();
const User = require('../models/User');

// Follow/Unfollow user
router.put('/:id/follow', async (req, res) => {
    if (req.body.userId === req.params.id) {
        return res.status(403).json("You cannot follow yourself");
    }
    try {
        const user = await User.findById(req.params.id);
        const currentUser = await User.findById(req.body.userId);

        if (!user || !currentUser) return res.status(404).json("User not found");

        if (!user.followers.some(id => id.toString() === req.body.userId)) {
            await user.updateOne({ $push: { followers: req.body.userId } });
            await currentUser.updateOne({ $push: { following: req.params.id } });
            res.status(200).json({ followed: true, msg: "user has been followed" });
        } else {
            await user.updateOne({ $pull: { followers: req.body.userId } });
            await currentUser.updateOne({ $pull: { following: req.params.id } });
            res.status(200).json({ followed: false, msg: "user has been unfollowed" });
        }
    } catch (err) {
        res.status(500).json(err);
    }
});

// Get user by username
router.get('/:username', async (req, res) => {
    try {
        const user = await User.findOne({ username: { $regex: new RegExp(`^${req.params.username}$`, 'i') } })
            .select('-password'); // Exclude password
        if (!user) return res.status(404).json({ msg: 'User not found' });
        res.json(user);
    } catch (err) {
        console.error("GET USER BY USERNAME ERROR:", err);
        res.status(500).json({ msg: 'Server Error fetching user', error: err.message });
    }
});

// Get followers
router.get('/:username/followers', async (req, res) => {
    try {
        const user = await User.findOne({ username: { $regex: new RegExp(`^${req.params.username}$`, 'i') } })
            .populate('followers', 'username _id');
        if (!user) return res.status(404).json({ msg: 'User not found' });
        res.json(user.followers);
    } catch (err) {
        res.status(500).json({ msg: 'Server Error fetching followers' });
    }
});

// Get following
router.get('/:username/following', async (req, res) => {
    try {
        const user = await User.findOne({ username: { $regex: new RegExp(`^${req.params.username}$`, 'i') } })
            .populate('following', 'username _id');
        if (!user) return res.status(404).json({ msg: 'User not found' });
        res.json(user.following);
    } catch (err) {
        res.status(500).json({ msg: 'Server Error fetching following' });
    }
});

module.exports = router;
