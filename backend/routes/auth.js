const express = require('express');
const User = require('../models/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const dotenv = require('dotenv');

dotenv.config();
const router = express.Router();

router.post('/signup', async (req, res) => {
    const { name, email, phoneNumber, password, confirmPassword } = req.body;
  
    try {
      if (password !== confirmPassword) {
        return res.status(400).json({ msg: 'Passwords do not match' });
      }
  
      const existingUser = await User.findOne({ email });
      if (existingUser) return res.status(400).json({ msg: 'User already exists' });
  
      const newUser = new User({ name, email, phoneNumber, password, confirmPassword });
      await newUser.save();
  
      const token = jwt.sign({ userId: newUser._id }, process.env.JWT_SECRET, { expiresIn: '1h' });
      res.json({ token });
    } catch (err) {
      res.status(500).json({ msg: 'Server Error' });
    }
  });
  
router.post('/login', async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ msg: 'User not found' });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ msg: 'Invalid credentials' });

    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, { expiresIn: '1h' });
    res.json({ token });
  } catch (err) {
    res.status(500).json({ msg: 'Server Error' });
  }
});

router.post('/forgot-password', async (req, res) => {
    const { email } = req.body;
    try {
      const user = await User.findOne({ email });
      if (!user) return res.status(400).json({ msg: 'User not found' });
  
      // Here you can send a reset password link via email (implement email service)
      res.json({ msg: 'Password reset link sent' });
    } catch (err) {
      res.status(500).json({ msg: 'Server Error' });
    }
  });
  
module.exports = router;
