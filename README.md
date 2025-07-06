# ShopNSplit

A React application for splitting grocery bills with friends and family. Features include user authentication, receipt saving, and detailed cost breakdowns.

## Features

- **Multi-step bill splitting flow**: Setup → Grocery Items → Split Groups → Personal Items → Receipt
- **User Authentication**: Sign up, login, and logout with Supabase Auth
- **User Settings**: Change username, email, password, and account management
- **Receipt Saving**: Save receipts to your account when logged in
- **Receipt History**: View and print previously saved receipts
- **Flexible Splitting**: Split items among everyone, specific groups, or keep personal items
- **Detailed Calculations**: Per-person totals with itemized breakdowns
- **Print Functionality**: Print receipts for sharing

## Tech Stack

### Frontend
- React
- Tailwind CSS
- Modern JavaScript (ES6+)

### Backend
- Node.js
- Express.js
- Supabase (Database & Auth)
- PostgreSQL (via Supabase)

## Setup Instructions

### Prerequisites
- Node.js (v14 or higher)
- Supabase account and project
- npm or yarn

### Environment Setup

1. Create a `.env` file in the project root:
   ```env
   REACT_APP_SUPABASE_URL=your_supabase_project_url
   REACT_APP_SUPABASE_ANON_KEY=your_supabase_anon_key
   ```

2. For local development, you can also run the development setup script:
   ```bash
   ./dev.sh
   ```

### Backend Setup (Optional for local development)

1. Navigate to the server directory:
   ```bash
   cd server
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Create a `.env` file in the server directory:
   ```env
   SESSION_SECRET=your_secret_here_change_this_in_production
   PORT=5001
   SUPABASE_URL=your_supabase_project_url
   SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
   ```

4. Start the backend server:
   ```bash
   # Development mode (with auto-restart)
   npm run dev
   
   # Production mode
   npm start
   ```

The backend will be running on `http://localhost:5001`

### Frontend Setup

1. Navigate to the project root:
   ```bash
   cd ..
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the development server:
   ```bash
   npm start
   ```

The frontend will be running on `http://localhost:3000`

## Usage

### For Non-Logged-In Users
1. Start at the Setup page to enter the number of people and their names
2. Add grocery items that everyone will split
3. Create split groups for items shared among specific people
4. Add personal items for individual purchases
5. View the final receipt with detailed breakdowns
6. Print the receipt

### For Logged-In Users
1. Sign up or log in using the authentication system
2. Follow the same flow as non-logged-in users
3. On the Receipt page, you'll see a "Save Receipt" button
4. Click "Save Receipt" to store the receipt in your account
5. Access your saved receipts through the user menu
6. View and print any previously saved receipt
7. Access settings through the user menu to manage your account

## API Endpoints

### Authentication (Supabase)
- User registration and login handled by Supabase Auth
- Password reset functionality
- Email verification (optional)

### Receipts (requires authentication)
- `POST /api/receipts` - Save a new receipt
- `GET /api/receipts` - Get all receipts for the current user

## Project Structure

```
shopNsplit/
├── src/
│   ├── components/
│   │   ├── AuthModal.jsx          # Login/Register modal
│   │   ├── UserMenu.jsx           # User dropdown menu
│   │   ├── ReceiptsPage.jsx       # Saved receipts page
│   │   ├── ReceiptPage.jsx        # Final receipt display
│   │   ├── PersonalItemsPage.jsx  # Personal items management
│   │   ├── SplitGroupsPage.jsx    # Split groups management
│   │   ├── GroceryPage.jsx        # Everyone items management
│   │   ├── SetupPage.jsx          # Initial setup
│   │   └── ...                    # Other reusable components
│   ├── App.jsx                    # Main app component
│   └── index.jsx                  # App entry point
├── server/
│   ├── models/
│   │   ├── User.js               # User model
│   │   └── Receipt.js            # Receipt model
│   ├── routes/
│   │   ├── auth.js               # Authentication routes
│   │   └── receipts.js           # Receipt routes
│   ├── passportConfig.js         # PassportJS configuration
│   ├── index.js                  # Server entry point
│   └── package.json              # Backend dependencies
└── README.md                     # This file
```

## Development

### Running Both Frontend and Backend

#### Option 1: Use the development script (Recommended)
```bash
./start-dev.sh
```

This script will:
- Check for required environment files
- Start the backend server on port 5001
- Start the frontend server on port 3000
- Handle cleanup when you stop the servers

#### Option 2: Manual startup
1. Start the backend: `cd server && npm start` (runs on port 5001)
2. Start the frontend: `npm start` (in project root, runs on port 3000)
3. Both servers will be running on their respective ports

### Database
The app uses Supabase (PostgreSQL) to store:
- User accounts (username, email, auth data)
- Saved receipts (complete receipt data with timestamps)

### Authentication Flow
1. User registers/logs in through the modal
2. Supabase Auth handles authentication and session management
3. User state is maintained across page refreshes
4. Receipt saving requires authentication

## Deployment Considerations

### Environment Variables
- Set `REACT_APP_SUPABASE_URL` and `REACT_APP_SUPABASE_ANON_KEY` for Supabase connection
- Configure CORS origins for your domain

### Security
- Passwords are handled securely by Supabase Auth
- User sessions are managed by Supabase
- CORS is configured for frontend communication

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

This project is open source and available under the [MIT License](LICENSE). 

