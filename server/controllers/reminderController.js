const Reminder = require('../models/Reminder');
const Task = require('../models/Task');

// @desc    Get all reminders for current user
// @route   GET /api/reminders
// @access  Private
const getReminders = async (req, res, next) => {
  try {
    const { status, upcomingOnly } = req.query;

    const query = { userId: req.user._id };

    if (status && status !== 'all') {
      query.status = status;
    }

    if (upcomingOnly === 'true') {
      query.status = { $in: ['scheduled', 'snoozed', 'triggered'] };
    }

    const reminders = await Reminder.find(query)
      .populate('taskId', 'title category priority deadline')
      .sort({ remindAt: 1 })
      .lean();

    return res.status(200).json({
      success: true,
      total: reminders.length,
      reminders,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Create a new reminder
// @route   POST /api/reminders
// @access  Private
const createReminder = async (req, res, next) => {
  try {
    const { title, taskId, remindAt, type, repeatInterval, notes } = req.body;

    // Verify task ownership if taskId is supplied
    if (taskId) {
      const task = await Task.findOne({ _id: taskId, userId: req.user._id });
      if (!task) {
        return res.status(404).json({
          success: false,
          message: 'Referenced task not found or unauthorized.',
        });
      }
    }

    const reminder = await Reminder.create({
      userId: req.user._id,
      taskId: taskId || null,
      title: title.trim(),
      remindAt: new Date(remindAt),
      type: type || 'browser',
      repeatInterval: repeatInterval || 'none',
      status: 'scheduled',
      notes: notes ? notes.trim() : '',
    });

    const populatedReminder = await Reminder.findById(reminder._id).populate(
      'taskId',
      'title category priority'
    );

    return res.status(201).json({
      success: true,
      message: 'Reminder scheduled successfully.',
      reminder: populatedReminder,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update a reminder
// @route   PUT /api/reminders/:id
// @access  Private
const updateReminder = async (req, res, next) => {
  try {
    const reminder = await Reminder.findOne({
      _id: req.params.id,
      userId: req.user._id,
    });

    if (!reminder) {
      return res.status(404).json({
        success: false,
        message: 'Reminder not found or access denied.',
      });
    }

    const { title, remindAt, type, repeatInterval, notes, status } = req.body;

    if (title !== undefined) reminder.title = title.trim();
    if (remindAt !== undefined) {
      reminder.remindAt = new Date(remindAt);
      if (reminder.status === 'triggered' || reminder.status === 'acknowledged') {
        reminder.status = 'scheduled';
      }
    }
    if (type !== undefined) reminder.type = type;
    if (repeatInterval !== undefined) reminder.repeatInterval = repeatInterval;
    if (notes !== undefined) reminder.notes = notes.trim();
    if (status !== undefined) reminder.status = status;

    await reminder.save();

    return res.status(200).json({
      success: true,
      message: 'Reminder updated successfully.',
      reminder,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Acknowledge a reminder
// @route   PATCH /api/reminders/:id/acknowledge
// @access  Private
const acknowledgeReminder = async (req, res, next) => {
  try {
    const reminder = await Reminder.findOne({
      _id: req.params.id,
      userId: req.user._id,
    });

    if (!reminder) {
      return res.status(404).json({
        success: false,
        message: 'Reminder not found or access denied.',
      });
    }

    reminder.status = 'acknowledged';
    reminder.acknowledgedAt = new Date();

    // Check repeat interval: if recurring, schedule next occurrence
    if (reminder.repeatInterval === 'daily') {
      const nextDate = new Date(reminder.remindAt.getTime() + 24 * 60 * 60 * 1000);
      reminder.remindAt = nextDate;
      reminder.status = 'scheduled';
    } else if (reminder.repeatInterval === 'weekly') {
      const nextDate = new Date(reminder.remindAt.getTime() + 7 * 24 * 60 * 60 * 1000);
      reminder.remindAt = nextDate;
      reminder.status = 'scheduled';
    }

    await reminder.save();

    return res.status(200).json({
      success: true,
      message: 'Reminder acknowledged.',
      reminder,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Snooze a reminder
// @route   PATCH /api/reminders/:id/snooze
// @access  Private
const snoozeReminder = async (req, res, next) => {
  try {
    const { minutes = 15 } = req.body;

    const reminder = await Reminder.findOne({
      _id: req.params.id,
      userId: req.user._id,
    });

    if (!reminder) {
      return res.status(404).json({
        success: false,
        message: 'Reminder not found or access denied.',
      });
    }

    const snoozeMs = parseInt(minutes, 10) * 60 * 1000;
    const snoozedUntil = new Date(Date.now() + snoozeMs);

    reminder.remindAt = snoozedUntil;
    reminder.snoozedUntil = snoozedUntil;
    reminder.status = 'snoozed';

    await reminder.save();

    return res.status(200).json({
      success: true,
      message: `Reminder snoozed for ${minutes} minutes.`,
      reminder,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete a reminder
// @route   DELETE /api/reminders/:id
// @access  Private
const deleteReminder = async (req, res, next) => {
  try {
    const reminder = await Reminder.findOneAndDelete({
      _id: req.params.id,
      userId: req.user._id,
    });

    if (!reminder) {
      return res.status(404).json({
        success: false,
        message: 'Reminder not found or access denied.',
      });
    }

    return res.status(200).json({
      success: true,
      message: 'Reminder deleted successfully.',
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getReminders,
  createReminder,
  updateReminder,
  acknowledgeReminder,
  snoozeReminder,
  deleteReminder,
};
