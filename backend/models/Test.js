const mongoose = require('mongoose');

const testSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Test title is required'],
      trim: true
    },
    category: {
      type: String,
      required: [true, 'Exam category is required'],
      trim: true
    },
    description: {
      type: String,
      default: ''
    },
    totalQuestions: {
      type: Number,
      default: 0
    },
    totalDuration: {
      type: Number,
      default: 0 // In minutes
    },
    totalMarks: {
      type: Number,
      default: 0
    },
    status: {
      type: String,
      enum: ['Draft', 'Published', 'Unpublished', 'Archived'],
      default: 'Draft'
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    }
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model('Test', testSchema);
