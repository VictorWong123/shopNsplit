# ShopNSplit Backend

## Setup

1. Install dependencies:
   ```bash
   npm install
   ```
2. Create a `.env` file in the `server` directory:
   ```env
   MONGO_URI=mongodb://localhost:27017/shopnsplit
   SESSION_SECRET=your_secret_here
   PORT=5000
   ```
3. Start the server:
   ```bash
   node index.js
   ```

## API Endpoints

### Auth
- `POST /api/auth/register` — `{ username, password }`
- `POST /api/auth/login` — `{ username, password }`
- `POST /api/auth/logout`
- `GET /api/auth/me` — returns current user

### Receipts (requires login)
- `POST /api/receipts` — `{ data: <receiptObject> }`
- `GET /api/receipts` — returns all receipts for user

## Notes
- CORS is enabled for `http://localhost:3000` (adjust as needed for frontend).
- Uses MongoDB for data storage and PassportJS for authentication. 

## 🚨 **The Problem & Solution**

The error `relation "public.users" does not exist` means the database tables haven't been created yet. Here's what you need to do:

### **Step 1: Create the Database Tables**

1. **Go to your Supabase dashboard** at [supabase.com](https://supabase.com)
2. **Click on "SQL Editor"** in the left sidebar
3. **Click "New Query"**
4. **Copy and paste this SQL code:**

```sql
-- Create users table
CREATE TABLE IF NOT EXISTS users (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    username VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create receipts table
CREATE TABLE IF NOT EXISTS receipts (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    owner_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    data JSONB NOT NULL,
    name VARCHAR(255) DEFAULT '',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_users_username ON users(username);
CREATE INDEX IF NOT EXISTS idx_receipts_owner_id ON receipts(owner_id);
CREATE INDEX IF NOT EXISTS idx_receipts_created_at ON receipts(created_at);
```

5. **Click "Run"** to execute the query

### **Step 2: Verify Tables Were Created**

1. Go to **"Table Editor"** in the left sidebar
2. You should see two tables: `users` and `receipts`

### **Step 3: Test Your Backend**

```bash
cd server
node test-setup.js
```

You should now see:
```
✅ Supabase connection successful!
```

### **Step 4: Start Your Application**

```bash
# Terminal 1: Backend
cd server && npm run dev

# Terminal 2: Frontend
cd .. && npm start
```

## 🎯 **What Was Wrong**

The original schema had Row Level Security (RLS) policies that were designed for Supabase's built-in auth system, but we're using our own custom authentication with Passport.js. I've simplified the schema to work with our setup.

Once you run the SQL in your Supabase dashboard, everything should work perfectly! Let me know when you've completed these steps and we can test the full application. 