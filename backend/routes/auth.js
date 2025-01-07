const express = require('express');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const router = express.Router();

// Mock blacklist (replace with Redis or database for production use)
const tokenBlacklist = new Set();

// Middleware to validate JWT and check if it's blacklisted
const authMiddleware = (req, res, next) => {
  const token = req.headers.authorization?.split(" ")[1];
  if (!token) return res.status(401).json({ message: 'No token provided' });

  if (tokenBlacklist.has(token)) {
    return res.status(401).json({ message: 'Token is invalid (logged out)' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    return res.status(401).json({ message: 'Invalid token' });
  }
};

// Signup route
router.post('/signup', async (req, res) => {
  try {
    const { name, email, phone, password, confirmPassword } = req.body;

    // Passwords must match
    if (password !== confirmPassword) {
      return res.status(400).json({ message: 'Passwords do not match' });
    }

    // Check if user already exists
    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ message: 'User already exists' });
    }

    // Proceed with creating the user
    const user = await User.create({ name, email, phone, password });
    res.status(201).json({ message: 'User created successfully', user });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error creating user', error });
  }
});

// Login route
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user || !(await user.comparePassword(password))) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    const token = jwt.sign(
      { id: user._id, email: user.email, name: user.name },
      process.env.JWT_SECRET,
      { expiresIn: '1h' }
    );

    res.status(200).json({ message: 'Login successful', token, user: { name: user.name } });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error signing in', error });
  }
});

// Forgot Password route
router.post('/forgot-password', async (req, res) => {
  try {
    const { email, newPassword } = req.body;
    const user = await User.findOne({ email });

    if (!user) return res.status(404).json({ message: 'User not found' });

    user.password = newPassword;
    await user.save();

    res.status(200).json({ message: 'Password updated successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error resetting password', error });
  }
});

// Logout route
router.post('/logout', (req, res) => {
  try {
    // Invalidate token logic (optional depending on your setup)
    res.status(200).json({ message: 'Logged out successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Logout failed', error });
  }
});


// Token blacklist cleanup (remove expired tokens periodically)
const blacklistCleanupInterval = 1000 * 60 * 60; // Every hour
setInterval(() => {
  tokenBlacklist.forEach((token) => {
    try {
      const { exp } = jwt.decode(token);
      if (Date.now() >= exp * 1000) {
        tokenBlacklist.delete(token);
      }
    } catch (err) {
      tokenBlacklist.delete(token); // Remove invalid tokens
    }
  });
}, blacklistCleanupInterval);

module.exports = router;
