#!/bin/bash
set -e

MODE="${INPUT_MODE}"
REPO="${INPUT_REPO_NAME}"
BRANCH="${INPUT_BRANCH}"
AUTHOR="${INPUT_AUTHOR}"
COMMIT_MESSAGE="${INPUT_COMMIT_MESSAGE}"
COMMIT_URL="${INPUT_COMMIT_URL}"
TIMESTAMP="${INPUT_TIMESTAMP}"
REVIEWERS="${INPUT_REVIEWERS}"
PR_URL="${INPUT_PR_URL}"

SLACK_WEBHOOK_URL="${INPUT_SLACK_WEBHOOK_URL}"
SLACK_BOT_TOKEN="${INPUT_SLACK_BOT_TOKEN}"

REPO_STYLE_MAP=".github/repo-style-map.json"
SLACK_REVIEWER_MAP=".github/slack-reviewer-map.json"

function notify_push() {
  EMOJI="📦"
  if [ -f "$REPO_STYLE_MAP" ]; then
    VALUE=$(jq -r --arg repo "$REPO" '.[$repo]' "$REPO_STYLE_MAP")
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

  curl -s -X POST -H "Content-type: application/json" --data "$JSON" "$SLACK_WEBHOOK_URL"
  echo "✅ Notificación push enviada a Slack"
}

function notify_pr_review() {
  if [ ! -f "$SLACK_REVIEWER_MAP" ]; then
    echo "⚠️ Archivo de mapeo de reviewers no encontrado: $SLACK_REVIEWER_MAP"
    exit 1
  fi

  IFS=',' read -ra REVIEWER_ARRAY <<< "$REVIEWERS"

  for reviewer in "${REVIEWER_ARRAY[@]}"; do
    slack_id=$(jq -r --arg user "$reviewer" '.[$user]' "$SLACK_REVIEWER_MAP")
    if [ "$slack_id" == "null" ] || [ -z "$slack_id" ]; then
      echo "⚠️ No Slack ID para $reviewer"
      continue
    fi

    message="👋 You’ve been assigned to review a PR in *$REPO*.\n🔗 $PR_URL"

    curl -s -X POST https://slack.com/api/chat.postMessage \
      -H "Authorization: Bearer $SLACK_BOT_TOKEN" \
      -H "Content-type: application/json" \
      --data "{
        \"channel\": \"$slack_id\",
        \"text\": \"$message\"
      }"
    echo "📩 DM enviada a $reviewer ($slack_id)"
  done
}

case "$MODE" in
  push)
    if [ -z "$SLACK_WEBHOOK_URL" ]; then
      echo "❌ SLACK_WEBHOOK_URL es requerido para modo push"
      exit 1
    fi
    notify_push
    ;;
  pr-review)
    if [ -z "$SLACK_BOT_TOKEN" ]; then
      echo "❌ SLACK_BOT_TOKEN es requerido para modo pr-review"
      exit 1
    fi
    notify_pr_review
    ;;
  *)
    echo "❌ Modo desconocido: $MODE"
    exit 1
    ;;
esac
