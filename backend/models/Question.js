const mongoose = require('mongoose');

const optionSchema = new mongoose.Schema({
  key: { type: String, required: true }, // 'A', 'B', 'C', 'D'
  text: { type: String, required: true }
}, { _id: false });

const questionSchema = new mongoose.Schema(
  {
    testId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Test',
      required: true
    },
    sectionId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Section',
      required: true
    },
    questionNumber: {
      type: Number,
      default: 1
    },
    questionText: {
      type: String,
      required: [true, 'Question text is required']
    },
    options: [optionSchema],
    correctAnswer: {
      type: String,
      required: [true, 'Correct answer key is required'],
      uppercase: true
    },
    explanation: {
      type: String,
      default: ''
    }
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model('Question', questionSchema);
