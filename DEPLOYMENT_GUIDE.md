# ShopNSplit Deployment Guide

## Overview
This app has been refactored to use Supabase (PostgreSQL) instead of MongoDB for easier deployment and better scalability.

## Prerequisites
- Supabase account (free tier available)
- Vercel account (for frontend deployment)
- Node.js installed locally

## Step 1: Set up Supabase Database

1. **Create a new Supabase project**
   - Go to [supabase.com](https://supabase.com)
   - Create a new project
   - Note your project URL and anon key

2. **Set up the database schema**
   - In your Supabase dashboard, go to the SQL Editor
   - Copy and paste the contents of `database-setup.sql`
   - Run the script to create all tables, indexes, and policies

3. **Get your service role key**
   - In Supabase dashboard, go to Settings > API
   - Copy the "service_role" key (not the anon key)
   - This is needed for backend access

## Step 2: Set up Environment Variables

### Frontend (Vercel)
Create a `.env.local` file in the root directory:
```env
REACT_APP_SUPABASE_URL=your_supabase_project_url
REACT_APP_SUPABASE_ANON_KEY=your_supabase_anon_key
REACT_APP_API_URL=http://localhost:5000
```

### Backend (Local or Render)
Create a `.env` file in the `server` directory:
```env
SUPABASE_URL=your_supabase_project_url
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
SESSION_SECRET=your_random_session_secret
PORT=5000
```

## Step 3: Deploy Frontend to Vercel

1. **Push your code to GitHub**
   ```bash
   git add .
   git commit -m "Ready for deployment"
   git push origin main
   ```

2. **Deploy to Vercel**
   - Go to [vercel.com](https://vercel.com)
   - Import your GitHub repository
   - Set the root directory to the project root
   - Add environment variables in Vercel dashboard
   - Deploy

3. **Update API URL**
   - After deployment, update `REACT_APP_API_URL` in Vercel environment variables to point to your backend

## Step 4: Deploy Backend

### Option A: Deploy to Render (Recommended)
1. Go to [render.com](https://render.com)
2. Create a new Web Service
3. Connect your GitHub repository
4. Set the root directory to `server`
5. Set the build command: `npm install`
6. Set the start command: `npm start`
7. Add environment variables
8. Deploy

### Option B: Deploy to Railway
1. Go to [railway.app](https://railway.app)
2. Create a new project from GitHub
3. Set the root directory to `server`
4. Add environment variables
5. Deploy

### Option C: Run Locally
```bash
cd server
npm install
npm start
```

## Step 5: Test the Application

1. **Test authentication**
   - Try signing up with a new email
   - Check email confirmation
   - Test login/logout

2. **Test receipt functionality**
   - Create a new receipt
   - Save it to the database
   - View saved receipts
   - Test sharing functionality

3. **Test forgot password**
   - Use the "Forgot password?" link
   - Check email for reset link

## Troubleshooting

### Common Issues

1. **"Could not find the 'user_id' column" error**
   - Make sure you ran the `database-setup.sql` script in Supabase
   - Check that all tables were created successfully

2. **Authentication errors**
   - Verify your Supabase URL and keys are correct
   - Check that email confirmation is working
   - Ensure RLS policies are set up correctly

3. **CORS errors**
   - Make sure your backend URL is correct in frontend environment variables
   - Check that the backend is running and accessible

4. **Receipt saving fails**
   - Check browser console for detailed error messages
   - Verify database connection and permissions
   - Ensure the backend API is responding correctly

### Debug Steps

1. **Check browser console** for frontend errors
2. **Check backend logs** for server errors
3. **Verify database tables** exist in Supabase dashboard
4. **Test API endpoints** directly using tools like Postman

## Features Added

✅ **Forgot Password**: Users can now reset their password via email
✅ **Improved Database Schema**: Better structured data with proper relationships
✅ **Enhanced Error Handling**: More detailed error messages and debugging
✅ **Duplicate Prevention**: Prevents saving the same receipt multiple times
✅ **Better Data Validation**: Improved input validation and error handling

## Support

If you encounter issues:
1. Check the browser console for error messages
2. Verify all environment variables are set correctly
3. Ensure the database schema is properly set up
4. Test API endpoints individually

The app should now work seamlessly with Supabase and provide a much better user experience! 