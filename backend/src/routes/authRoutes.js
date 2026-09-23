const express = require('express');
const router = express.Router();
const controller = require('../controllers/authController');
const { requireAuth } = require('../middleware/authMiddleware');

router.post('/caregiver/register', controller.registerCaregiver);
router.post('/caregiver/login', controller.loginCaregiver);
router.post('/elder/login', controller.loginElder);
router.get('/me', requireAuth, controller.getMyProfile);

module.exports = router;
