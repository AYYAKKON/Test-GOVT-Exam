const express = require('express');
const router = express.Router();
const uploadPdf = require('../middleware/uploadMiddleware');
const {
  uploadAndProcessPdf,
  processRawText,
  saveParsedTest
} = require('../controllers/pdfController');
const { protect, adminOnly } = require('../middleware/authMiddleware');

router.use(protect, adminOnly);

router.post('/upload-pdf', uploadPdf.single('pdfFile'), uploadAndProcessPdf);
router.post('/process-text', processRawText);
router.post('/save-parsed-test', saveParsedTest);

module.exports = router;
