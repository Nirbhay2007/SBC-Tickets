#!/bin/bash

# SBC Discord Bot - Deployment Script
# This script helps set up the bot for first-time deployment

echo "🚀 SBC Discord Bot - Deployment Setup"
echo "===================================="

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js v18+ first."
    echo "   Download from: https://nodejs.org/"
    exit 1
fi

# Check Node.js version
NODE_VERSION=$(node -v | cut -c 2-)
REQUIRED_VERSION="18.0.0"
if ! node -e "process.exit(require('semver').gte('$NODE_VERSION', '$REQUIRED_VERSION') ? 0 : 1)" 2>/dev/null; then
    echo "❌ Node.js version $NODE_VERSION is too old. Please upgrade to v18+"
    exit 1
fi

echo "✅ Node.js version: $NODE_VERSION"

# Install dependencies
echo "📦 Installing dependencies..."
if npm install; then
    echo "✅ Dependencies installed successfully"
else
    echo "❌ Failed to install dependencies"
    exit 1
fi

# Check if .env file exists
if [ ! -f ".env" ]; then
    echo "⚙️  Creating .env file from template..."
    cp .env.example .env
    echo "📝 Please edit .env file with your Discord bot credentials:"
    echo "   - DISCORD_TOKEN=your_bot_token_here"
    echo "   - GUILD_ID=your_server_id_here"
    echo "   - Update all role and channel IDs"
    echo ""
    echo "🔗 Get your bot token from: https://discord.com/developers/applications"
else
    echo "✅ .env file already exists"
fi

# Create data directory if it doesn't exist
if [ ! -d "data" ]; then
    echo "📁 Creating data directory..."
    mkdir data
    echo "✅ Data directory created"
fi

# Check syntax
echo "🔍 Checking code syntax..."
if npm run check-syntax &>/dev/null; then
    echo "✅ Syntax check passed"
else
    echo "⚠️  Syntax check found issues (this is normal if .env is not configured)"
fi

echo ""
echo "🎉 Setup complete! Next steps:"
echo "1. Edit .env file with your Discord credentials"
echo "2. Invite your bot to Discord server with Administrator permissions"
echo "3. Run: npm start"
echo "4. Use /setup command in your Discord server to initialize ticket system"
echo ""
echo "📚 For detailed setup instructions, see README.md"
