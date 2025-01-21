const express = require('express');
const Food = require('../models/Food');
const router = express.Router();

// Get food items by category
// Get all foods, grouped by category
router.get('/category/:category', async (req, res) => {
  try {
    const { category } = req.params;
    console.log(`Fetching foods for category: ${category}`);  // Log for debugging
    
    let foods;

    if (category.toLowerCase() === 'all') {
      // Aggregating foods by category
      foods = await Food.aggregate([
        {
          $group: {
            _id: "$category",  // Group by the category field
            foods: { $push: "$$ROOT" },  // Push the entire food document into the "foods" array
          },
        },
      ]);
      console.log('Aggregated foods:', foods);  // Log the result of aggregation
    } else {
      // Case-insensitive search by category
      foods = await Food.find({ category: { $regex: new RegExp(category, 'i') } }); 
      console.log('Found foods:', foods);  // Log the found foods
    }

    res.status(200).json(foods);
  } catch (error) {
    console.error('Error fetching category:', error);
    res.status(500).json({ message: 'Error fetching category', error });
  }
});

module.exports = router;
