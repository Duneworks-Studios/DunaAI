#!/bin/bash

# Upgrade Danielleebuckley2010@gmail.com to Lifetime Premium
# Make sure your dev server is running on http://localhost:3000

echo "🔍 Upgrading user to premium..."
echo ""

# Upgrade the user
curl -X POST http://localhost:3000/api/admin/upgrade-user \
  -H "Content-Type: application/json" \
  -d '{"email": "Danielleebuckley2010@gmail.com", "planType": "pro_lifetime"}'

echo ""
echo ""
echo "✅ Done! User must log out and log back in for changes to take effect."

