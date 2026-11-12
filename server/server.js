require('dotenv').config();
const app = require('./app');
const { connectDB } = require('./config/db');
const { initReminderJob } = require('./jobs/reminderJob');
const log = require('./utils/logger');

const PORT = process.env.PORT || 5000;

// Start server
const startServer = async () => {
  try {
    // 1. Connect to Database
    await connectDB();

    // 2. Initialize Reminder Engine background processor
    initReminderJob();

    // 3. Start HTTP Listener
    const server = app.listen(PORT, () => {
      log.info(`🚀 LifeOS Backend running in ${process.env.NODE_ENV || 'development'} mode on port ${PORT}`);
      log.info(`📍 Health check: http://localhost:${PORT}/api/health`);
    });

    // Handle unhandled promise rejections
    process.on('unhandledRejection', (err) => {
      log.error(`Unhandled Rejection: ${err.message}`, err);
      // Keep running in dev, close gracefully in prod if needed
    });

    return server;
  } catch (error) {
    log.error(`Failed to launch server: ${error.message}`);
    process.exit(1);
  }
};

startServer();
