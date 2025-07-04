# Deployment Guide for Render.com

## Your Current Setup
You already have a deployment at: **https://shopnsplit.onrender.com**

## Single Service Deployment (Recommended for Free Tier)

Since you're using the free tier, I've configured your project for a single service that serves both frontend and backend from one deployment. This is more cost-effective and simpler to manage.

## What I've Updated

1. **Single Service Configuration**: Updated `render.yaml` for one service instead of two
2. **Static File Serving**: Added code to serve React build files from the Express server
3. **CORS Configuration**: Updated to work with your existing URL
4. **Build Process**: Configured to build React app and install server dependencies

## Environment Variables You Need

In your Render.com dashboard, make sure you have these environment variables set:

### Required Variables:
- `NODE_ENV`: `production`
- `MONGODB_URI`: Your MongoDB connection string
- `SESSION_SECRET`: A secure random string for session encryption
- `PORT`: `10000`
- `REACT_APP_API_URL`: `https://shopnsplit.onrender.com`

## Deployment Steps

1. **Push your updated code** to your Git repository
2. **Go to your existing service** in Render.com dashboard
3. **Update the build command** to: `npm install && npm run build && cd server && npm install`
4. **Update the start command** to: `cd server && npm start`
5. **Add the environment variables** listed above if they're missing
6. **Redeploy** your service

## Testing Your Deployment

1. **Main App**: https://shopnsplit.onrender.com
2. **API Test**: https://shopnsplit.onrender.com/api/test
3. **Backend Routes**: https://shopnsplit.onrender.com/api/auth, https://shopnsplit.onrender.com/api/receipts

## How It Works

- **Build Phase**: Installs dependencies, builds React app, installs server dependencies
- **Runtime**: Express server serves both API routes and React static files
- **API Routes**: All `/api/*` routes go to your Express backend
- **Frontend**: All other routes serve the React app

## Troubleshooting

1. **Build Failures**: Check the build logs in Render.com dashboard
2. **CORS Errors**: The CORS is now configured for your single domain
3. **Database Connection**: Verify your MongoDB URI is correct
4. **Environment Variables**: Make sure all required variables are set

## Free Tier Notes

- Service spins down after 15 minutes of inactivity
- First request after inactivity may take 30-60 seconds
- Perfect for development and testing 