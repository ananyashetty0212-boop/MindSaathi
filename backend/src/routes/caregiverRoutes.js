const express = require('express');
const router = express.Router();
const caregiverController = require('../controllers/caregiverController');
const { requireAuth, requireRole } = require('../middleware/authMiddleware');
router.get('/overview', requireAuth, requireRole('caregiver'), caregiverController.getOverview);
module.exports = router;
