const express = require('express');
const { UserController, userValidation } = require('../controllers/UserController');

const router = express.Router();

// GET /api/users - Obtener todos los usuarios
router.get('/', UserController.getAll);

// GET /api/users/:id - Obtener usuario por ID
router.get('/:id', UserController.getById);

// POST /api/users - Crear nuevo usuario
router.post('/', userValidation, UserController.create);

// PUT /api/users/:id - Actualizar usuario
router.put('/:id', userValidation, UserController.update);

// DELETE /api/users/:id - Eliminar usuario
router.delete('/:id', UserController.delete);

// GET /api/users/:id/projects - Obtener proyectos del usuario
router.get('/:id/projects', UserController.getUserProjects);

module.exports = router;
