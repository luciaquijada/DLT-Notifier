const https = require('https');

class SlackService {
  static async sendMessage(webhookUrl, message) {
    return new Promise((resolve, reject) => {
      const data = JSON.stringify(message);
      
      const url = new URL(webhookUrl);
      const options = {
        hostname: url.hostname,
        path: url.pathname + url.search,
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Content-Length': data.length
        }
      };

      const req = https.request(options, (res) => {
        let responseData = '';
        
        res.on('data', (chunk) => {
          responseData += chunk;
        });
        
        res.on('end', () => {
          if (res.statusCode >= 200 && res.statusCode < 300) {
            console.log(`✅ Mensaje enviado a Slack: ${res.statusCode}`);
            resolve({ success: true, statusCode: res.statusCode });
          } else {
            console.error(`❌ Error enviando a Slack: ${res.statusCode} - ${responseData}`);
            reject(new Error(`Slack API error: ${res.statusCode}`));
          }
        });
      });

      req.on('error', (error) => {
        console.error('❌ Error de conexión con Slack:', error);
        reject(error);
      });

      req.setTimeout(10000, () => {
        req.destroy();
        reject(new Error('Timeout enviando mensaje a Slack'));
      });

      req.write(data);
      req.end();
    });
  }

  static formatPullRequestMessage(project, prData, reviewers = []) {
    const { emoji, name } = project;
    const { pr_author, pr_title, pr_url } = prData;
    
    const slackMentions = reviewers.length > 0 
      ? `\nRevisores: ${reviewers.join(' ')}`
      : '';

    return {
      text: `${emoji} *${pr_author}* ha abierto una Pull Request en *${name}*:\n*${pr_title}*\n🔗 ${pr_url}${slackMentions}`
    };
  }

  static formatPushMessage(project, pushData) {
    const { emoji, name } = project;
    const { pusher, commits, branch } = pushData;
    
    return {
      text: `${emoji} *${pusher}* ha hecho push de ${commits} commit(s) a *${name}* en la rama *${branch}*`
    };
  }

  static formatCustomMessage(project, title, description, url = null) {
    const { emoji, name } = project;
    
    let message = `${emoji} *${title}* en *${name}*\n${description}`;
    
    if (url) {
      message += `\n🔗 ${url}`;
    }
    
    return { text: message };
  }
}

module.exports = SlackService;
