const express = require('express');
const { 
  ActivityController, 
  paginationValidation, 
  statsValidation 
} = require('../controllers/ActivityController');

const router = express.Router();

// GET /api/activities - Obtener todas las actividades
router.get('/', paginationValidation, ActivityController.getAll);

// GET /api/activities/stats - Obtener estadísticas
router.get('/stats', statsValidation, ActivityController.getStats);

// GET /api/activities/project/:projectId - Obtener actividades por proyecto
router.get('/project/:projectId', paginationValidation, ActivityController.getByProject);

// GET /api/activities/user/:userId - Obtener actividades por usuario
router.get('/user/:userId', paginationValidation, ActivityController.getByUser);

// POST /api/activities - Crear nueva actividad (para webhooks de GitHub)
router.post('/', ActivityController.create);

module.exports = router;
