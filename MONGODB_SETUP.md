# MongoDB Setup Guide

## Prerequisites

- MongoDB installed locally or connection to MongoDB Atlas

## Installation & Setup

### 1. Install MongoDB (Local)

**Windows (Chocolatey):**

```bash
choco install mongodb-community
```

**Windows (Direct Download):**

- Download from: https://www.mongodb.com/try/download/community
- Install with default settings
- MongoDB will start automatically as a service

**Verify Installation:**

```bash
mongosh
```

Then type `exit()` to exit the MongoDB shell.

### 2. Configure Environment

The `.env` file is already configured for local MongoDB:

```
MONGODB_URL=mongodb://localhost:27017
DATABASE_NAME=ai_trainer
```

### 3. Using MongoDB Atlas (Cloud)

If you prefer cloud MongoDB:

1. Create account at https://www.mongodb.com/cloud/atlas
2. Create a free cluster
3. Get your connection string (looks like: `mongodb+srv://username:password@cluster.mongodb.net/`)
4. Update `.env`:

```
MONGODB_URL=mongodb+srv://your-user:your-password@your-cluster.mongodb.net/
```

### 4. Start the Application

```bash
# Terminal 1: Start Backend
cd backend
uvicorn app:app --host 127.0.0.1 --port 8000 --reload

# Terminal 2: Start Frontend
cd frontend
python -m http.server 5000
```

## Database Structure

### Users Collection

```json
{
  "_id": ObjectId,
  "name": "John Doe",
  "email": "john@example.com",
  "password": "hashed_password",
  "role": "member",
  "is_active": true,
  "created_at": ISODate,
  "updated_at": ISODate
}
```

### Features

- ✅ Persistent user storage
- ✅ Unique email constraint (no duplicate emails)
- ✅ Automatic timestamps
- ✅ Password hashing with bcrypt
- ✅ JWT token authentication

## Testing

1. **Sign Up:** http://localhost:5000/pages/signup.html

   - Fill in valid email, strong password
   - Data is saved to MongoDB

2. **Login:** http://localhost:5000/pages/login.html

   - Use same email and password from signup
   - Session is restored from database

3. **Verify Data:** Using MongoDB Compass
   - Download: https://www.mongodb.com/products/tools/compass
   - Connect to `mongodb://localhost:27017`
   - View data in `ai_trainer` → `users` collection

## Troubleshooting

**"MongoDB connection not available"**

- Ensure MongoDB is running: `mongosh`
- Check connection string in `.env`
- Verify port 27017 is not blocked

**"Email already registered"**

- This is expected - MongoDB enforces unique emails
- Use a different email to sign up

**"Failed to create user"**

- Check backend console for error messages
- Verify MongoDB collections exist

## Production Considerations

1. Use MongoDB Atlas for cloud hosting
2. Enable authentication in MongoDB
3. Use strong passwords in connection strings
4. Add data validation and indexing
5. Set up backup strategies
6. Monitor connection pooling
