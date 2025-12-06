#!/bin/bash

# Exit on error
set -e

echo "🚀 Starting Netlify deployment..."

# Install dependencies
echo "📦 Installing dependencies..."
npm install --legacy-peer-deps

# Build the application
echo "🔨 Building application..."
npm run build

# Deploy to Netlify
echo "🚀 Deploying to Netlify..."

# Check if Netlify CLI is installed
if ! command -v netlify &> /dev/null; then
    echo "Netlify CLI not found. Installing..."
    npm install -g netlify-cli
fi

# Deploy
netlify deploy --prod

echo "✅ Deployment complete!"
echo "🔗 Your site is live at: https://your-site-name.netlify.app"
echo ""
echo "📝 Next steps:"
1. Set up environment variables in Netlify UI:
   - GROQ_API_KEY
   - DEEPSEEK_API_KEY (if using DeepSeek)
   - OPENAI_API_KEY (if using OpenAI)
2. Configure custom domain if needed
3. Set up continuous deployment from your Git repository

echo ""
echo "🚀 Happy coding!"
