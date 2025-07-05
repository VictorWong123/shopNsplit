# ShopNSplit Deployment Checklist

## ✅ Fixed Issues
- [x] Fixed `supabaseClient` import error in `AuthModal.jsx`
- [x] Updated import to use `supabase` instead of `supabaseClient`
- [x] Verified build compiles successfully
- [x] All exports in `supabaseClient.js` are properly defined

## 🔧 Frontend (Vercel) Setup

### Environment Variables Required
Make sure these are set in your Vercel dashboard:
```env
REACT_APP_SUPABASE_URL=your_supabase_project_url
REACT_APP_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### Build Configuration
- [x] Root directory: `/` (project root)
- [x] Build command: `npm run build`
- [x] Output directory: `build`
- [x] Install command: `npm install`

## 🔧 Backend Setup

### Option 1: Deploy Backend Separately (Recommended)
Deploy your backend to Render, Railway, or similar:

**Environment Variables for Backend:**
```env
SUPABASE_URL=your_supabase_project_url
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
SESSION_SECRET=your_random_session_secret
PORT=5000
NODE_ENV=production
FRONTEND_URL=https://your-vercel-app.vercel.app
```

### Option 2: Run Backend Locally
If you want to run the backend locally:
```bash
cd server
npm install
npm start
```

## 🗄️ Supabase Database Setup

### Required Tables
Make sure you've run the `database-setup.sql` script in Supabase SQL Editor:

1. **users** table
2. **receipts** table  
3. **receipt_items** table
4. **receipt_participants** table
5. **receipt_split_groups** table

### Row Level Security (RLS)
Ensure RLS policies are enabled and configured properly.

## 🧪 Pre-Deployment Testing

### Local Testing
1. [ ] Test authentication (signup/login)
2. [ ] Test receipt creation and saving
3. [ ] Test receipt viewing and sharing
4. [ ] Test forgot password functionality
5. [ ] Test all pages load correctly

### Environment Variable Testing
1. [ ] Verify Supabase connection works
2. [ ] Verify backend API endpoints respond
3. [ ] Check CORS configuration

## 🚀 Deployment Steps

### 1. Frontend (Vercel)
1. [ ] Push latest code to GitHub
2. [ ] Deploy to Vercel
3. [ ] Set environment variables in Vercel dashboard
4. [ ] Verify build succeeds
5. [ ] Test the deployed app

### 2. Backend (Render/Railway)
1. [ ] Deploy backend service
2. [ ] Set environment variables
3. [ ] Update frontend API URL if needed
4. [ ] Test API endpoints

### 3. Final Testing
1. [ ] Test authentication flow
2. [ ] Test receipt functionality
3. [ ] Test sharing links
4. [ ] Test forgot password
5. [ ] Check mobile responsiveness

## 🔍 Troubleshooting

### Common Issues
1. **Build fails**: Check import/export statements
2. **Authentication errors**: Verify Supabase credentials
3. **API errors**: Check backend deployment and CORS
4. **Database errors**: Verify table schema and RLS policies

### Debug Steps
1. Check browser console for errors
2. Check Vercel build logs
3. Check backend logs
4. Verify environment variables are set correctly

## 📱 Features to Test

### Authentication
- [ ] User registration
- [ ] Email confirmation
- [ ] User login
- [ ] User logout
- [ ] Forgot password

### Receipt Management
- [ ] Create new receipt
- [ ] Add items to receipt
- [ ] Save receipt to database
- [ ] View saved receipts
- [ ] Edit receipt name
- [ ] Delete receipt
- [ ] Share receipt link

### Split Functionality
- [ ] Add participants
- [ ] Assign items to participants
- [ ] Create split groups
- [ ] Calculate totals
- [ ] View summary

## ✅ Success Criteria
- [ ] App builds and deploys successfully
- [ ] All authentication features work
- [ ] Receipt creation and management works
- [ ] Sharing functionality works
- [ ] Mobile responsive design
- [ ] No console errors in production

## 📞 Support
If you encounter issues:
1. Check the deployment logs
2. Verify all environment variables
3. Test locally first
4. Check Supabase dashboard for database issues

Your app should now deploy successfully to Vercel! 🎉 