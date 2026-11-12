const mongoose = require('mongoose');

const reminderSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    taskId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Task',
      default: null,
      index: true,
    },
    title: {
      type: String,
      required: [true, 'Reminder title is required'],
      trim: true,
      maxlength: [200, 'Title cannot exceed 200 characters'],
    },
    remindAt: {
      type: Date,
      required: [true, 'Reminder date/time is required'],
      index: true,
    },
    type: {
      type: String,
      enum: ['browser', 'email', 'system'],
      default: 'browser',
    },
    repeatInterval: {
      type: String,
      enum: ['none', 'daily', 'weekly', 'custom'],
      default: 'none',
    },
    status: {
      type: String,
      enum: ['scheduled', 'triggered', 'acknowledged', 'snoozed', 'cancelled'],
      default: 'scheduled',
      index: true,
    },
    acknowledgedAt: {
      type: Date,
      default: null,
    },
    snoozedUntil: {
      type: Date,
      default: null,
    },
    deliveryHistory: [
      {
        deliveredAt: {
          type: Date,
          default: Date.now,
        },
        channel: {
          type: String,
          default: 'browser',
        },
        status: {
          type: String,
          enum: ['delivered', 'failed', 'pending'],
          default: 'delivered',
        },
        details: {
          type: String,
          default: '',
        },
      },
    ],
    notes: {
      type: String,
      trim: true,
      default: '',
      maxlength: [1000, 'Notes cannot exceed 1000 characters'],
    },
  },
  {
    timestamps: true,
  }
);

// Compound indexes for polling and filtering
reminderSchema.index({ status: 1, remindAt: 1 });
reminderSchema.index({ userId: 1, remindAt: 1 });
reminderSchema.index({ userId: 1, status: 1 });

const Reminder = mongoose.model('Reminder', reminderSchema);
module.exports = Reminder;
