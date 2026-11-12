const mongoose = require('mongoose');

const taskSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    title: {
      type: String,
      required: [true, 'Task title is required'],
      trim: true,
      maxlength: [200, 'Title cannot exceed 200 characters'],
    },
    description: {
      type: String,
      trim: true,
      default: '',
      maxlength: [2000, 'Description cannot exceed 2000 characters'],
    },
    category: {
      type: String,
      enum: ['College', 'Work', 'Personal', 'Finance', 'Health', 'Other'],
      default: 'Personal',
      index: true,
    },
    priority: {
      type: String,
      enum: ['Critical', 'High', 'Medium', 'Low'],
      default: 'Medium',
      index: true,
    },
    status: {
      type: String,
      enum: ['Pending', 'In Progress', 'Completed', 'Cancelled'],
      default: 'Pending',
      index: true,
    },
    deadline: {
      type: Date,
      default: null,
      index: true,
    },
    estimatedDuration: {
      type: Number,
      default: 30, // in minutes
      min: [1, 'Estimated duration must be at least 1 minute'],
    },
    isMandatory: {
      type: Boolean,
      default: false,
    },
    reminderPreference: {
      enabled: { type: Boolean, default: false },
      remindBeforeMinutes: { type: Number, default: 30 },
      type: { type: String, enum: ['browser', 'email', 'system'], default: 'browser' },
    },
    source: {
      type: String,
      enum: ['manual', 'gmail', 'whatsapp', 'calendar', 'ai'],
      default: 'manual',
    },
    completedAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

// Compound indexes for optimal queries and user data isolation
taskSchema.index({ userId: 1, status: 1 });
taskSchema.index({ userId: 1, deadline: 1 });
taskSchema.index({ userId: 1, category: 1 });
taskSchema.index({ userId: 1, priority: 1 });
taskSchema.index({ userId: 1, createdAt: -1 });

const Task = mongoose.model('Task', taskSchema);
module.exports = Task;
