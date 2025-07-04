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