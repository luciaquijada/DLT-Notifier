const express = require('express');
const WebhookController = require('../controllers/WebhookController');

const router = express.Router();

// POST /webhooks/github - Endpoint para webhooks de GitHub
router.post('/github', WebhookController.handleGitHubWebhook);

// POST /webhooks/test - Endpoint para testing
router.post('/test', WebhookController.testWebhook);

module.exports = router;
