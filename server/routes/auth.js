const express = require('express');
const router = express.Router();
const User = require('../models/User');
// Note: In a real app, use bcrypt for password hashing and jsonwebtoken for JWT.
// For "Simple signup" and speed, we will implement basic flows, but I'll add simple hashing if possible or plain text if requested "simple".
// The prompt asks for "Simple signup and login". I'll stick to a very basic implementation but with checks.

router.post('/signup', async (req, res) => {
    try {
        const { username, email, password } = req.body;
        // Check if user exists
        let user = await User.findOne({ email });
        if (user) return res.status(400).json({ msg: 'User already exists' });

        user = new User({ username, email, password });
        await user.save();

        res.json({
            msg: 'User registered successfully',
            userId: user._id,
            username: user.username,
            followers: [],
            following: []
        });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;

        // Check user
        const user = await User.findOne({ email });
        if (!user) return res.status(400).json({ msg: 'Invalid Credentials' });

        // Check password (plain text for simplicity as per "Simple" request, but warning: not secure for prod)
        if (password !== user.password) return res.status(400).json({ msg: 'Invalid Credentials' });

        res.json({
            msg: 'Login successful',
            userId: user._id,
            username: user.username,
            followers: user.followers,
            following: user.following
        });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

module.exports = router;
