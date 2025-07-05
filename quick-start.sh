#!/bin/bash

echo "🚀 ShopNsplit Quick Start Script"
echo "================================"
echo ""

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js first."
    exit 1
fi

echo "✅ Node.js found: $(node --version)"

# Check if npm is installed
if ! command -v npm &> /dev/null; then
    echo "❌ npm is not installed. Please install npm first."
    exit 1
fi

echo "✅ npm found: $(npm --version)"
echo ""

# Check if .env file exists in server directory
if [ ! -f "server/.env" ]; then
    echo "⚠️  No .env file found in server directory."
    echo "Please create server/.env with the following variables:"
    echo ""
    echo "SUPABASE_URL=your_supabase_url"
    echo "SUPABASE_SERVICE_ROLE_KEY=your_service_role_key"
    echo "SESSION_SECRET=your_session_secret"
    echo "NODE_ENV=development"
    echo "PORT=5001"
    echo ""
    echo "You can copy from server/env.example"
    echo ""
    read -p "Press Enter to continue after creating .env file..."
fi

# Install dependencies
echo "📦 Installing dependencies..."
echo "Installing backend dependencies..."
cd server && npm install
echo "Installing frontend dependencies..."
cd .. && npm install
echo "✅ Dependencies installed!"
echo ""

# Test backend setup
echo "🧪 Testing backend setup..."
cd server && node test-setup.js
cd ..

echo ""
echo "🎉 Setup complete!"
echo ""
echo "To start the application:"
echo "1. Terminal 1: cd server && npm run dev"
echo "2. Terminal 2: npm start"
echo ""
echo "Then open http://localhost:3000 in your browser"
echo ""
echo "For detailed instructions, see DEPLOYMENT_GUIDE.md" 