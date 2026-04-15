const express = require('express');
const router = express.Router();
const taskController = require('../controllers/taskController');
const authenticate = require('../middlewares/authMiddleware');
const { isAdmin } = require('../middlewares/roleMiddleware');

router.use(authenticate);

// A regra diz GET /overdue deve ser todos, mas tem que vir antes do /:id para não conflitar a rota
router.get('/overdue', taskController.getOverdueTasks);

router.get('/', taskController.listTasks);
router.post('/', isAdmin, taskController.createTask);
router.get('/:id', taskController.getTaskById);
router.put('/:id', isAdmin, taskController.updateTask);
router.patch('/:id/status', taskController.updateTaskStatus); // member e admin
router.delete('/:id', isAdmin, taskController.deleteTask);

module.exports = router;
