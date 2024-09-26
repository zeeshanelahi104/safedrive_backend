// quoteRoutes.js
const express = require('express');
const { getSingleQuote, getAllQuotes, searchQuotes, searchQuotesByDate } = require('../controllers/quoteController');
const router = express.Router();

// Route to get all quotes
router.get('/', getAllQuotes);

// Route to search quotes based on vehicle type and rideType
router.get('/search', searchQuotes); 
router.post('/searchByDate', searchQuotesByDate); 


// Route to get a single quote by ID
router.get('/:id', getSingleQuote);

module.exports = router;
