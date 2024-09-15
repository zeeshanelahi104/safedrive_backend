// quoteRoutes.js
const express = require('express');
const { getSingleQuote, getAllQuotes, searchQuotes } = require('../controllers/quoteController');
const router = express.Router();

// Route to search quotes based on vehicle type and rideType
router.get('/search', searchQuotes); // Move this above

// Route to get all quotes
router.get('/', getAllQuotes);

// Route to get a single quote by ID
router.get('/:id', getSingleQuote);

module.exports = router;
