const express = require('express');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { verifyToken } = require('../middleware/authMiddle');
const router = express.Router();

router.post('/signup', async (req, res) => {
  try {
    const { name, email, phone, password, confirmPassword } = req.body;
    if (password !== confirmPassword) {
      return res.status(400).json({ message: 'Passwords do not match' });
    }
    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ message: 'User already exists' });
    }
    

    const user = await User.create({ name, email, phone, password });
    const token = jwt.sign(
      { id: user._id, email: user.email, name: user.name },
      process.env.JWT_SECRET,
      { expiresIn: '1h' }
    );
    res.status(201).json({ message: 'User created successfully', user,token });
    
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error creating user', error });
  }
});

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

router.post('/logout', verifyToken,(req, res) => {
  try {
    res.status(200).json({ message: 'Logged out successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Logout failed', error });
  }
});


module.exports = router;
