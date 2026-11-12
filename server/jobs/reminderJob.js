const { startReminderWorker, stopReminderWorker } = require('../services/reminderEngine');
const log = require('../utils/logger');

const initReminderJob = () => {
  const intervalMs = process.env.REMINDER_POLL_INTERVAL_MS
    ? parseInt(process.env.REMINDER_POLL_INTERVAL_MS, 10)
    : 30000;

  startReminderWorker(intervalMs);

  const shutdownHandler = () => {
    log.info('Received termination signal. Shutting down reminder worker...');
    stopReminderWorker();
  };

  process.once('SIGINT', shutdownHandler);
  process.once('SIGTERM', shutdownHandler);
};

module.exports = { initReminderJob };
