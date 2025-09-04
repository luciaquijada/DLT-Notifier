const express = require('express');

const router = express.Router();

// Importar todas las rutas
const userRoutes = require('./users');
const projectRoutes = require('./projects');
const activityRoutes = require('./activities');

// Rutas principales
router.use('/users', userRoutes);
router.use('/projects', projectRoutes);
router.use('/activities', activityRoutes);

// Ruta de health check
router.get('/health', (req, res) => {
  res.json({
    success: true,
    message: 'API funcionando correctamente',
    timestamp: new Date().toISOString()
  });
});

// Ruta de información de la API
router.get('/', (req, res) => {
  res.json({
    success: true,
    message: 'GitHub Notifier API',
    version: '1.0.0',
    endpoints: {
      users: '/api/users',
      projects: '/api/projects',
      activities: '/api/activities',
      health: '/api/health'
    }
  });
});

module.exports = router;
