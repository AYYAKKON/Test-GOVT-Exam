const mongoose = require('mongoose');

const sectionResultSchema = new mongoose.Schema({
  sectionId: { type: mongoose.Schema.Types.ObjectId, ref: 'Section' },
  sectionName: String,
  score: Number,
  maxScore: Number,
  correctCount: Number,
  wrongCount: Number,
  unansweredCount: Number,
  timeSpentSeconds: Number
}, { _id: false });

const answerRecordSchema = new mongoose.Schema({
  questionId: { type: mongoose.Schema.Types.ObjectId, ref: 'Question' },
  selectedOption: String, // e.g. 'A', 'B', 'C', 'D' or null
  status: {
    type: String,
    enum: ['answered', 'unanswered', 'marked_for_review', 'answered_and_marked'],
    default: 'unanswered'
  },
  isCorrect: Boolean,
  correctOption: String
}, { _id: false });

const testAttemptSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    testId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Test',
      required: true
    },
    startedAt: {
      type: Date,
      default: Date.now
    },
    completedAt: Date,
    timeTakenSeconds: {
      type: Number,
      default: 0
    },
    answers: [answerRecordSchema],
    score: {
      type: Number,
      default: 0
    },
    maxScore: {
      type: Number,
      default: 0
    },
    percentage: {
      type: Number,
      default: 0
    },
    correctCount: {
      type: Number,
      default: 0
    },
    wrongCount: {
      type: Number,
      default: 0
    },
    unansweredCount: {
      type: Number,
      default: 0
    },
    sectionResults: [sectionResultSchema]
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model('TestAttempt', testAttemptSchema);
