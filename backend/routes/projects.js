const express = require('express');
const { 
  ProjectController, 
  projectValidation, 
  addUserValidation, 
  updatePermissionsValidation 
} = require('../controllers/ProjectController');

const router = express.Router();

// GET /api/projects - Obtener todos los proyectos
router.get('/', ProjectController.getAll);

// GET /api/projects/:id - Obtener proyecto por ID
router.get('/:id', ProjectController.getById);

// POST /api/projects - Crear nuevo proyecto
router.post('/', projectValidation, ProjectController.create);

// PUT /api/projects/:id - Actualizar proyecto
router.put('/:id', projectValidation, ProjectController.update);

// DELETE /api/projects/:id - Eliminar proyecto
router.delete('/:id', ProjectController.delete);

// GET /api/projects/:id/users - Obtener usuarios del proyecto
router.get('/:id/users', ProjectController.getProjectUsers);

// POST /api/projects/:id/users - Añadir usuario al proyecto
router.post('/:id/users', addUserValidation, ProjectController.addUser);

// DELETE /api/projects/:id/users/:userId - Remover usuario del proyecto
router.delete('/:id/users/:userId', ProjectController.removeUser);

// PUT /api/projects/:id/users/:userId - Actualizar permisos del usuario
router.put('/:id/users/:userId', updatePermissionsValidation, ProjectController.updateUserPermissions);

module.exports = router;
