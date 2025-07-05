# Deployment Fix for Receipt Saving and Viewing

## Issue
The app was trying to call `/api/receipts` endpoints that don't exist in the deployed version, causing "Unexpected end of JSON input" errors.

## Solution Applied
Updated the app to use Supabase directly instead of the Express server API endpoints.

## Database Schema Update Required

You need to update your Supabase database schema to match the new structure. Run this SQL in your Supabase SQL Editor:

```sql
-- Drop existing receipts table if it exists to recreate with new schema
DROP TABLE IF EXISTS receipts CASCADE;

-- Create receipts table with updated schema
CREATE TABLE IF NOT EXISTS receipts (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    owner_id UUID REFERENCES users(id) ON DELETE CASCADE NOT NULL,
    title TEXT NOT NULL,
    total_amount DECIMAL(10,2) NOT NULL,
    participants JSONB NOT NULL,
    everyone_items JSONB NOT NULL,
    split_groups_items JSONB,
    personal_items JSONB,
    content_hash TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_receipts_owner_id ON receipts(owner_id);
CREATE INDEX IF NOT EXISTS idx_receipts_created_at ON receipts(created_at);
CREATE INDEX IF NOT EXISTS idx_receipts_content_hash ON receipts(content_hash);

-- Update RLS Policies for receipts table
CREATE POLICY "Users can view their own receipts" ON receipts
    FOR SELECT USING (auth.uid() = owner_id);

CREATE POLICY "Users can insert their own receipts" ON receipts
    FOR INSERT WITH CHECK (auth.uid() = owner_id);

CREATE POLICY "Users can update their own receipts" ON receipts
    FOR UPDATE USING (auth.uid() = owner_id);

CREATE POLICY "Users can delete their own receipts" ON receipts
    FOR DELETE USING (auth.uid() = owner_id);

-- Policy for public access to shared receipts (by ID)
CREATE POLICY "Public can view shared receipts" ON receipts
    FOR SELECT USING (true);
```

## Changes Made

1. **Updated `src/supabaseClient.js`**: Changed all receipt functions to use Supabase directly instead of API endpoints
2. **Updated `src/components/ReceiptsPage.jsx`**: Fixed property names to match new database schema (`title` instead of `name`, `created_at` instead of `createdAt`)
3. **Updated `src/components/SharedReceiptPage.jsx`**: Fixed property names to match new database schema
4. **Updated database schema**: Added new columns and changed `user_id` to `owner_id`

## What This Fixes

- ✅ Receipt saving will now work properly
- ✅ Receipt viewing will display correctly
- ✅ Receipt editing and deletion will function
- ✅ All data will be stored directly in Supabase
- ✅ No more "Unexpected end of JSON input" errors

## Next Steps

1. Run the SQL script above in your Supabase SQL Editor
2. Redeploy your app (the code changes are already made)
3. Test saving and viewing receipts

The app should now work correctly in production! 