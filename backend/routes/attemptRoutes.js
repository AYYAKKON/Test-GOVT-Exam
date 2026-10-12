const express = require('express');
const router = express.Router();
const {
  submitTest,
  getUserHistory,
  getAttemptDetails,
  getAdminTestResults,
  getAdminDashboardStats
} = require('../controllers/attemptController');
const { protect, adminOnly } = require('../middleware/authMiddleware');

router.post('/submit', protect, submitTest);
router.get('/history', protect, getUserHistory);
router.get('/admin/all', protect, adminOnly, getAdminTestResults);
router.get('/admin/stats', protect, adminOnly, getAdminDashboardStats);
router.get('/:id', protect, getAttemptDetails);

module.exports = router;
