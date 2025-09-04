const Project = require('../models/Project');
const { body, validationResult } = require('express-validator');

class ProjectController {
  // Obtener todos los proyectos
  static async getAll(req, res) {
    try {
      const projects = await Project.getAll();
      res.json({
        success: true,
        data: projects
      });
    } catch (error) {
      console.error('Error obteniendo proyectos:', error);
      res.status(500).json({
        success: false,
        error: 'Error interno del servidor'
      });
    }
  }

  // Obtener proyecto por ID
  static async getById(req, res) {
    try {
      const { id } = req.params;
      const project = await Project.getById(id);
      
      if (!project) {
        return res.status(404).json({
          success: false,
          error: 'Proyecto no encontrado'
        });
      }

      res.json({
        success: true,
        data: project
      });
    } catch (error) {
      console.error('Error obteniendo proyecto:', error);
      res.status(500).json({
        success: false,
        error: 'Error interno del servidor'
      });
    }
  }

  // Crear nuevo proyecto
  static async create(req, res) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          error: 'Datos inválidos',
          details: errors.array()
        });
      }

      const projectData = req.body;
      const newProject = await Project.create(projectData);

      res.status(201).json({
        success: true,
        data: newProject
      });
    } catch (error) {
      console.error('Error creando proyecto:', error);
      
      if (error.code === '23505') {
        return res.status(409).json({
          success: false,
          error: 'El repositorio ya está registrado'
        });
      }

      res.status(500).json({
        success: false,
        error: 'Error interno del servidor'
      });
    }
  }

  // Actualizar proyecto
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
      const projectData = req.body;
      
      const updatedProject = await Project.update(id, projectData);

      res.json({
        success: true,
        data: updatedProject
      });
    } catch (error) {
      console.error('Error actualizando proyecto:', error);
      res.status(500).json({
        success: false,
        error: 'Error interno del servidor'
      });
    }
  }

  // Eliminar proyecto
  static async delete(req, res) {
    try {
      const { id } = req.params;
      await Project.delete(id);

      res.json({
        success: true,
        message: 'Proyecto eliminado exitosamente'
      });
    } catch (error) {
      console.error('Error eliminando proyecto:', error);
      res.status(500).json({
        success: false,
        error: 'Error interno del servidor'
      });
    }
  }

  // Obtener usuarios del proyecto
  static async getProjectUsers(req, res) {
    try {
      const { id } = req.params;
      const users = await Project.getProjectUsers(id);

      res.json({
        success: true,
        data: users
      });
    } catch (error) {
      console.error('Error obteniendo usuarios del proyecto:', error);
      res.status(500).json({
        success: false,
        error: 'Error interno del servidor'
      });
    }
  }

  // Añadir usuario al proyecto
  static async addUser(req, res) {
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
      const { user_id, role, notify_on_pr, notify_on_push } = req.body;
      
      const projectUser = await Project.addUserToProject(id, user_id, role, {
        notify_on_pr,
        notify_on_push
      });

      res.status(201).json({
        success: true,
        data: projectUser
      });
    } catch (error) {
      console.error('Error añadiendo usuario al proyecto:', error);
      
      if (error.code === '23505') {
        return res.status(409).json({
          success: false,
          error: 'El usuario ya está en el proyecto'
        });
      }

      res.status(500).json({
        success: false,
        error: 'Error interno del servidor'
      });
    }
  }

  // Remover usuario del proyecto
  static async removeUser(req, res) {
    try {
      const { id, userId } = req.params;
      await Project.removeUserFromProject(id, userId);

      res.json({
        success: true,
        message: 'Usuario removido del proyecto exitosamente'
      });
    } catch (error) {
      console.error('Error removiendo usuario del proyecto:', error);
      res.status(500).json({
        success: false,
        error: 'Error interno del servidor'
      });
    }
  }

  // Actualizar permisos del usuario en el proyecto
  static async updateUserPermissions(req, res) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          error: 'Datos inválidos',
          details: errors.array()
        });
      }

      const { id, userId } = req.params;
      const permissions = req.body;
      
      const updatedPermissions = await Project.updateUserPermissions(id, userId, permissions);

      res.json({
        success: true,
        data: updatedPermissions
      });
    } catch (error) {
      console.error('Error actualizando permisos:', error);
      res.status(500).json({
        success: false,
        error: 'Error interno del servidor'
      });
    }
  }
}

// Validaciones para crear/actualizar proyectos
const projectValidation = [
  body('name')
    .notEmpty()
    .withMessage('El nombre del proyecto es requerido')
    .isLength({ min: 1, max: 255 })
    .withMessage('El nombre debe tener entre 1 y 255 caracteres'),
  
  body('github_repo')
    .notEmpty()
    .withMessage('El repositorio de GitHub es requerido')
    .matches(/^[a-zA-Z0-9._-]+\/[a-zA-Z0-9._-]+$/)
    .withMessage('El formato del repositorio debe ser owner/repo'),
  
  body('description')
    .optional()
    .isLength({ max: 1000 })
    .withMessage('La descripción no puede tener más de 1000 caracteres'),
  
  body('emoji')
    .optional()
    .isLength({ max: 10 })
    .withMessage('El emoji no puede tener más de 10 caracteres'),
  
  body('is_active')
    .optional()
    .isBoolean()
    .withMessage('is_active debe ser un valor booleano')
];

// Validaciones para añadir usuarios al proyecto
const addUserValidation = [
  body('user_id')
    .notEmpty()
    .withMessage('El ID del usuario es requerido')
    .isUUID()
    .withMessage('Debe ser un UUID válido'),
  
  body('role')
    .optional()
    .isIn(['reviewer', 'maintainer', 'admin'])
    .withMessage('El rol debe ser reviewer, maintainer o admin'),
  
  body('notify_on_pr')
    .optional()
    .isBoolean()
    .withMessage('notify_on_pr debe ser un valor booleano'),
  
  body('notify_on_push')
    .optional()
    .isBoolean()
    .withMessage('notify_on_push debe ser un valor booleano')
];

// Validaciones para actualizar permisos
const updatePermissionsValidation = [
  body('role')
    .optional()
    .isIn(['reviewer', 'maintainer', 'admin'])
    .withMessage('El rol debe ser reviewer, maintainer o admin'),
  
  body('notify_on_pr')
    .optional()
    .isBoolean()
    .withMessage('notify_on_pr debe ser un valor booleano'),
  
  body('notify_on_push')
    .optional()
    .isBoolean()
    .withMessage('notify_on_push debe ser un valor booleano')
];

module.exports = {
  ProjectController,
  projectValidation,
  addUserValidation,
  updatePermissionsValidation
};
