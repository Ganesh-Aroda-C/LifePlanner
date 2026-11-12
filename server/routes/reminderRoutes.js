const express = require('express');
const { body } = require('express-validator');
const {
  getReminders,
  createReminder,
  updateReminder,
  acknowledgeReminder,
  snoozeReminder,
  deleteReminder,
} = require('../controllers/reminderController');
const { protect } = require('../middleware/authMiddleware');
const { validate } = require('../middleware/validateMiddleware');

const router = express.Router();

router.use(protect);

const reminderValidation = [
  body('title').trim().notEmpty().withMessage('Reminder title is required'),
  body('remindAt')
    .notEmpty()
    .withMessage('Reminder date/time is required')
    .isISO8601()
    .withMessage('Reminder date/time must be a valid ISO8601 date'),
  validate,
];

router.get('/', getReminders);
router.post('/', reminderValidation, createReminder);
router.put('/:id', updateReminder);
router.patch('/:id/acknowledge', acknowledgeReminder);
router.patch('/:id/snooze', snoozeReminder);
router.delete('/:id', deleteReminder);

module.exports = router;
