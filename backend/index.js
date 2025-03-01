const express = require('express');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config();

const app = express();
app.use(express.json());

const { MONGODB_URI, JWT_SECRET, PORT = 2000 } = process.env;

if (!MONGODB_URI || !JWT_SECRET) {
  console.error('Missing required environment variables. Please check your .env file.');
  process.exit(1);
}

mongoose
  .connect(MONGODB_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log('MongoDB connected'))
  .catch((err) => {
    console.error('MongoDB connection error:', err);
    process.exit(1);
  });

const authRoutes = require('./routes/auth');
app.use('/api/auth', authRoutes);
const foodRoutes = require('./routes/food');
app.use('/api/food', foodRoutes);
const profileRoutes = require('./routes/profile');
app.use('/api/profile', profileRoutes);
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
