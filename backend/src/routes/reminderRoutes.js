const express = require('express');
const router = express.Router();
const reminderController = require('../controllers/reminderController');
const { requireAuth } = require('../middleware/authMiddleware');
router.get('/', requireAuth, reminderController.getReminders);
router.patch('/:id/status', requireAuth, reminderController.updateReminderStatus);
module.exports = router;
