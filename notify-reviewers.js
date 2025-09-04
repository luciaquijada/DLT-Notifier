const fs = require('fs');
const https = require('https');

const github = JSON.parse(process.env.GITHUB_EVENT);
const repo = process.env.GITHUB_REPOSITORY;
const webhookUrl = process.env.SLACK_WEBHOOK_URL;

const reviewers = github.pull_request.requested_reviewers.map(u => u.login);
const prUrl = github.pull_request.html_url;
const prTitle = github.pull_request.title;
const prAuthor = github.pull_request.user.login;

const config = JSON.parse(fs.readFileSync('reviewers.json', 'utf8'));

const proyecto = config[repo];

if (!proyecto) {
  console.error(`No se encontró configuración para el repositorio: ${repo}`);
  process.exit(1);
}

const slackMentions = reviewers.map(r => {
  const slackId = proyecto.usuarios[r];
  return slackId ? `<@${slackId}>` : r;
}).join(' ');

const mensaje = {
  text: `:bell: *${prAuthor}* ha abierto una Pull Request:\n*${prTitle}*\n🔗 ${prUrl}\nRevisores: ${slackMentions}`
};

// Debug logs para diagnosticar
console.log("🔍 Repo:", repo);
console.log("🔍 Reviewers GitHub:", reviewers);
console.log("🔍 PR URL:", prUrl);
console.log("🔍 PR Title:", prTitle);
console.log("🔍 PR Author:", prAuthor);
console.log("🔍 Slack Mentions:", slackMentions);
console.log("🔍 Mensaje Slack:", mensaje);


const data = JSON.stringify(mensaje);

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

const req = https.request(options, res => {
  console.log(`Slack respondió con estado: ${res.statusCode}`);
});

req.on('error', error => {
  console.error('Error al enviar a Slack:', error);
});

req.write(data);
req.end();
