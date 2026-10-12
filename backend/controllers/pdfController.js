const { parsePdfFile, parseRawTextToTest } = require('../services/pdfParserService');
const Test = require('../models/Test');
const Section = require('../models/Section');
const Question = require('../models/Question');
const fs = require('fs');

// @desc    Upload & Process PDF for preview (Does NOT save to DB yet)
// @route   POST /api/tests/upload-pdf
// @access  Private/Admin
const uploadAndProcessPdf = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'Please upload a PDF file' });
    }

    const filePath = req.file.path;
    const parsedResult = await parsePdfFile(filePath);

    // Clean up uploaded temporary PDF file if desired, or keep it
    fs.unlink(filePath, (err) => {
      if (err) console.warn('Could not remove temp upload file:', err.message);
    });

    res.json({
      message: 'PDF processed successfully. Please review extracted content before publishing.',
      parsedData: parsedResult
    });
  } catch (error) {
    res.status(500).json({
      message: `Failed to parse PDF: ${error.message}`,
      error: error.message
    });
  }
};

// @desc    Process raw text input directly if PDF parsing had minor layout formatting quirks
// @route   POST /api/tests/process-text
// @access  Private/Admin
const processRawText = async (req, res) => {
  try {
    const { rawText } = req.body;
    if (!rawText) {
      return res.status(400).json({ message: 'Raw text is required' });
    }
    const parsedResult = parseRawTextToTest(rawText);
    res.json({
      message: 'Raw text processed successfully.',
      parsedData: parsedResult
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Save verified PDF / Preview test & questions into database
// @route   POST /api/tests/save-parsed-test
// @access  Private/Admin
const saveParsedTest = async (req, res) => {
  try {
    const {
      testId,
      title,
      category,
      description,
      status, // 'Draft' or 'Published'
      sections // Array of { name, duration, questions: [...] }
    } = req.body;

    if (!title || !category || !sections || !Array.isArray(sections)) {
      return res.status(400).json({ message: 'Title, Category, and Sections are required' });
    }

    let targetTest;
    if (testId) {
      targetTest = await Test.findById(testId);
      if (targetTest) {
        targetTest.title = title;
        targetTest.category = category;
        targetTest.description = description || targetTest.description;
        targetTest.status = status || targetTest.status;
        await targetTest.save();
        // Clear previous sections and questions if overwriting
        await Section.deleteMany({ testId: targetTest._id });
        await Question.deleteMany({ testId: targetTest._id });
      }
    }

    if (!targetTest) {
      targetTest = await Test.create({
        title,
        category,
        description: description || '',
        status: status || 'Draft',
        createdBy: req.user._id
      });
    }

    let totalQCount = 0;
    let totalDur = 0;

    for (let secIdx = 0; secIdx < sections.length; secIdx++) {
      const secData = sections[secIdx];
      const section = await Section.create({
        testId: targetTest._id,
        name: secData.name || `Section ${secIdx + 1}`,
        duration: parseInt(secData.duration, 10) || 15,
        order: secIdx + 1
      });

      totalDur += section.duration;

      if (secData.questions && Array.isArray(secData.questions)) {
        for (let qIdx = 0; qIdx < secData.questions.length; qIdx++) {
          const qData = secData.questions[qIdx];
          totalQCount++;
          await Question.create({
            testId: targetTest._id,
            sectionId: section._id,
            questionNumber: qData.questionNumber || totalQCount,
            questionText: qData.questionText,
            options: qData.options || [],
            correctAnswer: (qData.correctAnswer || 'A').toUpperCase(),
            explanation: qData.explanation || ''
          });
        }
      }
    }

    targetTest.totalQuestions = totalQCount;
    targetTest.totalDuration = totalDur;
    await targetTest.save();

    res.status(201).json({
      message: `Test "${targetTest.title}" saved successfully with ${totalQCount} questions across ${sections.length} sections!`,
      test: targetTest
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  uploadAndProcessPdf,
  processRawText,
  saveParsedTest
};
