const Activity = require('../models/Activity');
const { query, validationResult } = require('express-validator');

class ActivityController {
  // Obtener todas las actividades
  static async getAll(req, res) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          error: 'Parámetros inválidos',
          details: errors.array()
        });
      }

      const limit = parseInt(req.query.limit) || 50;
      const offset = parseInt(req.query.offset) || 0;
      
      const activities = await Activity.getAll(limit, offset);
      
      res.json({
        success: true,
        data: activities,
        pagination: {
          limit,
          offset,
          count: activities.length
        }
      });
    } catch (error) {
      console.error('Error obteniendo actividades:', error);
      res.status(500).json({
        success: false,
        error: 'Error interno del servidor'
      });
    }
  }

  // Obtener actividades por proyecto
  static async getByProject(req, res) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          error: 'Parámetros inválidos',
          details: errors.array()
        });
      }

      const { projectId } = req.params;
      const limit = parseInt(req.query.limit) || 50;
      const offset = parseInt(req.query.offset) || 0;
      
      const activities = await Activity.getByProject(projectId, limit, offset);
      
      res.json({
        success: true,
        data: activities,
        pagination: {
          limit,
          offset,
          count: activities.length
        }
      });
    } catch (error) {
      console.error('Error obteniendo actividades del proyecto:', error);
      res.status(500).json({
        success: false,
        error: 'Error interno del servidor'
      });
    }
  }

  // Obtener actividades por usuario
  static async getByUser(req, res) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          error: 'Parámetros inválidos',
          details: errors.array()
        });
      }

      const { userId } = req.params;
      const limit = parseInt(req.query.limit) || 50;
      const offset = parseInt(req.query.offset) || 0;
      
      const activities = await Activity.getByUser(userId, limit, offset);
      
      res.json({
        success: true,
        data: activities,
        pagination: {
          limit,
          offset,
          count: activities.length
        }
      });
    } catch (error) {
      console.error('Error obteniendo actividades del usuario:', error);
      res.status(500).json({
        success: false,
        error: 'Error interno del servidor'
      });
    }
  }

  // Crear nueva actividad
  static async create(req, res) {
    try {
      const activityData = req.body;
      const newActivity = await Activity.create(activityData);

      res.status(201).json({
        success: true,
        data: newActivity
      });
    } catch (error) {
      console.error('Error creando actividad:', error);
      res.status(500).json({
        success: false,
        error: 'Error interno del servidor'
      });
    }
  }

  // Obtener estadísticas
  static async getStats(req, res) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          error: 'Parámetros inválidos',
          details: errors.array()
        });
      }

      const { projectId } = req.query;
      const timeframe = req.query.timeframe || '7 days';
      
      const stats = await Activity.getStats(projectId, timeframe);
      
      res.json({
        success: true,
        data: stats
      });
    } catch (error) {
      console.error('Error obteniendo estadísticas:', error);
      res.status(500).json({
        success: false,
        error: 'Error interno del servidor'
      });
    }
  }
}

// Validaciones para paginación
const paginationValidation = [
  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage('El límite debe ser un número entre 1 y 100'),
  
  query('offset')
    .optional()
    .isInt({ min: 0 })
    .withMessage('El offset debe ser un número mayor o igual a 0')
];

// Validaciones para estadísticas
const statsValidation = [
  query('projectId')
    .optional()
    .isUUID()
    .withMessage('projectId debe ser un UUID válido'),
  
  query('timeframe')
    .optional()
    .isIn(['24 hours', '7 days', '30 days'])
    .withMessage('timeframe debe ser: 24 hours, 7 days o 30 days')
];

module.exports = {
  ActivityController,
  paginationValidation,
  statsValidation
};
