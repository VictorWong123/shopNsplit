# ShopNSplit

A React application for splitting grocery bills with friends and family. Features include user authentication, receipt saving, and detailed cost breakdowns.

## Features

- **Multi-step bill splitting flow**: Setup → Grocery Items → Split Groups → Personal Items → Receipt
- **User Authentication**: Sign up, login, and logout with PassportJS
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
- PassportJS (Local Strategy)
- MongoDB with Mongoose
- Express Sessions with MongoDB Store
- bcryptjs for password hashing

## Setup Instructions

### Prerequisites
- Node.js (v14 or higher)
- MongoDB (running locally or MongoDB Atlas)
- npm or yarn

### Backend Setup

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
   MONGO_URI=mongodb://localhost:27017/shopnsplit
   SESSION_SECRET=your_secret_here_change_this_in_production
   PORT=5001
   ```

4. Start MongoDB (if running locally):
   ```bash
   # On macOS with Homebrew
   brew services start mongodb-community
   
   # Or start manually
   mongod
   ```

5. Start the backend server:
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

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register a new user
- `POST /api/auth/login` - Login user
- `POST /api/auth/logout` - Logout user
- `GET /api/auth/me` - Get current user info

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
1. Start the backend: `cd server && npm run dev`
2. Start the frontend: `npm start` (in project root)
3. Both servers will be running on their respective ports

### Database
The app uses MongoDB to store:
- User accounts (username, hashed password)
- Saved receipts (complete receipt data with timestamps)

### Authentication Flow
1. User registers/logs in through the modal
2. PassportJS handles session management
3. User state is maintained across page refreshes
4. Receipt saving requires authentication

## Deployment Considerations

### Environment Variables
- Update `SESSION_SECRET` for production
- Use MongoDB Atlas or production MongoDB instance
- Configure CORS origins for your domain

### Security
- Passwords are hashed using bcryptjs
- Sessions are stored in MongoDB
- CORS is configured for frontend communication

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

This project is open source and available under the [MIT License](LICENSE). 

