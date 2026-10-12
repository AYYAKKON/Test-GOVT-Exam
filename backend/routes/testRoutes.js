const express = require('express');
const router = express.Router();
const {
  getAvailableTests,
  getAllTestsAdmin,
  getTestByIdAdmin,
  getTestForAttempt,
  createTest,
  updateTest,
  togglePublishTest,
  deleteTest,
  duplicateTest
} = require('../controllers/testController');
const { protect, adminOnly } = require('../middleware/authMiddleware');

// Public or Student routes
router.get('/', getAvailableTests);
router.get('/:id/take', protect, getTestForAttempt);

// Admin-only routes
router.get('/admin/all', protect, adminOnly, getAllTestsAdmin);
router.get('/:id', protect, adminOnly, getTestByIdAdmin);
router.post('/', protect, adminOnly, createTest);
router.put('/:id', protect, adminOnly, updateTest);
router.delete('/:id', protect, adminOnly, deleteTest);
router.post('/:id/publish', protect, adminOnly, togglePublishTest);
router.post('/:id/duplicate', protect, adminOnly, duplicateTest);

module.exports = router;
