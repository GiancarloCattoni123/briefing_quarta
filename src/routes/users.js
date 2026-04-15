const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const authenticate = require('../middlewares/authMiddleware');
const { isAdmin } = require('../middlewares/roleMiddleware');

// Rotas abertas a todos os autenticados
router.use(authenticate);
router.get('/me', userController.getMe);
router.put('/me/password', userController.updateMyPassword);

// Rotas restritas para admin
router.get('/', isAdmin, userController.listUsers);
router.post('/', isAdmin, userController.createUser);

// Rotas que buscam por ID e precisam estar na base ou Admin
router.get('/:id', userController.getUserById); // Pela regra: todos acessam os dados básicos
router.put('/:id', isAdmin, userController.updateUser);
router.delete('/:id', isAdmin, userController.deactivateUser);

module.exports = router;
