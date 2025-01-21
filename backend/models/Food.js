const mongoose = require('mongoose');

// Define Food schema
const foodSchema = new mongoose.Schema({
  category: {
    type: String,
    required: true,
    trim: true,
  },
  name: {
    type: String,
    required: true,
    trim: true,
  },
  photo: {
    type: String, // URL to the photo
    required: false, // Optional for now
  },
}, { timestamps: true });

module.exports = mongoose.model('Food', foodSchema);
