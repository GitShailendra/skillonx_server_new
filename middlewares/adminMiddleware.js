// middleware/authMiddleware.js
const jwt = require('jsonwebtoken');
const Admin = require('../models/Admin');

// Verify JWT token
const verifyToken = async (req, res, next) => {
    try {
        // Get token from header
        const token = req.header('Authorization')?.replace('Bearer ', '');
        
        if (!token) {
            return res.status(401).json({ message: 'No token provided. Access denied.' });
        }

        // Verify token
        const decoded = jwt.verify(token, process.env.JWT_KEY);
        
        // Find admin and check if exists
        const admin = await Admin.findById(decoded.id);
        if (!admin) {
            return res.status(401).json({ message: 'Invalid token. User not found.' });
        }

        // Add admin to request object
        req.admin = admin;
        next();
        
    } catch (error) {
        console.error('Auth middleware error:', error);
        res.status(401).json({ message: 'Token is invalid or expired' });
    }
};

// Check if user is admin
const isAdmin = async (req, res, next) => {
    try {
        if (req.admin && req.admin.role === 'admin') {
            next();
        } else {
            res.status(403).json({ message: 'Access denied. Admin only.' });
        }
    } catch (error) {
        res.status(500).json({ message: 'Error checking admin status' });
    }
};

module.exports = { verifyToken, isAdmin };