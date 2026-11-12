const Task = require('../models/Task');
const Reminder = require('../models/Reminder');

// @desc    Get dashboard metrics & statistical breakdown
// @route   GET /api/dashboard/stats
// @access  Private
const getStats = async (req, res, next) => {
  try {
    const userId = req.user._id;
    const now = new Date();

    const [
      totalTasks,
      completedTasks,
      pendingTasks,
      inProgressTasks,
      overdueTasks,
      criticalTasks,
      activeReminders,
      categoryStats,
      priorityStats,
    ] = await Promise.all([
      Task.countDocuments({ userId }),
      Task.countDocuments({ userId, status: 'Completed' }),
      Task.countDocuments({ userId, status: 'Pending' }),
      Task.countDocuments({ userId, status: 'In Progress' }),
      Task.countDocuments({
        userId,
        deadline: { $lt: now },
        status: { $nin: ['Completed', 'Cancelled'] },
      }),
      Task.countDocuments({
        userId,
        priority: 'Critical',
        status: { $ne: 'Completed' },
      }),
      Reminder.countDocuments({
        userId,
        status: { $in: ['scheduled', 'snoozed'] },
      }),
      Task.aggregate([
        { $match: { userId } },
        { $group: { _id: '$category', count: { $sum: 1 } } },
      ]),
      Task.aggregate([
        { $match: { userId } },
        { $group: { _id: '$priority', count: { $sum: 1 } } },
      ]),
    ]);

    const completionRate =
      totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

    return res.status(200).json({
      success: true,
      stats: {
        totalTasks,
        completedTasks,
        pendingTasks,
        inProgressTasks,
        overdueTasks,
        criticalTasks,
        activeReminders,
        completionRate,
        categoryBreakdown: categoryStats.reduce((acc, curr) => {
          acc[curr._id] = curr.count;
          return acc;
        }, {}),
        priorityBreakdown: priorityStats.reduce((acc, curr) => {
          acc[curr._id] = curr.count;
          return acc;
        }, {}),
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get upcoming deadlines (next 7 days)
// @route   GET /api/dashboard/upcoming
// @access  Private
const getUpcoming = async (req, res, next) => {
  try {
    const userId = req.user._id;
    const now = new Date();
    const sevenDaysLater = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);

    const upcomingTasks = await Task.find({
      userId,
      deadline: { $gte: now, $lte: sevenDaysLater },
      status: { $ne: 'Completed' },
    })
      .sort({ deadline: 1 })
      .limit(10)
      .lean();

    const upcomingReminders = await Reminder.find({
      userId,
      remindAt: { $gte: now, $lte: sevenDaysLater },
      status: { $in: ['scheduled', 'snoozed'] },
    })
      .sort({ remindAt: 1 })
      .limit(10)
      .lean();

    return res.status(200).json({
      success: true,
      upcomingTasks,
      upcomingReminders,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get recent task and reminder activity
// @route   GET /api/dashboard/activity
// @access  Private
const getActivity = async (req, res, next) => {
  try {
    const userId = req.user._id;

    // Fetch most recently created/updated tasks
    const recentTasks = await Task.find({ userId })
      .sort({ updatedAt: -1 })
      .limit(6)
      .lean();

    return res.status(200).json({
      success: true,
      recentTasks,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getStats,
  getUpcoming,
  getActivity,
};
