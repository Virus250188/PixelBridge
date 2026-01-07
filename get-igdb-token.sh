#!/bin/bash
# IGDB Access Token Generator
# Helps generate an access token from Twitch Client ID and Secret

echo "🎮 IGDB Access Token Generator"
echo "=============================="
echo ""
echo "This script helps you generate an IGDB access token."
echo "You need:"
echo "  1. Twitch Client ID"
echo "  2. Twitch Client Secret"
echo ""
echo "Get these at: https://dev.twitch.tv/"
echo ""

# Ask for Client ID
read -p "Enter your Twitch Client ID: " CLIENT_ID

if [ -z "$CLIENT_ID" ]; then
    echo "❌ Client ID cannot be empty!"
    exit 1
fi

# Ask for Client Secret
read -sp "Enter your Twitch Client Secret: " CLIENT_SECRET
echo ""

if [ -z "$CLIENT_SECRET" ]; then
    echo "❌ Client Secret cannot be empty!"
    exit 1
fi

echo ""
echo "🔄 Requesting access token from Twitch..."
echo ""

# Request token
RESPONSE=$(curl -s -X POST 'https://id.twitch.tv/oauth2/token' \
  -d "client_id=$CLIENT_ID" \
  -d "client_secret=$CLIENT_SECRET" \
  -d 'grant_type=client_credentials')

# Extract access token
ACCESS_TOKEN=$(echo "$RESPONSE" | grep -o '"access_token":"[^"]*' | cut -d'"' -f4)

if [ -z "$ACCESS_TOKEN" ]; then
    echo "❌ Failed to get access token!"
    echo ""
    echo "Response from Twitch:"
    echo "$RESPONSE"
    exit 1
fi

echo "✅ Success! Your credentials:"
echo ""
echo "=============================="
echo "IGDB_CLIENT_ID=$CLIENT_ID"
echo "IGDB_ACCESS_TOKEN=$ACCESS_TOKEN"
echo "=============================="
echo ""
echo "📝 Add these to your .env file:"
echo ""
echo "   1. Open .env in a text editor"
echo "   2. Replace the IGDB_CLIENT_ID line with:"
echo "      IGDB_CLIENT_ID=$CLIENT_ID"
echo "   3. Replace the IGDB_ACCESS_TOKEN line with:"
echo "      IGDB_ACCESS_TOKEN=$ACCESS_TOKEN"
echo "   4. Save and close"
echo ""
echo "⏰ Note: Access tokens expire after ~60 days"
echo "   Run this script again when it expires."
echo ""
