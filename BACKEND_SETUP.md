# Backend Setup Complete ✅

## Overview

Your Express.js + MongoDB backend is fully configured and running!

## Current Status

- ✅ Backend Server: Running on port 5000
- ✅ MongoDB Atlas: Connected
- ✅ All Models: Initialized
- ✅ All Routes: Loaded
- ✅ Middleware: Configured
- ✅ Error Handling: Active

## Architecture

```
backend/
├── app.js                 # Main Express server
├── config/
│   └── database.js        # MongoDB/Mongoose connection
├── models/
│   ├── User.js            # User schema & methods
│   ├── Workout.js         # Workout tracking
│   └── Exercise.js        # Exercise library
├── routes/
│   ├── index.js           # Route aggregator
│   ├── auth.routes.js     # Authentication endpoints
│   ├── workout.routes.js  # Workout CRUD
│   ├── member.routes.js   # Member profiles
│   ├── exercise.routes.js # Exercise library
│   ├── analytics.routes.js # Analytics data
│   ├── progress.routes.js # Progress tracking
│   └── ai-suggestion.routes.js # AI recommendations
├── controllers/
│   ├── auth.controller.js
│   └── [other controllers]
├── middleware/
│   ├── auth.js            # JWT protection
│   ├── error.js           # Error handling
│   ├── async.js           # Async wrapper
│   └── validation.js      # Input validation
├── utils/
│   ├── logger.js          # Winston logger
│   ├── errorResponse.js   # Error class
│   ├── sendEmail.js       # Email service
│   └── seedExercises.js   # Database seeding
└── .env                   # Environment config
```

## API Endpoints

### Authentication

- `POST /api/auth/register` - Create new user account
- `POST /api/auth/login` - Login with email/password
- `GET /api/auth/me` - Get current user (protected)
- `POST /api/auth/forgot-password` - Request password reset
- `PUT /api/auth/reset-password/:token` - Reset password
- `PUT /api/auth/update-password` - Update password (protected)

### Workouts

- `GET /api/workouts` - Get all workouts
- `GET /api/workouts/:id` - Get specific workout
- `POST /api/workouts` - Create workout (protected)
- `PUT /api/workouts/:id` - Update workout (protected)
- `DELETE /api/workouts/:id` - Delete workout (protected)

### Members

- `GET /api/members` - Get all members
- `GET /api/members/:id` - Get member profile
- `POST /api/members` - Create member (protected)
- `PUT /api/members/:id` - Update profile (protected)

### Exercises

- `GET /api/exercises` - Get exercise library
- `GET /api/exercises/:id` - Get exercise details
- `POST /api/exercises` - Add exercise (admin)
- `DELETE /api/exercises/:id` - Remove exercise (admin)

### Analytics

- `GET /api/analytics` - Get user analytics
- `GET /api/analytics/detailed` - Detailed metrics
- `GET /api/analytics/comparison` - Period comparison

### Progress

- `GET /api/progress` - Get progress summary
- `GET /api/progress/history` - Historical data
- `POST /api/progress/milestone` - Mark milestone

### AI Suggestions

- `GET /api/ai-suggestions` - Get personalized recommendations
- `GET /api/ai-suggestions/workouts` - Suggested workouts
- `GET /api/ai-suggestions/nutrition` - Nutrition advice
- `GET /api/ai-suggestions/recovery` - Recovery tips

## MongoDB Collections

### users

```javascript
{
  _id: ObjectId,
  username: String (unique),
  email: String (unique),
  password: String (hashed),
  role: String ('user' | 'trainer' | 'admin'),
  profile: {
    firstName: String,
    lastName: String,
    age: Number,
    gender: String,
    height: Number,
    weight: Number,
    fitnessLevel: String,
    goals: [String],
    profilePicture: String,
    bio: String
  },
  isEmailVerified: Boolean,
  lastLogin: Date,
  status: String ('active' | 'inactive' | 'suspended'),
  createdAt: Date,
  updatedAt: Date
}
```

### workouts

```javascript
{
  _id: ObjectId,
  user: ObjectId (ref: 'User'),
  date: Date,
  exercises: [
    {
      exercise: ObjectId,
      sets: Number,
      reps: Number,
      weight: Number,
      duration: Number,
      intensity: String,
      notes: String
    }
  ],
  totalCalories: Number,
  duration: Number,
  notes: String,
  completed: Boolean,
  createdAt: Date,
  updatedAt: Date
}
```

### exercises

```javascript
{
  _id: ObjectId,
  name: String,
  category: String,
  difficulty: String,
  muscleGroups: [String],
  description: String,
  instructions: [String],
  estimatedCalories: Number,
  equipment: [String],
  image: String,
  createdAt: Date,
  updatedAt: Date
}
```

## Environment Variables (.env)

```dotenv
NODE_ENV=development
PORT=5000
MONGODB_URI=mongodb+srv://trainer:trainer%40123@cluster0.l1vr8dg.mongodb.net/ai_trainer?retryWrites=true&w=majority
DATABASE_NAME=ai_trainer
JWT_SECRET=your_jwt_secret
JWT_EXPIRE=30d
JWT_COOKIE_EXPIRE=30
FRONTEND_URL=http://localhost:5000
```

## Starting the Backend

### Development Mode (with auto-reload)

```bash
cd backend
npm run dev
```

### Production Mode

```bash
cd backend
npm start
```

### Testing Server Status

```bash
curl http://localhost:5000/health
```

Expected response:

```json
{
  "status": "healthy",
  "service": "AI Personal Trainer API",
  "timestamp": "2025-12-03T14:27:30.000Z",
  "version": "1.0.0",
  "docs": "http://localhost:5000/api-docs"
}
```

## Authentication Flow

1. **Register**: `POST /api/auth/register`

   - Hashes password with bcrypt
   - Creates user in MongoDB
   - Returns JWT token

2. **Login**: `POST /api/auth/login`

   - Validates email/password
   - Generates JWT token
   - Sets secure cookie

3. **Protected Routes**: Add `Authorization: Bearer <token>` header
   - Middleware verifies JWT
   - Validates user status
   - Grants access

## Error Handling

The API returns consistent error responses:

```json
{
  "success": false,
  "error": "Invalid credentials"
}
```

Status codes:

- `400` - Bad request / validation error
- `401` - Unauthorized / invalid token
- `403` - Forbidden / insufficient permissions
- `404` - Resource not found
- `409` - Conflict / duplicate entry
- `500` - Server error

## Logging

Logs are stored in `/backend/logs/`:

- `combined.log` - All logs
- `error.log` - Error logs only

Console output in development shows real-time logs with colors.

## Database Connection

Connected to MongoDB Atlas with:

- Connection pooling (min: 10, max: 50)
- Automatic reconnection (retryWrites)
- 5-second socket timeout
- Replica set write concern

## Performance Optimizations

✅ Connection pooling for MongoDB
✅ JWT token-based authentication (stateless)
✅ Bcrypt password hashing
✅ Async/await error handling
✅ Request validation with express-validator
✅ CORS middleware for cross-origin requests
✅ Morgan HTTP logging
✅ Winston structured logging
✅ Error handling middleware

## Frontend Integration

Frontend should connect to:

- API Base: `http://localhost:5000/api`
- Auth Token: Stored in localStorage or cookie
- CORS: Enabled for all origins

Example fetch:

```javascript
const response = await fetch("http://localhost:5000/api/auth/login", {
  method: "POST",
  headers: {
    "Content-Type": "application/json",
    Authorization: `Bearer ${token}`,
  },
  body: JSON.stringify({ email, password }),
});
```

## Troubleshooting

### MongoDB Connection Error

- Check internet connection
- Verify MongoDB Atlas cluster is running
- Confirm connection string in .env

### Port Already in Use

```bash
# Kill process on port 5000 (Windows)
netstat -ano | findstr :5000
taskkill /PID <PID> /F

# Or use different port
PORT=3001 npm run dev
```

### SMTP Connection Error (Safe to Ignore)

- Email service not configured
- Won't affect core functionality
- Configure when ready for password reset

### Slow API Response

- Check MongoDB Atlas region
- Verify internet connection
- Monitor connection pool usage

## Next Steps

1. **Start Frontend**

   ```bash
   cd frontend
   python -m http.server 5000
   ```

2. **Test Authentication**

   - Register a new user
   - Login and get token
   - Access protected routes

3. **Create Sample Data**

   - Add exercises
   - Create workouts
   - Track progress

4. **Monitor Logs**
   - Watch console output
   - Check log files
   - Debug issues

## Support

For issues:

1. Check error logs: `cat backend/logs/error.log`
2. Verify MongoDB connection
3. Ensure all dependencies installed: `npm list`
4. Check port availability
5. Review API documentation above

---

✨ **Backend is ready to power your AI Personal Trainer app!**
