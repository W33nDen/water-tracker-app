const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const config = require('./config');
const { notFound, errorHandler } = require('./middlewares/errorMiddleware');
const router = require('./routes');

const app = express();

// CORS configuration supporting single or multiple comma-separated origins
const allowedOrigins = config.clientUrl.split(',').map((url) => url.trim());

app.use(
  cors({
    origin: allowedOrigins.length === 1 ? allowedOrigins[0] : allowedOrigins,
    credentials: true,
  })
);
app.use(express.json());
app.use(cookieParser());

// Routes
app.use('/api', router);

// Error handling
app.use(notFound);
app.use(errorHandler);

module.exports = app;
