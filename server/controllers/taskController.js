const Task = require('../models/Task');
const Reminder = require('../models/Reminder');

// @desc    Get all tasks for current user with filters & sorting
// @route   GET /api/tasks
// @access  Private
const getTasks = async (req, res, next) => {
  try {
    const { category, priority, status, search, overdue, sort, page = 1, limit = 50 } = req.query;

    const query = { userId: req.user._id };

    if (category && category !== 'All') {
      query.category = category;
    }

    if (priority && priority !== 'All') {
      query.priority = priority;
    }

    if (status && status !== 'All') {
      query.status = status;
    }

    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
      ];
    }

    if (overdue === 'true') {
      query.deadline = { $lt: new Date() };
      query.status = { $nin: ['Completed', 'Cancelled'] };
    }

    let sortOption = { deadline: 1, createdAt: -1 };
    if (sort === 'deadline_asc') sortOption = { deadline: 1 };
    if (sort === 'deadline_desc') sortOption = { deadline: -1 };
    if (sort === 'priority') sortOption = { priority: 1, deadline: 1 };
    if (sort === 'created_desc') sortOption = { createdAt: -1 };
    if (sort === 'title_asc') sortOption = { title: 1 };

    const pageNum = parseInt(page, 10);
    const limitNum = parseInt(limit, 10);
    const skip = (pageNum - 1) * limitNum;

    const [tasks, total] = await Promise.all([
      Task.find(query)
        .sort(sortOption)
        .skip(skip)
        .limit(limitNum)
        .lean(),
      Task.countDocuments(query),
    ]);

    return res.status(200).json({
      success: true,
      total,
      page: pageNum,
      pages: Math.ceil(total / limitNum) || 1,
      tasks,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single task by ID
// @route   GET /api/tasks/:id
// @access  Private
const getTaskById = async (req, res, next) => {
  try {
    const task = await Task.findOne({
      _id: req.params.id,
      userId: req.user._id,
    });

    if (!task) {
      return res.status(404).json({
        success: false,
        message: 'Task not found or access denied.',
      });
    }

    return res.status(200).json({
      success: true,
      task,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Create new task
// @route   POST /api/tasks
// @access  Private
const createTask = async (req, res, next) => {
  try {
    const {
      title,
      description,
      category,
      priority,
      status,
      deadline,
      estimatedDuration,
      isMandatory,
      reminderPreference,
      source,
    } = req.body;

    const task = await Task.create({
      userId: req.user._id,
      title: title.trim(),
      description: description ? description.trim() : '',
      category: category || 'Personal',
      priority: priority || 'Medium',
      status: status || 'Pending',
      deadline: deadline ? new Date(deadline) : null,
      estimatedDuration: estimatedDuration || 30,
      isMandatory: Boolean(isMandatory),
      reminderPreference: reminderPreference || { enabled: false },
      source: source || 'manual',
    });

    // Auto-create a linked reminder if reminderPreference is enabled and deadline is set
    if (reminderPreference?.enabled && task.deadline) {
      const minutesBefore = reminderPreference.remindBeforeMinutes || 30;
      const remindAt = new Date(task.deadline.getTime() - minutesBefore * 60000);

      // Only schedule if remindAt is in the future or close to now
      if (remindAt > new Date(Date.now() - 60000)) {
        await Reminder.create({
          userId: req.user._id,
          taskId: task._id,
          title: `Deadline approaching: ${task.title}`,
          remindAt,
          type: reminderPreference.type || 'browser',
          status: 'scheduled',
          notes: `Automatic reminder scheduled ${minutesBefore} minutes before deadline.`,
        });
      }
    }

    return res.status(201).json({
      success: true,
      message: 'Task created successfully.',
      task,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update an existing task
// @route   PUT /api/tasks/:id
// @access  Private
const updateTask = async (req, res, next) => {
  try {
    const task = await Task.findOne({
      _id: req.params.id,
      userId: req.user._id,
    });

    if (!task) {
      return res.status(404).json({
        success: false,
        message: 'Task not found or access denied.',
      });
    }

    const {
      title,
      description,
      category,
      priority,
      status,
      deadline,
      estimatedDuration,
      isMandatory,
      reminderPreference,
    } = req.body;

    if (title !== undefined) task.title = title.trim();
    if (description !== undefined) task.description = description.trim();
    if (category !== undefined) task.category = category;
    if (priority !== undefined) task.priority = priority;
    if (status !== undefined) {
      task.status = status;
      if (status === 'Completed' && !task.completedAt) {
        task.completedAt = new Date();
      } else if (status !== 'Completed') {
        task.completedAt = null;
      }
    }
    if (deadline !== undefined) task.deadline = deadline ? new Date(deadline) : null;
    if (estimatedDuration !== undefined) task.estimatedDuration = estimatedDuration;
    if (isMandatory !== undefined) task.isMandatory = Boolean(isMandatory);
    if (reminderPreference !== undefined) task.reminderPreference = reminderPreference;

    await task.save();

    return res.status(200).json({
      success: true,
      message: 'Task updated successfully.',
      task,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Toggle task completion / Reopen
// @route   PATCH /api/tasks/:id/complete
// @access  Private
const toggleComplete = async (req, res, next) => {
  try {
    const task = await Task.findOne({
      _id: req.params.id,
      userId: req.user._id,
    });

    if (!task) {
      return res.status(404).json({
        success: false,
        message: 'Task not found or access denied.',
      });
    }

    const isNowCompleted = task.status !== 'Completed';
    task.status = isNowCompleted ? 'Completed' : 'Pending';
    task.completedAt = isNowCompleted ? new Date() : null;

    await task.save();

    return res.status(200).json({
      success: true,
      message: isNowCompleted ? 'Task marked as completed.' : 'Task reopened.',
      task,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete a task
// @route   DELETE /api/tasks/:id
// @access  Private
const deleteTask = async (req, res, next) => {
  try {
    const task = await Task.findOneAndDelete({
      _id: req.params.id,
      userId: req.user._id,
    });

    if (!task) {
      return res.status(404).json({
        success: false,
        message: 'Task not found or access denied.',
      });
    }

    // Clean up any linked reminders
    await Reminder.deleteMany({ taskId: task._id });

    return res.status(200).json({
      success: true,
      message: 'Task and linked reminders deleted successfully.',
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getTasks,
  getTaskById,
  createTask,
  updateTask,
  toggleComplete,
  deleteTask,
};
