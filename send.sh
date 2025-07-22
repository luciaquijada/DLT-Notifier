#!/bin/bash
set -e

MODE="${MODE:-push}"
SLACK_BOT_TOKEN="${SLACK_BOT_TOKEN}"
MAP_FILE=".github/slack-reviewer-map.json"

function send_dm() {
  local slack_id="$1"
  local text="$2"

  curl -s -X POST https://slack.com/api/chat.postMessage \
    -H "Authorization: Bearer $SLACK_BOT_TOKEN" \
    -H "Content-type: application/json" \
    --data "$(jq -n --arg channel "$slack_id" --arg text "$text" \
      '{channel: $channel, text: $text}')" > /dev/null
}

if [ "$MODE" = "push" ]; then
  # push mode - enviar DM a un Slack ID fijo (push_recipient)
  PUSH_RECIPIENT="${PUSH_RECIPIENT:?Variable PUSH_RECIPIENT requerida}"

  EMOJI=$(jq -r --arg repo "$REPO_NAME" '.[$repo] // "📦"' .github/repo-style-map.json)

  MESSAGE="$EMOJI New push in *$REPO_NAME*\n*Branch:* $BRANCH\n*Author:* $AUTHOR\n*Commit:* $COMMIT_MESSAGE\n<$COMMIT_URL|Ver commit>\n⏰ $TIMESTAMP"

  send_dm "$PUSH_RECIPIENT" "$MESSAGE"

elif [ "$MODE" = "pr-review" ]; then
  # pr-review mode - enviar DM a cada revisor mapeado
  PR_URL="${PR_URL:?Variable PR_URL requerida}"
  REPO="${REPO_NAME:?Variable REPO_NAME requerida}"

  # reviewers llega como string separado por espacios
  for reviewer in $REVIEWERS; do
    SLACK_ID=$(jq -r --arg user "$reviewer" '.[$user]' "$MAP_FILE")

    if [ "$SLACK_ID" == "null" ] || [ -z "$SLACK_ID" ]; then
      echo "⚠️ No se encontró Slack ID para $reviewer, se omite."
      continue
    fi

    TEXT="👋 You’ve been assigned to review a PR in *$REPO*.\n🔗 $PR_URL"
    send_dm "$SLACK_ID" "$TEXT"
    echo "DM enviada a $reviewer ($SLACK_ID)"
  done

else
  echo "Modo desconocido: $MODE"
  exit 1
fi
