const User = require('../models/User');
const Project = require('../models/Project');
const Activity = require('../models/Activity');
const SlackService = require('./SlackService');

class GitHubWebhookService {
  static async handlePullRequest(payload) {
    try {
      console.log(`🔔 Procesando evento: pull_request para ${payload.repository.full_name}`);
      console.log(`📄 Datos del evento:`, {
        action: payload.action,
        after: payload.after,
        before: payload.before,
        number: payload.number,
        pull_request: {
          // Solo log de campos relevantes para reducir ruido
          number: payload.pull_request.number,
          title: payload.pull_request.title,
          user: { login: payload.pull_request.user.login },
          html_url: payload.pull_request.html_url,
          state: payload.pull_request.state
        }
      });

      const action = payload.action;
      const pullRequest = payload.pull_request;
      const repository = payload.repository;
      const sender = payload.sender;

      console.log(`🔀 Procesando Pull Request...`);

      // Buscar el proyecto en la base de datos
      const project = await Project.getByGithubRepo(repository.full_name);
      if (!project) {
        console.log(`❌ Proyecto no encontrado: ${repository.full_name}`);
        console.log(`💡 Para configurar este proyecto, ejecuta:`);
        console.log(`   cd backend && node scripts/add-dlt-project.js`);
        return { error: 'Project not found', repository: repository.full_name };
      }

      console.log(`✅ Proyecto encontrado: ${project.name}`);

      // Buscar el usuario que hizo la acción
      let user = null;
      try {
        user = await User.getByGithubUsername(sender.login);
        if (user) {
          console.log(`✅ Usuario encontrado: ${user.github_username}`);
        } else {
          console.log(`⚠️ Usuario no encontrado en la base de datos: ${sender.login}`);
        }
      } catch (error) {
        console.log(`⚠️ Error buscando usuario: ${sender.login}`, error.message);
      }

      // Crear actividad - usando solo campos que sabemos que existen
      const activityData = {
        project_id: project.id,
        user_id: user?.id || null,
        event_type: 'pull_request',
        title: `PR #${pullRequest.number}: ${pullRequest.title}` // Adding required title field
      };

      const activity = await Activity.create(activityData);
      console.log(`✅ Actividad creada: ${activity.id}`);

      // Enviar notificaciones si es una nueva PR o si se solicitan revisores
      if (action === 'opened' || action === 'review_requested') {
        console.log(`📩 Enviando notificaciones para acción: ${action}`);
        await this.sendPullRequestNotifications(project, activity);
      } else {
        console.log(`ℹ️ Sin notificaciones para acción: ${action}`);
      }

      return activity;
    } catch (error) {
      console.error('Error procesando webhook de Pull Request:', error);
      throw error;
    }
  }

  static async handlePush(payload) {
    try {
      const repository = payload.repository;
      const pusher = payload.pusher;
      const commits = payload.commits;

      // Buscar el proyecto
      const project = await Project.getByGithubRepo(repository.full_name);
      if (!project) {
        console.log(`Proyecto no encontrado: ${repository.full_name}`);
        return;
      }

      // Buscar el usuario
      let user = null;
      try {
        user = await User.getByGithubUsername(pusher.name);
      } catch (error) {
        console.log(`Usuario no encontrado: ${pusher.name}`);
      }

      // Crear actividad - usando solo campos básicos
      const activityData = {
        project_id: project.id,
        user_id: user?.id || null,
        event_type: 'push',
        title: `Push to ${payload.ref.replace('refs/heads/', '')} (${commits.length} commits)` // Adding required title field
      };

      const activity = await Activity.create(activityData);

      // Enviar notificaciones si hay usuarios configurados para recibir notificaciones de push
      await this.sendPushNotifications(project, activity);

      return activity;
    } catch (error) {
      console.error('Error procesando webhook de Push:', error);
      throw error;
    }
  }

  static async sendPullRequestNotifications(project, activity) {
    try {
      // Obtener usuarios del proyecto que deben recibir notificaciones de PR
      const projectUsers = await Project.getProjectUsers(project.id);
      const usersToNotify = projectUsers.filter(pu => pu.notify_on_pr);

      if (usersToNotify.length === 0) {
        console.log('No hay usuarios para notificar');
        return;
      }

      // Preparar mensaje para Slack
      const eventData = activity.event_data;
      const reviewers = eventData.reviewers || [];
      
      // Filtrar solo los revisores que están en el proyecto
      const projectReviewers = usersToNotify.filter(pu => 
        reviewers.includes(pu.users.github_username)
      );

      const slackMentions = projectReviewers
        .map(pu => `<@${pu.users.slack_user_id}>`)
        .join(' ');

      const message = {
        text: `${project.emoji} *${eventData.pr_author}* ha abierto una Pull Request en *${project.name}*:\n*${eventData.pr_title}*\n🔗 ${eventData.pr_url}${slackMentions ? `\nRevisores: ${slackMentions}` : ''}`
      };

      // Enviar a Slack
      if (project.slack_webhook_url) {
        await SlackService.sendMessage(project.slack_webhook_url, message);
      }

      console.log(`Notificación enviada para PR #${activity.pr_number} en ${project.name}`);
    } catch (error) {
      console.error('Error enviando notificaciones de PR:', error);
    }
  }

  static async sendPushNotifications(project, activity) {
    try {
      // Obtener usuarios del proyecto que deben recibir notificaciones de push
      const projectUsers = await Project.getProjectUsers(project.id);
      const usersToNotify = projectUsers.filter(pu => pu.notify_on_push);

      if (usersToNotify.length === 0) {
        return;
      }

      const eventData = activity.event_data;
      const slackMentions = usersToNotify
        .map(pu => `<@${pu.users.slack_user_id}>`)
        .join(' ');

      const message = {
        text: `${project.emoji} *${eventData.pusher}* ha hecho push de ${eventData.commits} commit(s) a *${project.name}* en la rama *${eventData.branch}*\n${slackMentions ? `\nNotificando: ${slackMentions}` : ''}`
      };

      // Enviar a Slack
      if (project.slack_webhook_url) {
        await SlackService.sendMessage(project.slack_webhook_url, message);
      }

      console.log(`Notificación de push enviada para ${project.name}`);
    } catch (error) {
      console.error('Error enviando notificaciones de push:', error);
    }
  }
}

module.exports = GitHubWebhookService;
