# Duna AI

Auto-push setup for GitHub repository.

## Setup

This repository is configured to automatically commit and push changes to GitHub.

### Authentication

To enable automatic pushes, you need to authenticate with GitHub:

**Option 1: Personal Access Token (Recommended)**
1. Go to GitHub Settings → Developer settings → Personal access tokens → Tokens (classic)
2. Generate a new token with `repo` permissions
3. When pushing, use the token as your password (username is your GitHub username)

**Option 2: SSH Key**
1. Generate an SSH key: `ssh-keygen -t ed25519 -C "your_email@example.com"`
2. Add it to GitHub: Settings → SSH and GPG keys → New SSH key
3. Update remote: `git remote set-url origin git@github.com:Duneworks-Studios/DunaAI.git`

### Auto-Push Script

The `.git-auto-push.sh` script automatically commits and pushes all changes. It will be run automatically after edits.

## Usage

Changes are automatically committed and pushed after each editing session.

