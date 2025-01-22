const mongoose = require('mongoose');
const foodSchema = new mongoose.Schema(
  {
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
    desc: {
      type: String,
      required: true,
      trim: true,
    },
    uri: {
      type: String,
      required: false,
    },
    usersLiked: {
      type: [String], default: []
    },
  },
  {timestamps: true},
);
module.exports = mongoose.model('Food', foodSchema);
