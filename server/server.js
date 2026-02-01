const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');

dotenv.config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Request logger
app.use((req, res, next) => {
    console.log(`${req.method} ${req.url}`);
    next();
});

// MongoDB Connection with cache for Serverless
let isConnected = false;
const connectDB = async () => {
    if (isConnected) return;
    try {
        const db = await mongoose.connect(process.env.MONGO_URI);
        isConnected = db.connections[0].readyState;
        console.log('MongoDB Connected');
    } catch (err) {
        console.error('MongoDB Connection Error:', err);
    }
};

// Routes Middleware to ensure DB connection
app.use(async (req, res, next) => {
    try {
        await connectDB();
        next();
    } catch (err) {
        console.error("DB Middleware Error:", err);
        res.status(500).json({ msg: 'Database connection failed', error: err.message });
    }
});

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/posts', require('./routes/posts'));
app.use('/api/users', require('./routes/users'));

app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', message: 'Social App API is running' });
});

// For local development
if (process.env.NODE_ENV !== 'production' && require.main === module) {
    const PORT = process.env.PORT || 5000;
    app.listen(PORT, () => {
        console.log(`Server running on port ${PORT}`);
    });
}

module.exports = app;
