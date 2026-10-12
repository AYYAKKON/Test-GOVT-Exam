const Test = require('../models/Test');
const Section = require('../models/Section');
const Question = require('../models/Question');
const TestAttempt = require('../models/TestAttempt');

// @desc    Get published tests available for student
// @route   GET /api/tests
// @access  Public or User
const getAvailableTests = async (req, res) => {
  try {
    const { category, search } = req.query;
    let filter = { status: 'Published' };

    if (category) {
      filter.category = category;
    }
    if (search) {
      filter.title = { $regex: search, $options: 'i' };
    }

    const tests = await Test.find(filter).sort({ createdAt: -1 });

    // Populate section details summary for each test
    const testsWithSections = await Promise.all(
      tests.map(async (test) => {
        const sections = await Section.find({ testId: test._id }).sort({ order: 1 });
        const questionCount = await Question.countDocuments({ testId: test._id });
        const sectionNames = sections.map(s => s.name);
        return {
          ...test.toObject(),
          totalQuestions: questionCount,
          sections: sectionNames,
          sectionDetails: sections
        };
      })
    );

    res.json(testsWithSections);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get all tests for Admin
// @route   GET /api/tests/admin/all
// @access  Private/Admin
const getAllTestsAdmin = async (req, res) => {
  try {
    const { status, category, search } = req.query;
    let filter = {};

    if (status) filter.status = status;
    if (category) filter.category = category;
    if (search) filter.title = { $regex: search, $options: 'i' };

    const tests = await Test.find(filter).sort({ createdAt: -1 });

    const testsWithStats = await Promise.all(
      tests.map(async (test) => {
        const sections = await Section.find({ testId: test._id }).sort({ order: 1 });
        const questionCount = await Question.countDocuments({ testId: test._id });
        const attemptsCount = await TestAttempt.countDocuments({ testId: test._id });
        return {
          ...test.toObject(),
          totalQuestions: questionCount,
          sectionsCount: sections.length,
          attemptsCount
        };
      })
    );

    res.json(testsWithStats);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get single test details with sections & questions (Admin View - includes answers)
// @route   GET /api/tests/:id
// @access  Private/Admin
const getTestByIdAdmin = async (req, res) => {
  try {
    const test = await Test.findById(req.params.id);
    if (!test) {
      return res.status(404).json({ message: 'Test not found' });
    }

    const sections = await Section.find({ testId: test._id }).sort({ order: 1 });
    const questions = await Question.find({ testId: test._id }).sort({ questionNumber: 1 });

    res.json({
      test,
      sections,
      questions
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get test for taking examination (SECURE: Stripts correct answers and explanations)
// @route   GET /api/tests/:id/take
// @access  Private/User
const getTestForAttempt = async (req, res) => {
  try {
    const test = await Test.findById(req.params.id);
    if (!test) {
      return res.status(404).json({ message: 'Test not found' });
    }

    if (test.status !== 'Published') {
      return res.status(403).json({ message: 'This test is currently not available for examination.' });
    }

    const sections = await Section.find({ testId: test._id }).sort({ order: 1 });
    const questions = await Question.find({ testId: test._id }).sort({ questionNumber: 1 });

    // Sanitize questions: EXCLUDE correctAnswer and explanation for Security!
    const sanitizedQuestions = questions.map(q => ({
      _id: q._id,
      testId: q.testId,
      sectionId: q.sectionId,
      questionNumber: q.questionNumber,
      questionText: q.questionText,
      options: q.options // Contains key and text only
    }));

    res.json({
      test: {
        _id: test._id,
        title: test.title,
        category: test.category,
        description: test.description,
        totalQuestions: sanitizedQuestions.length,
        totalDuration: test.totalDuration
      },
      sections,
      questions: sanitizedQuestions
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Create a new test metadata
// @route   POST /api/tests
// @access  Private/Admin
const createTest = async (req, res) => {
  try {
    const { title, category, description, status } = req.body;

    if (!title || !category) {
      return res.status(400).json({ message: 'Title and Category are required' });
    }

    const test = await Test.create({
      title: title.trim(),
      category: category.trim(),
      description: description || '',
      status: status || 'Draft',
      createdBy: req.user._id
    });

    res.status(201).json(test);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update test metadata
// @route   PUT /api/tests/:id
// @access  Private/Admin
const updateTest = async (req, res) => {
  try {
    const test = await Test.findById(req.params.id);
    if (!test) {
      return res.status(404).json({ message: 'Test not found' });
    }

    const { title, category, description, status } = req.body;
    if (title) test.title = title.trim();
    if (category) test.category = category.trim();
    if (description !== undefined) test.description = description;
    if (status) test.status = status;

    const updatedTest = await test.save();
    res.json(updatedTest);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Publish / Unpublish test
// @route   POST /api/tests/:id/publish
// @access  Private/Admin
const togglePublishTest = async (req, res) => {
  try {
    const test = await Test.findById(req.params.id);
    if (!test) {
      return res.status(404).json({ message: 'Test not found' });
    }

    const questionCount = await Question.countDocuments({ testId: test._id });
    if (test.status !== 'Published' && questionCount === 0) {
      return res.status(400).json({ message: 'Cannot publish a test with zero questions!' });
    }

    test.status = test.status === 'Published' ? 'Unpublished' : 'Published';
    await test.save();

    res.json({
      message: `Test ${test.status.toLowerCase()} successfully`,
      status: test.status
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Delete test and all associated questions & sections
// @route   DELETE /api/tests/:id
// @access  Private/Admin
const deleteTest = async (req, res) => {
  try {
    const test = await Test.findById(req.params.id);
    if (!test) {
      return res.status(404).json({ message: 'Test not found' });
    }

    await Section.deleteMany({ testId: test._id });
    await Question.deleteMany({ testId: test._id });
    await TestAttempt.deleteMany({ testId: test._id });
    await test.deleteOne();

    res.json({ message: 'Test and related questions deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Duplicate an existing test
// @route   POST /api/tests/:id/duplicate
// @access  Private/Admin
const duplicateTest = async (req, res) => {
  try {
    const originalTest = await Test.findById(req.params.id);
    if (!originalTest) {
      return res.status(404).json({ message: 'Original test not found' });
    }

    const newTest = await Test.create({
      title: `${originalTest.title} (Copy)`,
      category: originalTest.category,
      description: originalTest.description,
      status: 'Draft',
      createdBy: req.user._id,
      totalQuestions: originalTest.totalQuestions,
      totalDuration: originalTest.totalDuration
    });

    const originalSections = await Section.find({ testId: originalTest._id });
    const sectionMap = {};

    for (const sec of originalSections) {
      const newSec = await Section.create({
        testId: newTest._id,
        name: sec.name,
        duration: sec.duration,
        order: sec.order
      });
      sectionMap[sec._id.toString()] = newSec._id;
    }

    const originalQuestions = await Question.find({ testId: originalTest._id });
    for (const q of originalQuestions) {
      await Question.create({
        testId: newTest._id,
        sectionId: sectionMap[q.sectionId.toString()],
        questionNumber: q.questionNumber,
        questionText: q.questionText,
        options: q.options,
        correctAnswer: q.correctAnswer,
        explanation: q.explanation
      });
    }

    res.status(201).json(newTest);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  getAvailableTests,
  getAllTestsAdmin,
  getTestByIdAdmin,
  getTestForAttempt,
  createTest,
  updateTest,
  togglePublishTest,
  deleteTest,
  duplicateTest
};
