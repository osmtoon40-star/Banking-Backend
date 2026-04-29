# Banking System Backend

A Node.js banking backend API with authentication, account management, and transaction handling.

## Features

- User authentication (register, login, logout)
- Account management
- Transaction processing
- Token blacklisting
- Email notifications
- JWT-based authentication

## Tech Stack

- Node.js + Express
- MongoDB + Mongoose
- JWT for authentication
- Bcrypt for password hashing
- Nodemailer for email service
- Cookie-parser for session management

## Installation

1. Clone the repository
```bash
git clone <repository-url>
cd BankingSystem
```

2. Install dependencies
```bash
npm install
```

3. Create `.env` file (copy from `.env.example`)
```bash
cp .env.example .env
```

4. Configure your environment variables:
   - `MONGO_URI`: Your MongoDB connection string
   - `JWT_SECRET`: Your JWT secret key
   - Email configuration (EMAIL_USER, CLIENT_ID, CLIENT_SECRET, REFRESH_TOKEN)

## Running the Server

### Development mode (with auto-reload)
```bash
npm run dev
```

### Production mode
```bash
node server.js
```

The server will start on port 3000.

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register a new user
- `POST /api/auth/login` - Login user
- `POST /api/auth/logout` - Logout user (requires token)

## Database Setup

Ensure MongoDB is running on your system:
```bash
# macOS (if installed via Homebrew)
brew services start mongodb-community
```

## Project Structure

```
├── server.js                 # Entry point
├── package.json
├── .env.example             # Environment variables template
├── src/
│   ├── app.js              # Express app setup
│   ├── config/
│   │   └── database.js      # MongoDB connection
│   ├── controllers/         # Request handlers
│   ├── middleware/          # Custom middleware
│   ├── models/              # Mongoose schemas
│   ├── routes/              # API routes
│   └── services/            # Business logic (email, etc.)
```

## Error Handling

The API returns standard HTTP status codes:
- `200` - Success
- `201` - Created
- `400` - Bad Request
- `401` - Unauthorized
- `403` - Forbidden
- `422` - Unprocessable Entity

## License

ISC
