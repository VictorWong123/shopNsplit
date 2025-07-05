# ShopNSplit Supabase Deployment Guide

## Overview
Your app is now configured to use Supabase as both the database and backend. This guide will help you deploy it to Vercel.

## Prerequisites
- [GitHub account](https://github.com)
- [Vercel account](https://vercel.com) (free)
- [Supabase project](https://supabase.com) (already set up)

## Step 1: Environment Variables in Vercel

### 1.1 Get Your Supabase Credentials
1. Go to your [Supabase dashboard](https://supabase.com/dashboard)
2. Select your project
3. Go to **Settings** → **API**
4. Copy:
   - **Project URL** (for `REACT_APP_SUPABASE_URL`)
   - **anon public** key (for `REACT_APP_SUPABASE_ANON_KEY`)

### 1.2 Add Environment Variables to Vercel
1. Go to your [Vercel dashboard](https://vercel.com/dashboard)
2. Select your `shop-nsplit` project
3. Go to **Settings** → **Environment Variables**
4. Add these variables:

```
REACT_APP_SUPABASE_URL=https://your-project-id.supabase.co
REACT_APP_SUPABASE_ANON_KEY=your-anon-key-here
```

### 1.3 Redeploy
After adding the environment variables, Vercel will automatically redeploy your app.

## Step 2: Update Supabase Database Schema

Make sure your Supabase database has the correct tables. Run this SQL in your Supabase SQL editor:

```sql
-- Create users table
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    username TEXT NOT NULL,
    email TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create receipts table
CREATE TABLE IF NOT EXISTS receipts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    name TEXT,
    data JSONB NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_receipts_user_id ON receipts(user_id);
CREATE INDEX IF NOT EXISTS idx_receipts_created_at ON receipts(created_at);

-- Enable Row Level Security (optional)
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE receipts ENABLE ROW LEVEL SECURITY;

-- Create policies for users table
CREATE POLICY "Users can view own data" ON users
    FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can insert own data" ON users
    FOR INSERT WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update own data" ON users
    FOR UPDATE USING (auth.uid() = id);

-- Create policies for receipts table
CREATE POLICY "Users can view own receipts" ON receipts
    FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Users can insert own receipts" ON receipts
    FOR INSERT WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update own receipts" ON receipts
    FOR UPDATE USING (user_id = auth.uid());

CREATE POLICY "Users can delete own receipts" ON receipts
    FOR DELETE USING (user_id = auth.uid());

-- Allow public access to shared receipts (for sharing functionality)
CREATE POLICY "Public can view shared receipts" ON receipts
    FOR SELECT USING (true);
```

## Step 3: Test Your Deployment

### 3.1 Test Authentication
- Visit your Vercel URL: https://shop-nsplit.vercel.app/
- Try registering a new user
- Try logging in with existing user
- Verify user data is saved in Supabase

### 3.2 Test Receipt Functionality
- Create a new receipt
- Save the receipt
- Verify it appears in your receipts list
- Test the duplicate save prevention
- Test sharing functionality

### 3.3 Check Supabase Dashboard
- Go to your Supabase dashboard
- Check the **Table Editor** to see your data
- Check the **Authentication** section to see users
- Check the **Logs** for any errors

## Step 4: Troubleshooting

### Common Issues

1. **Authentication Errors**
   - Check that `REACT_APP_SUPABASE_URL` and `REACT_APP_SUPABASE_ANON_KEY` are set correctly
   - Verify the keys in your Supabase dashboard
   - Check browser console for errors

2. **Database Errors**
   - Ensure tables exist in Supabase
   - Check RLS policies if enabled
   - Verify table structure matches the code

3. **Build Errors**
   - Check Vercel build logs
   - Ensure all dependencies are installed
   - Verify environment variables are set

### Debug Commands

```bash
# Check environment variables locally
echo $REACT_APP_SUPABASE_URL
echo $REACT_APP_SUPABASE_ANON_KEY

# Test build locally
npm run build

# Check for missing dependencies
npm ls @supabase/supabase-js
```

## Step 5: Monitoring

### Vercel Analytics
- Enable Vercel Analytics in your project settings
- Monitor performance and user behavior

### Supabase Monitoring
- Use Supabase dashboard to monitor database performance
- Check for slow queries or connection issues
- Monitor authentication events

## Security Considerations

1. **Environment Variables**: Never commit sensitive data to git
2. **RLS Policies**: Enable Row Level Security for production
3. **API Keys**: Use anon key for frontend, service role key only for backend functions
4. **HTTPS**: Vercel provides HTTPS by default

## Cost Optimization

- **Vercel**: Free tier includes 100GB bandwidth/month
- **Supabase**: Free tier includes 500MB database and 2GB bandwidth

## Your App is Now Live! 🚀

Your ShopNSplit app is now fully deployed and using Supabase as the backend. Users can:
- ✅ Register and login
- ✅ Create and save receipts
- ✅ Share receipts via links
- ✅ View their saved receipts
- ✅ Delete and edit receipts

The app is accessible at: https://shop-nsplit.vercel.app/ 