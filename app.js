const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const userRoutes = require('./routes/userRoutes'); // Make sure this path is correct

const app = express();

// Middleware
app.use(express.json()); // For parsing JSON request bodies
const corsOptions = {
  origin: process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000', // Allow your frontend's origin
  methods: 'GET,POST,PUT,DELETE', // Allow specific HTTP methods
  credentials: true, // Allow cookies and other credentials
  optionsSuccessStatus: 200, // For legacy browsers support
};

app.use(cors(corsOptions));
app.options('*', cors(corsOptions)); // Handle preflight requests

app.use(morgan('dev')); // HTTP request logger

// Root route (API status)
app.get('/', (req, res) => {
  res.send('API is running...');
});

// Routes for user-related endpoints
app.use('/api/user', userRoutes);

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send({ message: 'An error occurred', error: err.message });
});

module.exports = app;
