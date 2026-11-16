const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');

const { notFound, errorHandler } = require('./middleware/errorHandler');

const app = express();

app.use(cors());
app.use(express.json());

// Quick way to confirm the API is up and connected to MongoDB.
app.get('/api/health', (req, res) => {
    const states = ['disconnected', 'connected', 'connecting', 'disconnecting'];
    res.json({ status: 'ok', database: states[mongoose.connection.readyState] || 'unknown' });
});

// Part 2: student, course, and enrollment routes are mounted here.
// Part 5: the built Vue app is served here.

// Must come after all routes.
app.use('/api', notFound);
app.use(errorHandler);

module.exports = app;
