const express = require('express');
const cors = require('cors');
const { notFound, errorHandler } = require('./middlewares/errorMiddleware');
const router = require('./routes');

const app = express();

// Middlewares
app.use(cors());
app.use(express.json());

// Routes
app.use('/api', router);

// Error handling
app.use(notFound);
app.use(errorHandler);

module.exports = app;
