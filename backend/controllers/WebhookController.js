const GitHubWebhookService = require('../services/GitHubWebhookService');

class WebhookController {
  static async handleGitHubWebhook(req, res) {
    try {
      const event = req.headers['x-github-event'];
      const payload = req.body;

      console.log(`🔔 Webhook recibido: ${event} para ${payload.repository?.full_name}`);

      let result = null;

      switch (event) {
        case 'pull_request':
          result = await GitHubWebhookService.handlePullRequest(payload);
          break;
        
        case 'push':
          result = await GitHubWebhookService.handlePush(payload);
          break;
        
        default:
          console.log(`Evento no manejado: ${event}`);
          return res.status(200).json({
            success: true,
            message: `Evento ${event} recibido pero no procesado`
          });
      }

      res.status(200).json({
        success: true,
        message: `Evento ${event} procesado exitosamente`,
        data: result
      });

    } catch (error) {
      console.error('Error procesando webhook:', error);
      res.status(500).json({
        success: false,
        error: 'Error procesando webhook'
      });
    }
  }

  // Endpoint para testing de webhooks
  static async testWebhook(req, res) {
    try {
      const { projectId, eventType } = req.body;
      
      // Aquí puedes crear eventos de prueba
      const testEvent = {
        project_id: projectId,
        event_type: eventType,
        event_data: {
          test: true,
          message: 'Evento de prueba'
        }
      };

      res.json({
        success: true,
        message: 'Webhook de prueba ejecutado',
        data: testEvent
      });
    } catch (error) {
      console.error('Error en webhook de prueba:', error);
      res.status(500).json({
        success: false,
        error: 'Error en webhook de prueba'
      });
    }
  }
}

module.exports = WebhookController;
