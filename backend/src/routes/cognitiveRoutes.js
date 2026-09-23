const express = require('express');
const router = express.Router();
const cognitiveController = require('../controllers/cognitiveController');
const { requireAuth } = require('../middleware/authMiddleware');
router.post('/evaluate', requireAuth, cognitiveController.evaluateSession);
router.get('/history', requireAuth, cognitiveController.getHistory);
module.exports = router;
