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

    const uri = process.env.MONGO_URI;
    if (!uri) {
        console.error('CRITICAL: MONGO_URI is not defined');
        throw new Error('MONGO_URI is missing in Vercel environment variables');
    }

    // Mask URI for logs: mongodb+srv://user:****@cluster...
    const maskedUri = uri.replace(/:([^:@]+)@/, ':****@');
    console.log(`Connecting to MongoDB Atlas... (${maskedUri.substring(0, 30)}...)`);

    try {
        const db = await mongoose.connect(uri);
        isConnected = db.connections[0].readyState;
        console.log('Successfully connected to MongoDB Atlas');
    } catch (err) {
        console.error('Atlas connection failed:', err.message);
        throw err;
    }
};

// Routes Middleware to ensure DB connection
app.use(async (req, res, next) => {
    try {
        await connectDB();
        next();
    } catch (err) {
        console.error("DB Middleware Error:", err);
        // Include the error message in the response for debugging
        res.status(500).json({
            msg: 'Database connection failed',
            error: err.message,
            tip: 'Check your Vercel Environment Variables and MongoDB IP Whitelist'
        });
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
