const mongoose = require('mongoose');

const sectionSchema = new mongoose.Schema(
  {
    testId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Test',
      required: true
    },
    name: {
      type: String,
      required: [true, 'Section name is required'],
      trim: true
    },
    duration: {
      type: Number,
      required: [true, 'Section duration in minutes is required'],
      min: 1
    },
    order: {
      type: Number,
      default: 0
    }
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model('Section', sectionSchema);
