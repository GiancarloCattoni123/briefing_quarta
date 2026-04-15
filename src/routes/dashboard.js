const express = require('express');
const router = express.Router();
const dashboardController = require('../controllers/dashboardController');
const authenticate = require('../middlewares/authMiddleware');

router.use(authenticate);

router.get('/summary', dashboardController.getSummary);
router.get('/by-user', dashboardController.getByUser);

module.exports = router;
