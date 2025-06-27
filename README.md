# GitHub to Slack Notification Workflow

This repository implements a GitHub Actions workflow that automatically sends structured Slack notifications when code is pushed to the `develop` branch. It enables development teams to stay informed in real-time about repository activity, supporting better visibility and coordination.

---

## 🚀 Overview

This workflow uses the [Slack GitHub Action](https://github.com/slackapi/slack-github-action) to send a visual notification to a Slack channel. The message includes:

- Repository name
- Target branch
- Commit author
- Commit message
- Timestamp
- Direct link to the commit

Slack messages are formatted using [Slack Block Kit](https://api.slack.com/block-kit) to enhance readability and usability.

---

## 📦 Use Case

This automation is suitable for:

- Teams working across multiple repositories and needing clear identification of activity per project
- CI/CD pipelines that require notification on each push or deployment event
- Centralized Slack channels that aggregate version control activity from different projects

---

## 🔧 Setup Instructions

### 1. Create a Slack Incoming Webhook

1. Go to [https://api.slack.com/apps](https://api.slack.com/apps)
2. Click **"Create New App"** → choose **"From scratch"**
3. Enable **Incoming Webhooks**
4. Create a new webhook URL pointing to the desired channel
5. Copy the webhook URL

### 2. Store the Webhook URL in GitHub Secrets

In your GitHub repository:

1. Navigate to `Settings` → `Secrets and variables` → `Actions`
2. Click **"New repository secret"**
3. Set:
   - **Name**: `SLACK_WEBHOOK_URL`
   - **Value**: *your copied Slack webhook URL*

### 3. Add the GitHub Action Workflow

Create the following file in your repository:

```
.github/workflows/slack-notification.yml
```

And paste the following content:

```yaml
name: Notify Slack on Push

on:
  push:
    branches:
      - develop

jobs:
  notifySlack:
    runs-on: ubuntu-latest

    steps:
      - name: Send Slack notification
        uses: slackapi/slack-github-action@v1.24.0
        with:
          payload: |
            {
              "blocks": [
                {
                  "type": "header",
                  "text": {
                    "type": "plain_text",
                    "text": "🚀 New Push Detected",
                    "emoji": true
                  }
                },
                {
                  "type": "section",
                  "fields": [
                    { "type": "mrkdwn", "text": "*Repository:*
${{ github.repository }}" },
                    { "type": "mrkdwn", "text": "*Branch:*
${{ github.ref_name }}" },
                    { "type": "mrkdwn", "text": "*Author:*
${{ github.actor }}" },
                    { "type": "mrkdwn", "text": "*Commit:*
${{ github.event.head_commit.message }}" }
                  ]
                },
                {
                  "type": "actions",
                  "elements": [
                    {
                      "type": "button",
                      "text": { "type": "plain_text", "text": "🔍 View Commit" },
                      "url": "${{ github.event.head_commit.url }}",
                      "style": "primary"
                    }
                  ]
                },
                {
                  "type": "context",
                  "elements": [
                    { "type": "mrkdwn", "text": "🕒 Timestamp: ${{ github.event.head_commit.timestamp }}" }
                  ]
                }
              ]
            }
        env:
          SLACK_WEBHOOK_URL: ${{ secrets.SLACK_WEBHOOK_URL }}
```

---

## ✅ Sample Output

A typical Slack message sent by this workflow includes:

```
🚀 New Push Detected

Repository:     your-org/your-repo
Branch:         develop
Author:         alice-dev
Commit:         Refactor: improve error handling

🔍 [View Commit]

🕒 Timestamp: 2025-06-27T14:05:23Z
```

---

## 📘 Additional Notes

- The workflow is currently limited to push events on the `develop` branch.
- Messages are fully customizable using Slack Block Kit.
- You can extend this workflow to support other GitHub events such as:
  - `pull_request`
  - `release`
  - `workflow_run`
- Recommended for teams using centralized notification channels across projects.

---

## 📄 License

This project is licensed under the MIT License.
