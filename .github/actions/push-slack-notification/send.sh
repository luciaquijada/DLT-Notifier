#!/bin/bash
set -e

echo "📦 Loading style for $REPO..."
STYLE=$(jq -r --arg repo "$REPO" '.[$repo] // "📦"' "$GITHUB_ACTION_PATH/../../repo-style-map.json")

if [[ "$STYLE" == "📦" ]]; then
  EMOJI="📦"
else
  EMOJI="$STYLE"
fi

echo "🚀 Sending message with emoji $EMOJI..."

curl -X POST -H "Content-type: application/json" --data "{
  \"text\": \"$EMOJI Push in *$REPO*\",
  \"blocks\": [
    {
      \"type\": \"header\",
      \"text\": {
        \"type\": \"plain_text\",
        \"text\": \"$EMOJI Push to $BRANCH\",
        \"emoji\": true
      }
    },
    {
      \"type\": \"section\",
      \"fields\": [
        {
          \"type\": \"mrkdwn\",
          \"text\": \"*Author:*\n$AUTHOR\"
        },
        {
          \"type\": \"mrkdwn\",
          \"text\": \"*Commit:*\n$COMMIT_MESSAGE\"
        }
      ]
    },
    {
      \"type\": \"actions\",
      \"elements\": [
        {
          \"type\": \"button\",
          \"text\": {
            \"type\": \"plain_text\",
            \"text\": \"🔍 View Commit\"
          },
          \"url\": \"$COMMIT_URL\",
          \"style\": \"primary\"
        }
      ]
    },
    {
      \"type\": \"context\",
      \"elements\": [
        {
          \"type\": \"mrkdwn\",
          \"text\": \"⏰ $TIMESTAMP\"
        }
      ]
    }
  ]
}" "$SLACK_WEBHOOK_URL"
