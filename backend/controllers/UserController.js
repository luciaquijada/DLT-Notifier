const User = require('../models/User');
const { body, validationResult } = require('express-validator');

class UserController {
  // Obtener todos los usuarios
  static async getAll(req, res) {
    try {
      const users = await User.getAll();
      res.json({
        success: true,
        data: users
      });
    } catch (error) {
      console.error('Error obteniendo usuarios:', error);
      res.status(500).json({
        success: false,
        error: 'Error interno del servidor'
      });
    }
  }

  // Obtener usuario por ID
  static async getById(req, res) {
    try {
      const { id } = req.params;
      const user = await User.getById(id);
      
      if (!user) {
        return res.status(404).json({
          success: false,
          error: 'Usuario no encontrado'
        });
      }

      res.json({
        success: true,
        data: user
      });
    } catch (error) {
      console.error('Error obteniendo usuario:', error);
      res.status(500).json({
        success: false,
        error: 'Error interno del servidor'
      });
    }
  }

  // Crear nuevo usuario
  static async create(req, res) {
    try {
      // Validar datos de entrada
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          error: 'Datos inválidos',
          details: errors.array()
        });
      }

      const userData = req.body;
      const newUser = await User.create(userData);

      res.status(201).json({
        success: true,
        data: newUser
      });
    } catch (error) {
      console.error('Error creando usuario:', error);
      
      // Manejar errores de duplicado
      if (error.code === '23505') {
        return res.status(409).json({
          success: false,
          error: 'El usuario ya existe'
        });
      }

      res.status(500).json({
        success: false,
        error: 'Error interno del servidor'
      });
    }
  }

  // Actualizar usuario
  static async update(req, res) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          error: 'Datos inválidos',
          details: errors.array()
        });
      }

      const { id } = req.params;
      const userData = req.body;
      
      const updatedUser = await User.update(id, userData);

      res.json({
        success: true,
        data: updatedUser
      });
    } catch (error) {
      console.error('Error actualizando usuario:', error);
      res.status(500).json({
        success: false,
        error: 'Error interno del servidor'
      });
    }
  }

  // Eliminar usuario (soft delete)
  static async delete(req, res) {
    try {
      const { id } = req.params;
      await User.delete(id);

      res.json({
        success: true,
        message: 'Usuario eliminado exitosamente'
      });
    } catch (error) {
      console.error('Error eliminando usuario:', error);
      res.status(500).json({
        success: false,
        error: 'Error interno del servidor'
      });
    }
  }

  // Obtener proyectos del usuario
  static async getUserProjects(req, res) {
    try {
      const { id } = req.params;
      const projects = await User.getUserProjects(id);

      res.json({
        success: true,
        data: projects
      });
    } catch (error) {
      console.error('Error obteniendo proyectos del usuario:', error);
      res.status(500).json({
        success: false,
        error: 'Error interno del servidor'
      });
    }
  }
}

// Validaciones para crear/actualizar usuarios
const userValidation = [
  body('github_username')
    .notEmpty()
    .withMessage('El nombre de usuario de GitHub es requerido')
    .isLength({ min: 1, max: 255 })
    .withMessage('El nombre de usuario debe tener entre 1 y 255 caracteres'),
  
  body('slack_user_id')
    .notEmpty()
    .withMessage('El ID de usuario de Slack es requerido')
    .isLength({ min: 1, max: 255 })
    .withMessage('El ID de Slack debe tener entre 1 y 255 caracteres'),
  
  body('display_name')
    .optional()
    .isLength({ max: 255 })
    .withMessage('El nombre a mostrar no puede tener más de 255 caracteres'),
  
  body('email')
    .optional()
    .isEmail()
    .withMessage('Debe ser un email válido'),
  
  body('is_active')
    .optional()
    .isBoolean()
    .withMessage('is_active debe ser un valor booleano')
];

module.exports = {
  UserController,
  userValidation
};
