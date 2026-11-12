const express = require('express');
const {
  getStats,
  getUpcoming,
  getActivity,
} = require('../controllers/dashboardController');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

router.use(protect);

router.get('/stats', getStats);
router.get('/upcoming', getUpcoming);
router.get('/activity', getActivity);

module.exports = router;
