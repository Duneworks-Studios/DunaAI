#!/bin/bash

# Upgrade Danielleebuckley2010@gmail.com to Lifetime Premium on Netlify
# Replace YOUR_SITE_URL with your actual Netlify URL

NETLIFY_URL="https://your-site.netlify.app"  # <-- CHANGE THIS to your actual Netlify URL

echo "🔍 Upgrading user to premium on Netlify..."
echo "📍 Site: $NETLIFY_URL"
echo ""

# Upgrade the user
curl -X POST "$NETLIFY_URL/api/admin/upgrade-user" \
  -H "Content-Type: application/json" \
  -d '{"email": "Danielleebuckley2010@gmail.com", "planType": "pro_lifetime"}'

echo ""
echo ""
echo "✅ Done! User must log out and log back in for changes to take effect."

