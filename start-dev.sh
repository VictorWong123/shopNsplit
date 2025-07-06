#!/bin/bash
set -e

echo "=== Starting ShopNSplit Development Environment ==="

# Check if .env file exists in root
if [ ! -f .env ]; then
    echo "❌ Error: .env file not found in project root!"
    echo "Please create a .env file with your Supabase credentials:"
    echo "REACT_APP_SUPABASE_URL=https://your-project-id.supabase.co"
    echo "REACT_APP_SUPABASE_ANON_KEY=your-anon-key-here"
    exit 1
fi

# Check if server .env file exists
if [ ! -f server/.env ]; then
    echo "⚠️  Warning: server/.env file not found!"
    echo "For full functionality (including account deletion), create server/.env with:"
    echo "SUPABASE_URL=https://your-project-id.supabase.co"
    echo "SUPABASE_SERVICE_ROLE_KEY=your-service-role-key-here"
    echo "PORT=5001"
fi

echo "✅ Environment files checked"

# Start backend server in background
echo "🚀 Starting backend server on port 5001..."
cd server && npm start &
BACKEND_PID=$!

# Wait a moment for backend to start
sleep 3

# Check if backend is running
if curl -s http://localhost:5001/health > /dev/null; then
    echo "✅ Backend server is running on http://localhost:5001"
else
    echo "❌ Backend server failed to start"
    kill $BACKEND_PID 2>/dev/null || true
    exit 1
fi

# Start frontend server
echo "🚀 Starting frontend server on port 3000..."
echo "📱 Frontend will be available at http://localhost:3000"
echo "🔧 Backend API will be available at http://localhost:5001"
echo ""
echo "Press Ctrl+C to stop both servers"

# Function to cleanup on exit
cleanup() {
    echo ""
    echo "🛑 Stopping servers..."
    kill $BACKEND_PID 2>/dev/null || true
    exit 0
}

# Set up signal handlers
trap cleanup SIGINT SIGTERM

# Start frontend (this will block)
npm start

# Cleanup if we get here
cleanup 