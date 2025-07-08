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
  MAP_FILE=".github/slack-reviewer-map.json"

  echo "🔍 Buscando PRs abiertas..."
  PRS=$(gh pr list --state open --json number,title,url,createdAt,reviewRequests,reviews,author -q '.[]')

  declare -A reminders

  echo "$PRS" | jq -c '.[]' | while read -r pr; do
    number=$(echo $pr | jq -r '.number')
    title=$(echo $pr | jq -r '.title')
    url=$(echo $pr | jq -r '.url')
    created=$(echo $pr | jq -r '.createdAt')
    reviewers=$(echo $pr | jq -r '.reviewRequests[].login')
    approvals=$(echo $pr | jq -r '.reviews[] | select(.state == "APPROVED") | .author.login' | sort -u)

    for reviewer in $reviewers; do
      if echo "$approvals" | grep -q "^$reviewer$"; then continue; fi
      slack_id=$(jq -r --arg user "$reviewer" '.[$user]' "$MAP_FILE")
      if [ "$slack_id" == "null" ] || [ -z "$slack_id" ]; then continue; fi
      line="• <$url|#${number}> $title – since ${created:0:10}"
      reminders[$slack_id]="${reminders[$slack_id]}$line\n"
    done
  done

  for slack_id in "${!reminders[@]}"; do
    message="📌 *You have pending PRs to review:*\n${reminders[$slack_id]}"
    curl -s -X POST https://slack.com/api/chat.postMessage \
      -H "Authorization: Bearer $SLACK_BOT_TOKEN" \
      -H "Content-type: application/json" \
      --data "{\"channel\": \"$slack_id\", \"text\": \"$message\"}"
  done

else
  echo "❌ Unknown MODE: $MODE"
  exit 1
fi
