#!/bin/bash

# Auto-commit and push script for Duna AI
# This script automatically commits all changes and pushes to GitHub

REPO_DIR="/Volumes/Duneworks Physical Database/Duneworks Studios/Cursor/Duna AI"
cd "$REPO_DIR" || exit 1

# Check if there are any changes
if git diff --quiet && git diff --cached --quiet; then
    echo "No changes to commit."
    exit 0
fi

# Add all changes
git add -A

# Create commit with timestamp
COMMIT_MSG="Auto-commit: $(date '+%Y-%m-%d %H:%M:%S')"
if ! git commit -m "$COMMIT_MSG"; then
    echo "Error: Failed to create commit."
    exit 1
fi

# Push to remote (default branch, usually main or master)
BRANCH=$(git branch --show-current)
if git push origin "$BRANCH"; then
    echo "Successfully committed and pushed to GitHub!"
else
    echo "Error: Failed to push to GitHub. You may need to authenticate."
    echo "Try: git push -u origin $BRANCH"
    exit 1
fi

