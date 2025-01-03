const express = require('express');
const mongoose = require('mongoose');
const dotenv = require('dotenv');

// Load environment variables
dotenv.config();

const app = express();
app.use(express.json()); // Middleware for JSON parsing

// Validate environment variables
if (!process.env.MONGODB_URI || !process.env.JWT_SECRET) {
  console.error("Missing required environment variables. Please check your .env file.");
  process.exit(1); // Exit the application if environment variables are missing
  
}

// MongoDB connection
mongoose.connect(process.env.MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  
})
  .then(() => console.log('MongoDB connected'))
  .catch((err) => {
    console.error('MongoDB connection error:', err);
    process.exit(1); // Exit if database connection fails
  });

const PORT = process.env.PORT || 2000;

// API Routes
const authRoutes = require('./routes/auth');
app.use('/api/auth', authRoutes);

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
