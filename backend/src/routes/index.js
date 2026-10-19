const express = require('express');
const { healthCheck } = require('../controllers/healthController');
const authRoutes = require('./authRoutes');

const router = express.Router();

// Health check
router.get('/health', healthCheck);

// Auth routes
router.use('/auth', authRoutes);

module.exports = router;
