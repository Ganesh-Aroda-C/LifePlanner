const express = require('express');
const { body } = require('express-validator');
const {
  getTasks,
  getTaskById,
  createTask,
  updateTask,
  toggleComplete,
  deleteTask,
} = require('../controllers/taskController');
const { protect } = require('../middleware/authMiddleware');
const { validate } = require('../middleware/validateMiddleware');

const router = express.Router();

// All task routes require authentication
router.use(protect);

const taskValidation = [
  body('title').trim().notEmpty().withMessage('Task title is required'),
  body('category')
    .optional()
    .isIn(['College', 'Work', 'Personal', 'Finance', 'Health', 'Other'])
    .withMessage('Invalid category'),
  body('priority')
    .optional()
    .isIn(['Critical', 'High', 'Medium', 'Low'])
    .withMessage('Invalid priority level'),
  body('status')
    .optional()
    .isIn(['Pending', 'In Progress', 'Completed', 'Cancelled'])
    .withMessage('Invalid status'),
  validate,
];

router.get('/', getTasks);
router.post('/', taskValidation, createTask);
router.get('/:id', getTaskById);
router.put('/:id', taskValidation, updateTask);
router.patch('/:id/complete', toggleComplete);
router.delete('/:id', deleteTask);

module.exports = router;
