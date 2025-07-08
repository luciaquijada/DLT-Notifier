#!/bin/bash

if [ "$MODE" = "push" ]; then
  EMOJI="📦"
  if [ -f ".github/repo-style-map.json" ]; then
    VALUE=$(jq -r --arg repo "$REPO" '.[$repo]' .github/repo-style-map.json)
    if [ "$VALUE" != "null" ]; then
      EMOJI="$VALUE"
    fi
  fi

  JSON=$(cat <<EOF
{
  "text": "$EMOJI New push in $REPO",
  "blocks": [
    {
      "type": "header",
      "text": { "type": "plain_text", "text": "$EMOJI Push in $REPO", "emoji": true }
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
      "elements": [{ "type": "mrkdwn", "text": "⏰ $TIMESTAMP" }]
    }
  ]
}
EOF
)
  curl -X POST -H "Content-type: application/json" --data "$JSON" "$SLACK_WEBHOOK_URL"

elif [ "$MODE" = "pr-review" ]; then
  echo "📚 Cargando mapa de revisores..."
  MAP_FILE= MAP_FILE="${GITHUB_ACTION_PATH}/slack-reviewer-map.json"

  echo "🔍 Obteniendo reviewers..."
  IFS=',' read -ra REVIEWERS <<< "$REVIEWERS"

  for reviewer in "${REVIEWERS[@]}"; do
    slack_id=$(jq -r --arg user "$reviewer" '.[$user]' "$MAP_FILE")
    if [ "$slack_id" == "null" ] || [ -z "$slack_id" ]; then
      echo "⚠️ No Slack ID para $reviewer"
      continue
    fi

    message="👋 Has sido asignado para revisar una PR en *$REPO*.\n🔗 $PR_URL"

    curl -s -X POST https://slack.com/api/chat.postMessage \
      -H "Authorization: Bearer $SLACK_BOT_TOKEN" \
      -H "Content-type: application/json" \
      --data "{
        \"channel\": \"$slack_id\",
        \"text\": \"$message\"
      }"
  done

else
  echo "❌ Unknown MODE: $MODE"
  exit 1
fi
