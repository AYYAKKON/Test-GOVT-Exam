const TestAttempt = require('../models/TestAttempt');
const Test = require('../models/Test');
const Section = require('../models/Section');
const Question = require('../models/Question');
const User = require('../models/User');

// @desc    Submit test & evaluate results
// @route   POST /api/attempts/submit
// @access  Private/User
const submitTest = async (req, res) => {
  try {
    const { testId, answers, startedAt, sectionTimeSpent } = req.body;
    // answers is an array or object: [{ questionId, selectedOption, status }, ...]

    const test = await Test.findById(testId);
    if (!test) {
      return res.status(404).json({ message: 'Test not found' });
    }

    const questions = await Question.find({ testId }).sort({ questionNumber: 1 });
    const sections = await Section.find({ testId }).sort({ order: 1 });

    const userAnswersMap = {};
    if (Array.isArray(answers)) {
      answers.forEach(item => {
        if (item.questionId) {
          userAnswersMap[item.questionId.toString()] = item;
        }
      });
    } else if (typeof answers === 'object' && answers !== null) {
      Object.keys(answers).forEach(qId => {
        userAnswersMap[qId] = {
          questionId: qId,
          selectedOption: typeof answers[qId] === 'string' ? answers[qId] : answers[qId].selectedOption,
          status: answers[qId].status || 'answered'
        };
      });
    }

    let correctCount = 0;
    let wrongCount = 0;
    let unansweredCount = 0;

    const processedAnswers = [];
    const sectionStatsMap = {};

    sections.forEach(sec => {
      sectionStatsMap[sec._id.toString()] = {
        sectionId: sec._id,
        sectionName: sec.name,
        score: 0,
        maxScore: 0,
        correctCount: 0,
        wrongCount: 0,
        unansweredCount: 0,
        timeSpentSeconds: (sectionTimeSpent && sectionTimeSpent[sec._id.toString()]) || 0
      };
    });

    questions.forEach(q => {
      const qIdStr = q._id.toString();
      const secIdStr = q.sectionId.toString();
      const userAns = userAnswersMap[qIdStr];

      const selected = userAns && userAns.selectedOption ? userAns.selectedOption.trim().toUpperCase() : null;
      const qStatus = userAns ? (userAns.status || (selected ? 'answered' : 'unanswered')) : 'unanswered';

      let isCorrect = false;

      if (!selected) {
        unansweredCount++;
        if (sectionStatsMap[secIdStr]) {
          sectionStatsMap[secIdStr].unansweredCount++;
          sectionStatsMap[secIdStr].maxScore += 1;
        }
      } else if (selected === q.correctAnswer.toUpperCase()) {
        isCorrect = true;
        correctCount++;
        if (sectionStatsMap[secIdStr]) {
          sectionStatsMap[secIdStr].correctCount++;
          sectionStatsMap[secIdStr].score += 1;
          sectionStatsMap[secIdStr].maxScore += 1;
        }
      } else {
        wrongCount++;
        if (sectionStatsMap[secIdStr]) {
          sectionStatsMap[secIdStr].wrongCount++;
          sectionStatsMap[secIdStr].maxScore += 1;
        }
      }

      processedAnswers.push({
        questionId: q._id,
        selectedOption: selected,
        status: qStatus,
        isCorrect,
        correctOption: q.correctAnswer
      });
    });

    const totalQuestions = questions.length;
    const score = correctCount; // 1 mark per question
    const maxScore = totalQuestions;
    const percentage = maxScore > 0 ? parseFloat(((score / maxScore) * 100).toFixed(2)) : 0;

    const startTime = startedAt ? new Date(startedAt) : new Date(Date.now() - 60000);
    const endTime = new Date();
    const timeTakenSeconds = Math.round((endTime.getTime() - startTime.getTime()) / 1000);

    const sectionResults = Object.values(sectionStatsMap);

    const attempt = await TestAttempt.create({
      userId: req.user._id,
      testId: test._id,
      startedAt: startTime,
      completedAt: endTime,
      timeTakenSeconds,
      answers: processedAnswers,
      score,
      maxScore,
      percentage,
      correctCount,
      wrongCount,
      unansweredCount,
      sectionResults
    });

    res.status(201).json({
      message: 'Test submitted successfully!',
      attemptId: attempt._id,
      attempt
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get current user's test history
// @route   GET /api/attempts/history
// @access  Private/User
const getUserHistory = async (req, res) => {
  try {
    const attempts = await TestAttempt.find({ userId: req.user._id })
      .populate('testId', 'title category totalQuestions totalDuration')
      .sort({ createdAt: -1 });

    res.json(attempts);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get detailed single test attempt result & answer review
// @route   GET /api/attempts/:id
// @access  Private (User who owns attempt or Admin)
const getAttemptDetails = async (req, res) => {
  try {
    const attempt = await TestAttempt.findById(req.params.id)
      .populate('userId', 'name email')
      .populate('testId', 'title category description totalQuestions totalDuration');

    if (!attempt) {
      return res.status(404).json({ message: 'Attempt record not found' });
    }

    // Check authorization: must be owner or admin
    if (
      attempt.userId._id.toString() !== req.user._id.toString() &&
      req.user.role !== 'admin'
    ) {
      return res.status(403).json({ message: 'Not authorized to view this result' });
    }

    // Fetch questions with explanations for answer review
    const questions = await Question.find({ testId: attempt.testId._id })
      .populate('sectionId', 'name')
      .sort({ questionNumber: 1 });

    // Map questions with student answers for review screen
    const reviewData = questions.map(q => {
      const userAnsRecord = attempt.answers.find(
        a => a.questionId.toString() === q._id.toString()
      );
      return {
        _id: q._id,
        sectionName: q.sectionId ? q.sectionId.name : 'General',
        questionNumber: q.questionNumber,
        questionText: q.questionText,
        options: q.options,
        correctAnswer: q.correctAnswer,
        explanation: q.explanation,
        userSelectedOption: userAnsRecord ? userAnsRecord.selectedOption : null,
        userStatus: userAnsRecord ? userAnsRecord.status : 'unanswered',
        isCorrect: userAnsRecord ? userAnsRecord.isCorrect : false
      };
    });

    res.json({
      attempt,
      reviewData
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get statistics & all attempts for Admin Dashboard / Results Page
// @route   GET /api/attempts/admin/all
// @access  Private/Admin
const getAdminTestResults = async (req, res) => {
  try {
    const { testId, userId, search } = req.query;
    let query = {};

    if (testId) query.testId = testId;
    if (userId) query.userId = userId;

    const attempts = await TestAttempt.find(query)
      .populate('userId', 'name email phone')
      .populate('testId', 'title category')
      .sort({ createdAt: -1 });

    res.json(attempts);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get overall admin dashboard platform statistics
// @route   GET /api/attempts/admin/stats
// @access  Private/Admin
const getAdminDashboardStats = async (req, res) => {
  try {
    const totalUsers = await User.countDocuments({ role: 'user' });
    const totalTests = await Test.countDocuments({});
    const totalQuestions = await Question.countDocuments({});
    const testsCompleted = await TestAttempt.countDocuments({});

    const attempts = await TestAttempt.find({}, 'percentage');
    let averageScore = 0;
    if (attempts.length > 0) {
      const sumPct = attempts.reduce((acc, curr) => acc + (curr.percentage || 0), 0);
      averageScore = Math.round(sumPct / attempts.length);
    }

    const recentAttempts = await TestAttempt.find({})
      .populate('userId', 'name email')
      .populate('testId', 'title category')
      .sort({ createdAt: -1 })
      .limit(5);

    const categoryBreakdown = await Test.aggregate([
      { $group: { _id: '$category', count: { $sum: 1 } } }
    ]);

    res.json({
      totalUsers,
      totalTests,
      totalQuestions,
      testsCompleted,
      averageScore,
      recentAttempts,
      categoryBreakdown
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  submitTest,
  getUserHistory,
  getAttemptDetails,
  getAdminTestResults,
  getAdminDashboardStats
};
