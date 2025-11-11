#!/bin/bash

# Auto-commit and push script for Duna AI
# This script automatically commits all changes and pushes to GitHub

REPO_DIR="/Volumes/Duneworks Physical Database/Duneworks Studios/Cursor/Duna AI"
cd "$REPO_DIR"

# Check if there are any changes
if git diff --quiet && git diff --cached --quiet; then
    echo "No changes to commit."
    exit 0
fi

# Add all changes
git add -A

# Create commit with timestamp
COMMIT_MSG="Auto-commit: $(date '+%Y-%m-%d %H:%M:%S')"
git commit -m "$COMMIT_MSG"

# Push to remote (default branch, usually main or master)
BRANCH=$(git branch --show-current)
git push origin "$BRANCH"

echo "Successfully committed and pushed to GitHub!"

