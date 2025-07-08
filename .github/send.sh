#!/bin/bash

# Cargar emoji desde el JSON si existe
EMOJI="📦"
if [ -f ".github/repo-style-map.json" ]; then
  VALUE=$(jq -r --arg repo "$REPO" '.[$repo]' .github/repo-style-map.json)
  if [ "$VALUE" != "null" ]; then
    EMOJI="$VALUE"
  fi
fi

# Crear mensaje
JSON=$(cat <<EOF
{
  "text": "$EMOJI New push in $REPO",
  "blocks": [
    {
      "type": "header",
      "text": {
        "type": "plain_text",
        "text": "$EMOJI Push in $REPO",
        "emoji": true
      }
    },
    {
      "type": "section",
      "fields": [
        { "type": "mrkdwn", "text": "*Repo:*\n$REPO" },
        { "type": "mrkdwn", "text": "*Branch:*\n$BRANCH" },
        { "type": "mrkdwn", "text": "*Author:*\n$AUTHOR" },
        { "type": "mrkdwn", "text": "*Commit:*\n$COMMIT_MESSAGE" }
      ]
    },
    {
      "type": "actions",
      "elements": [
        {
          "type": "button",
          "text": { "type": "plain_text", "text": "🔍 View Commit" },
          "url": "$COMMIT_URL",
          "style": "primary"
        }
      ]
    },
    {
      "type": "context",
      "elements": [
        { "type": "mrkdwn", "text": "⏰ $TIMESTAMP" }
      ]
    }
  ]
}
EOF
)

# Enviar a Slack
curl -X POST -H "Content-type: application/json" --data "$JSON" "$SLACK_WEBHOOK_URL"
