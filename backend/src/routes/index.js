const express = require('express');
const { healthCheck } = require('../controllers/healthController');
const authRoutes = require('./authRoutes');
const usersRoutes = require('./usersRoutes');
const waterRoutes = require('./waterRoutes');

const router = express.Router();

// Health check
router.get('/health', healthCheck);

// Auth routes
router.use('/auth', authRoutes);

// Users routes
router.use('/users', usersRoutes);

// Water tracking routes
router.use('/water', waterRoutes);

module.exports = router;
