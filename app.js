const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const userRoutes = require('./routes/userRoutes');
const customerRoutes = require('./routes/customerRoutes');
const quoteRoutes = require('./routes/quoteRoutes');

const app = express();

// Middleware
app.use(express.json()); // For parsing JSON request bodies

// Explicit CORS configuration
const corsOptions = {
  origin: ['http://localhost:3000', 'https://driversnow.vercel.app', 'https://safedrive-admin-panel.vercel.app'], // Allowed origins
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'], // Allowed methods
  credentials: true, // Allow credentials like cookies
  allowedHeaders: ['Content-Type', 'Authorization'], // Allowed headers
  optionsSuccessStatus: 200, // For legacy browsers support
};

// Enable CORS with the specified options
app.use(cors(corsOptions));

// Ensure preflight OPTIONS requests are handled
app.options('*', cors(corsOptions));

// Logger middleware
app.use(morgan('dev'));

// Root route (API status)
app.get('/', (req, res) => {
  res.send('API is running...');
});

// Routes for user-related endpoints
app.use('/api/user', userRoutes);
app.use('/api/quotes', quoteRoutes);
app.use('/api/customers', customerRoutes);

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send({ message: 'An error occurred', error: err.message });
});

module.exports = app;
