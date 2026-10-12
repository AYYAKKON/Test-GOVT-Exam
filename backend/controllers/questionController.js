const Question = require('../models/Question');
const Test = require('../models/Test');

// @desc    Get questions for a test (Admin)
// @route   GET /api/questions/test/:testId
// @access  Private/Admin
const getQuestionsByTest = async (req, res) => {
  try {
    const questions = await Question.find({ testId: req.params.testId })
      .populate('sectionId', 'name duration')
      .sort({ questionNumber: 1 });
    res.json(questions);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Create question manually
// @route   POST /api/questions
// @access  Private/Admin
const createQuestion = async (req, res) => {
  try {
    const { testId, sectionId, questionNumber, questionText, options, correctAnswer, explanation } = req.body;

    if (!testId || !sectionId || !questionText || !options || !correctAnswer) {
      return res.status(400).json({ message: 'Missing required question fields' });
    }

    const question = await Question.create({
      testId,
      sectionId,
      questionNumber: questionNumber || 1,
      questionText,
      options,
      correctAnswer: correctAnswer.toUpperCase(),
      explanation: explanation || ''
    });

    // Update total questions in test
    const count = await Question.countDocuments({ testId });
    await Test.findByIdAndUpdate(testId, { totalQuestions: count });

    res.status(201).json(question);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update question
// @route   PUT /api/questions/:id
// @access  Private/Admin
const updateQuestion = async (req, res) => {
  try {
    const question = await Question.findById(req.params.id);
    if (!question) {
      return res.status(404).json({ message: 'Question not found' });
    }

    const { questionText, options, correctAnswer, explanation, sectionId, questionNumber } = req.body;
    if (questionText) question.questionText = questionText;
    if (options) question.options = options;
    if (correctAnswer) question.correctAnswer = correctAnswer.toUpperCase();
    if (explanation !== undefined) question.explanation = explanation;
    if (sectionId) question.sectionId = sectionId;
    if (questionNumber) question.questionNumber = questionNumber;

    const updated = await question.save();
    res.json(updated);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Delete question
// @route   DELETE /api/questions/:id
// @access  Private/Admin
const deleteQuestion = async (req, res) => {
  try {
    const question = await Question.findById(req.params.id);
    if (!question) {
      return res.status(404).json({ message: 'Question not found' });
    }

    const testId = question.testId;
    await question.deleteOne();

    // Update test question count
    const count = await Question.countDocuments({ testId });
    await Test.findByIdAndUpdate(testId, { totalQuestions: count });

    res.json({ message: 'Question deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  getQuestionsByTest,
  createQuestion,
  updateQuestion,
  deleteQuestion
};
