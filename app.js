const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
// const firstEntityRoutes = require('./routes/firstEntityRoutes');
const userRoutes = require('./routes/userRoutes');

const app = express();

// Middleware
app.use(express.json()); // For parsing JSON request bodies
app.use(cors()); // Enable CORS for all routes
app.use(morgan('dev')); // HTTP request logger

// Root route (API status)
app.get('/', (req, res) => {
  res.send('API is running...');
});

// Routes for entities
app.use('/api/user', userRoutes);

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send({ message: 'An error occurred', error: err.message });
});

// Export the app for use in server.js
module.exports = app;
