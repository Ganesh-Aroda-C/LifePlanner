const Reminder = require('../models/Reminder');
const log = require('../utils/logger');

let workerInterval = null;
let isProcessing = false;

/**
 * Process due reminders.
 * Queries MongoDB for reminders that are due and not yet triggered.
 * Uses atomic updates to prevent duplicate execution across concurrent cycles.
 */
const processDueReminders = async () => {
  if (isProcessing) {
    return;
  }
  isProcessing = true;

  try {
    const now = new Date();

    // Find all due reminders
    const dueReminders = await Reminder.find({
      status: { $in: ['scheduled', 'snoozed'] },
      remindAt: { $lte: now },
    }).populate('userId', 'name email preferences');

    if (dueReminders.length > 0) {
      log.info(`[ReminderEngine] Processing ${dueReminders.length} due reminder(s)...`);
    }

    for (const reminder of dueReminders) {
      try {
        // Atomic status transition from scheduled/snoozed to triggered
        const updated = await Reminder.findOneAndUpdate(
          {
            _id: reminder._id,
            status: { $in: ['scheduled', 'snoozed'] },
          },
          {
            $set: { status: 'triggered' },
            $push: {
              deliveryHistory: {
                deliveredAt: new Date(),
                channel: reminder.type || 'browser',
                status: 'delivered',
                details: `Dispatched by LifePlanner ReminderEngine (Scheduled: ${reminder.remindAt.toISOString()})`,
              },
            },
          },
          { new: true }
        );

        if (updated) {
          log.info(
            `[ReminderEngine] Reminder "${updated.title}" marked as TRIGGERED for user ${reminder.userId?._id}`
          );

          // Phase 1: Local In-Memory / SSE / Polling notification channel.
          // In Phase 4, this hooks into BullMQ queue: reminderQueue.add('send-push', { ... })
        }
      } catch (err) {
        log.error(`[ReminderEngine] Failed to process reminder ${reminder._id}:`, err.message);
      }
    }
  } catch (error) {
    log.error('[ReminderEngine] Error in processing cycle:', error.message);
  } finally {
    isProcessing = false;
  }
};

/**
 * Start the reminder processing worker.
 * Default polling frequency is 30 seconds.
 */
const startReminderWorker = (intervalMs = 30000) => {
  if (workerInterval) {
    clearInterval(workerInterval);
  }

  log.info(`[ReminderEngine] Started background reminder processor (interval: ${intervalMs / 1000}s).`);
  // Run once immediately on start
  processDueReminders();

  workerInterval = setInterval(() => {
    processDueReminders();
  }, intervalMs);
};

/**
 * Stop the reminder processor gracefully.
 */
const stopReminderWorker = () => {
  if (workerInterval) {
    clearInterval(workerInterval);
    workerInterval = null;
    log.info('[ReminderEngine] Background reminder processor stopped.');
  }
};

module.exports = {
  processDueReminders,
  startReminderWorker,
  stopReminderWorker,
};
