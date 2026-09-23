const express = require('express');
const router = express.Router();
const { getDBStatus } = require('../config/db');

router.get('/health', (req, res) => {
  const dbStatus = getDBStatus();
  return res.json({
    status: 'healthy',
    service: 'MindSaathi Backend API',
    version: '1.0.0',
    platform: 'SIH26003 - North Eastern Region Dementia Assistance',
    timestamp: new Date().toISOString(),
    database: dbStatus,
    features: {
      adaptiveCognitiveEngine: 'active',
      medicationAdherenceTracker: 'active',
      caregiverDashboardFeed: 'active'
    },
    disclaimer: 'MindSaathi is an assistive cognitive stimulation and reminder platform, NOT a medical diagnosis tool.'
  });
});

module.exports = router;
