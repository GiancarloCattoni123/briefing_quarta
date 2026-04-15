const express = require('express');
const router = express.Router();
const projectController = require('../controllers/projectController');
const authenticate = require('../middlewares/authMiddleware');
const { isAdmin } = require('../middlewares/roleMiddleware');

router.use(authenticate);

router.get('/', projectController.listProjects);
router.post('/', isAdmin, projectController.createProject);
router.get('/:id', projectController.getProjectById);
router.put('/:id', isAdmin, projectController.updateProject);
router.delete('/:id', isAdmin, projectController.deleteProject);

module.exports = router;
