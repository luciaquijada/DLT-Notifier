const User = require('../models/User');
const Project = require('../models/Project');
const Activity = require('../models/Activity');
const SlackService = require('./SlackService');

class GitHubWebhookService {
  static async handlePullRequest(payload) {
    try {
      const action = payload.action;
      const pullRequest = payload.pull_request;
      const repository = payload.repository;
      const sender = payload.sender;

      // Buscar el proyecto en la base de datos
      const project = await Project.getByGithubRepo(repository.full_name);
      if (!project) {
        console.log(`Proyecto no encontrado: ${repository.full_name}`);
        return;
      }

      // Buscar el usuario que hizo la acción
      let user = null;
      try {
        user = await User.getByGithubUsername(sender.login);
      } catch (error) {
        console.log(`Usuario no encontrado: ${sender.login}`);
      }

      // Crear actividad
      const activityData = {
        project_id: project.id,
        user_id: user?.id || null,
        event_type: 'pull_request',
        event_data: {
          action,
          pr_number: pullRequest.number,
          pr_title: pullRequest.title,
          pr_url: pullRequest.html_url,
          pr_author: pullRequest.user.login,
          reviewers: pullRequest.requested_reviewers?.map(r => r.login) || [],
          branch: pullRequest.head.ref,
          base_branch: pullRequest.base.ref
        },
        github_event_id: `pr_${pullRequest.id}`,
        pr_number: pullRequest.number,
        pr_title: pullRequest.title,
        pr_url: pullRequest.html_url,
        branch_name: pullRequest.head.ref
      };

      const activity = await Activity.create(activityData);

      // Enviar notificaciones si es una nueva PR o si se solicitan revisores
      if (action === 'opened' || action === 'review_requested') {
        await this.sendPullRequestNotifications(project, activity);
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

      // Crear actividad
      const activityData = {
        project_id: project.id,
        user_id: user?.id || null,
        event_type: 'push',
        event_data: {
          commits: commits.length,
          commit_messages: commits.map(c => c.message),
          branch: payload.ref.replace('refs/heads/', ''),
          pusher: pusher.name,
          compare_url: payload.compare
        },
        commit_sha: payload.after,
        branch_name: payload.ref.replace('refs/heads/', '')
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
