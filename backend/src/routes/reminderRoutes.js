const express = require('express');
const router = express.Router();

const reminderController = require('../controllers/reminderController');
const { requireAuth } = require('../middleware/authMiddleware');

router.get('/', requireAuth, reminderController.getReminders);
router.post('/', requireAuth, reminderController.createReminder);
router.patch('/:id/status', requireAuth, reminderController.updateReminderStatus);
router.patch('/:id', requireAuth, reminderController.updateReminder);
router.delete('/:id', requireAuth, reminderController.deleteReminder);

module.exports = router;
