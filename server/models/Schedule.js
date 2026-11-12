const mongoose = require('mongoose');

const scheduleSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    title: {
      type: String,
      required: [true, 'Schedule title is required'],
      trim: true,
      maxlength: [200, 'Title cannot exceed 200 characters'],
    },
    startTime: {
      type: Date,
      required: [true, 'Start time is required'],
      index: true,
    },
    endTime: {
      type: Date,
      required: [true, 'End time is required'],
      index: true,
    },
    category: {
      type: String,
      default: 'Work',
      trim: true,
    },
    taskId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Task',
      default: null,
    },
    source: {
      type: String,
      enum: ['manual', 'google_calendar', 'ai_suggestion'],
      default: 'manual',
    },
    location: {
      type: String,
      trim: true,
      default: '',
    },
    notes: {
      type: String,
      trim: true,
      default: '',
    },
  },
  {
    timestamps: true,
  }
);

scheduleSchema.index({ userId: 1, startTime: 1, endTime: 1 });

const Schedule = mongoose.model('Schedule', scheduleSchema);
module.exports = Schedule;
