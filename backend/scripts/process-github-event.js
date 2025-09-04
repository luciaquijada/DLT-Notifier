require('dotenv').config();
const { supabaseAdmin } = require('../config/supabase');
const GitHubWebhookService = require('../services/GitHubWebhookService');

async function processGitHubEvent() {
  try {
    const eventName = process.env.GITHUB_EVENT_NAME;
    const eventData = JSON.parse(process.env.GITHUB_EVENT);
    const repository = process.env.GITHUB_REPOSITORY;

    console.log(`🔔 Procesando evento: ${eventName} para ${repository}`);
    console.log('📄 Datos del evento:', JSON.stringify(eventData, null, 2));

    let result = null;

    switch (eventName) {
      case 'pull_request':
        console.log('🔀 Procesando Pull Request...');
        result = await GitHubWebhookService.handlePullRequest(eventData);
        break;
      
      case 'push':
        console.log('📤 Procesando Push...');
        result = await GitHubWebhookService.handlePush(eventData);
        break;
      
      default:
        console.log(`⚠️ Evento no manejado: ${eventName}`);
        return;
    }

    if (result) {
      console.log('✅ Evento procesado exitosamente');
      console.log('📊 Resultado:', result);
    }

  } catch (error) {
    console.error('❌ Error procesando evento de GitHub:', error);
    process.exit(1);
  }
}

if (require.main === module) {
  processGitHubEvent();
}

module.exports = { processGitHubEvent };
