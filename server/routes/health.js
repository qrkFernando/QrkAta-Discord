const express = require('express');
const mongoose = require('mongoose');
const router = express.Router();

// Health check endpoint
router.get('/', async (req, res) => {
  try {
    const healthCheck = {
      status: 'OK',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      environment: process.env.NODE_ENV || 'development',
      version: process.env.npm_package_version || '1.0.0'
    };

    // Check database connection
    if (mongoose.connection.readyState === 1) {
      healthCheck.database = 'Connected';
    } else {
      healthCheck.database = 'Disconnected';
      healthCheck.status = 'WARNING';
    }

    // Check memory usage
    const memoryUsage = process.memoryUsage();
    healthCheck.memory = {
      used: Math.round(memoryUsage.heapUsed / 1024 / 1024) + ' MB',
      total: Math.round(memoryUsage.heapTotal / 1024 / 1024) + ' MB'
    };

    res.status(200).json(healthCheck);
  } catch (error) {
    res.status(500).json({
      status: 'ERROR',
      timestamp: new Date().toISOString(),
      error: error.message
    });
  }
});

// Detailed status endpoint
router.get('/detailed', async (req, res) => {
  try {
    const detailedHealth = {
      status: 'OK',
      timestamp: new Date().toISOString(),
      server: {
        uptime: process.uptime(),
        pid: process.pid,
        platform: process.platform,
        nodeVersion: process.version,
        environment: process.env.NODE_ENV
      },
      database: {
        status: mongoose.connection.readyState === 1 ? 'Connected' : 'Disconnected',
        host: mongoose.connection.host || 'Unknown',
        name: mongoose.connection.name || 'Unknown'
      },
      memory: process.memoryUsage(),
      cpu: process.cpuUsage()
    };

    res.status(200).json(detailedHealth);
  } catch (error) {
    res.status(500).json({
      status: 'ERROR',
      error: error.message
    });
  }
});

module.exports = router;