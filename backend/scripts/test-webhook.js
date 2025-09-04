const axios = require('axios');

// Simulated webhook payload based on your error log
const testPayload = {
  "action": "synchronize",
  "after": "6364f1dca507fe385bf18062598b6131525f9006",
  "before": "c7959738c27534513180773d995d45403bb3d5c2",
  "number": 23,
  "pull_request": {
    "id": 2800495466,
    "number": 23,
    "title": "feat(full): web config test",
    "body": null,
    "state": "open",
    "html_url": "https://github.com/luciaquijada/DLT-Notifier/pull/23",
    "user": {
      "login": "luciaquijada",
      "id": 114581773
    },
    "head": {
      "ref": "feat/web-test",
      "sha": "6364f1dca507fe385bf18062598b6131525f9006"
    },
    "base": {
      "ref": "develop",
      "sha": "8a7dbd99adb2d84db43d91b4a0b2f23358d24168"
    },
    "requested_reviewers": [],
    "changed_files": 62,
    "additions": 22948,
    "deletions": 346
  },
  "repository": {
    "id": 1009465415,
    "name": "DLT-Notifier",
    "full_name": "luciaquijada/DLT-Notifier",
    "owner": {
      "login": "luciaquijada",
      "id": 114581773
    }
  },
  "sender": {
    "login": "luciaquijada",
    "id": 114581773
  }
};

async function testWebhook() {
  try {
    console.log('🧪 Testing webhook with sample pull_request event...');
    
    const response = await axios.post('http://localhost:3000/webhooks/github', testPayload, {
      headers: {
        'Content-Type': 'application/json',
        'X-GitHub-Event': 'pull_request',
        'X-GitHub-Delivery': 'test-delivery-123'
      }
    });

    console.log('✅ Webhook Response Status:', response.status);
    console.log('📄 Response Data:', JSON.stringify(response.data, null, 2));

  } catch (error) {
    console.error('❌ Webhook Test Failed:');
    if (error.response) {
      console.error('Status:', error.response.status);
      console.error('Data:', error.response.data);
    } else {
      console.error('Error:', error.message);
    }
  }
}

if (require.main === module) {
  testWebhook();
}

module.exports = { testWebhook };
