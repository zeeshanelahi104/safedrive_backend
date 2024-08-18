// middleware/authMiddleware.js
const jwt = require('jsonwebtoken');
const User = require('../models/user');

// Middleware to protect routes, ensuring the user is authenticated
exports.protect = async (req, res, next) => {
  let token;

  // Check if the token is provided in the Authorization header
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    try {
      // Get token from the Authorization header
      token = req.headers.authorization.split(' ')[1];

      // Verify the token
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      // Find the user associated with the token
      req.user = await User.findById(decoded.id).select('-password');

      if (!req.user) {
        return res.status(401).json({ message: 'Not authorized, user not found' });
      }

      // Proceed to the next middleware or route handler
      next();
    } catch (error) {
      console.error(error);
      res.status(401).json({ message: 'Not authorized, token failed' });
    }
  }

  // If no token is found, return an error
  if (!token) {
    return res.status(401).json({ message: 'Not authorized, no token' });
  }
};

// Middleware to check if the authenticated user is an admin
exports.admin = (req, res, next) => {
  if (req.user && req.user.isAdmin) {
    // Proceed to the next middleware or route handler
    next();
  } else {
    res.status(403).json({ message: 'Not authorized as an admin' });
  }
};
