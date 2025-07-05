#!/bin/bash

echo "🚀 ShopNSplit Deployment Script"
echo "================================"

# Check if git is initialized
if [ ! -d ".git" ]; then
    echo "❌ Git repository not found. Please initialize git first:"
    echo "   git init"
    echo "   git add ."
    echo "   git commit -m 'Initial commit'"
    exit 1
fi

# Check if remote is set
if ! git remote get-url origin > /dev/null 2>&1; then
    echo "❌ Git remote not set. Please add your GitHub repository:"
    echo "   git remote add origin https://github.com/YOUR_USERNAME/shopnsplit.git"
    exit 1
fi

echo "✅ Git repository ready"

# Build the frontend
echo "📦 Building frontend..."
npm run build

if [ $? -eq 0 ]; then
    echo "✅ Frontend build successful"
else
    echo "❌ Frontend build failed"
    exit 1
fi

# Test backend
echo "🔧 Testing backend..."
cd server
npm install
npm start &
BACKEND_PID=$!

# Wait for backend to start
sleep 5

# Test backend health
curl -s http://localhost:5001/health > /dev/null
if [ $? -eq 0 ]; then
    echo "✅ Backend is running"
else
    echo "❌ Backend failed to start"
    kill $BACKEND_PID
    exit 1
fi

# Stop backend
kill $BACKEND_PID
cd ..

echo ""
echo "🎉 All tests passed! Your app is ready for deployment."
echo ""
echo "📋 Next steps:"
echo "1. Push to GitHub: git push origin main"
echo "2. Deploy backend to Render:"
echo "   - Go to render.com"
echo "   - Create new Web Service"
echo "   - Connect your GitHub repo"
echo "   - Set root directory to 'server'"
echo "   - Add environment variables"
echo ""
echo "3. Deploy frontend to Vercel:"
echo "   - Go to vercel.com"
echo "   - Import your GitHub repo"
echo "   - Add environment variable: REACT_APP_API_BASE_URL"
echo ""
echo "📖 See DEPLOYMENT_GUIDE.md for detailed instructions"
echo ""
echo "🔗 Useful links:"
echo "- Render: https://render.com"
echo "- Vercel: https://vercel.com"
echo "- Supabase: https://supabase.com" 