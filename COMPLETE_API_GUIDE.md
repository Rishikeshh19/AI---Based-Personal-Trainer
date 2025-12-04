# Complete API Endpoints & Usage Guide

## Overview

Yes, the API is being called for **many important functions**. The application uses REST API endpoints to communicate between the frontend and backend. All API calls go through the `apiCall()` function which handles authentication and headers.

---

## API Base URL

```
http://localhost:5000/api
```

---

## 1. AUTHENTICATION ENDPOINTS

### Login

```
POST /api/auth/login
Purpose: Authenticate user and get JWT token
Data Sent: { email, password }
Response: { token, user: { id, name, email, role } }
Used In: Login page
```

### Signup

```
POST /api/auth/signup
Purpose: Register new user (member or trainer)
Data Sent: { name, email, password, role }
Response: { token, user: { id, name, email, role } }
Used In: Signup page
```

---

## 2. MEMBER ENDPOINTS

### Get Member Profile

```
GET /api/members/profile
Purpose: Fetch current member's profile data
Authentication: Required (Bearer token)
Response: { name, email, fitness_level, goals, progress_data }
Used In: Profile page, Dashboard
```

### Update Member Profile

```
PUT /api/members/profile
Purpose: Update member's profile information
Data Sent: { name, email, fitness_level, goals, weight, height }
Authentication: Required
Response: { success, updatedProfile }
Used In: Profile edit
```

### Get Member Progress

```
GET /api/members/progress
Purpose: Get member's workout progress and statistics
Authentication: Required
Response: { total_workouts, calories_burned, streak, goal_progress }
Used In: Progress page, Dashboard
```

### Assign Trainer

```
PUT /api/members/assign-trainer
Purpose: Assign a trainer to a member
Data Sent: { trainerId }
Authentication: Required
Response: { success, trainer: { id, name } }
Used In: Select Trainer page
```

### Get Current Trainer

```
GET /api/members/current-trainer
Purpose: Get the current assigned trainer
Authentication: Required
Response: { trainerId, trainerName, trainerEmail }
Used In: Dashboard, Trainer view
```

---

## 3. TRAINER ENDPOINTS

### Get Trainer Profile

```
GET /api/trainers/profile
Purpose: Fetch trainer's profile
Authentication: Required
Response: { name, email, specialization, assigned_clients_count }
Used In: Trainer Profile page
```

### Update Trainer Profile

```
PUT /api/trainers/profile
Purpose: Update trainer's information
Data Sent: { name, email, specialization, bio }
Authentication: Required
Response: { success, updatedProfile }
Used In: Trainer Profile edit
```

### Get All Assigned Clients

```
GET /api/trainers/clients
Purpose: Get list of all clients assigned to trainer
Authentication: Required
Response: { clients: [{ id, name, fitness_level, progress }] }
Used In: Trainer Dashboard
```

### Get Client Details

```
GET /api/trainers/clients/:clientId
Purpose: Get detailed information about specific client
Parameters: clientId (in URL)
Authentication: Required
Response: { client: { id, name, workouts, progress, goals } }
Used In: Trainer Dashboard - Client view
```

### Remove Client

```
DELETE /api/trainers/clients/:clientId
Purpose: Remove a client from trainer's list
Parameters: clientId (in URL)
Authentication: Required
Response: { success, message: "Client removed" }
Used In: Trainer Dashboard - Remove client action
```

---

## 4. WORKOUT ENDPOINTS

### Add Workout

```
POST /api/workouts
Purpose: Log a new workout session
Data Sent: {
    exercises: [{ name, sets, reps, weight }],
    duration,
    date,
    notes
}
Authentication: Required
Response: { success, workoutId, savedWorkout }
Used In: Workout Execution page
```

### Get Member Workouts

```
GET /api/workouts/member/:memberId
Purpose: Get all workouts for a specific member
Parameters: memberId (in URL)
Authentication: Required
Response: { workouts: [{ id, date, exercises, duration, notes }] }
Used In: Dashboard, Progress tracking
```

---

## 5. PROGRESS ENDPOINTS

### Get Progress Reports

```
GET /api/progress/member/:memberId
Purpose: Get detailed progress analytics
Parameters: memberId (in URL)
Authentication: Required
Response: {
    total_workouts,
    calories_burned,
    avg_workout_duration,
    streak_days,
    goal_progress_percent,
    workout_history
}
Used In: Progress page, Analytics dashboard
```

---

## 6. AI SUGGESTIONS ENDPOINTS

### Get AI Suggestions

```
GET /api/ai-suggestions/member/:memberId
Purpose: Get personalized fitness recommendations
Parameters: memberId (in URL)
Authentication: Required
Response: {
    workout_suggestions: [{ exercise, sets, reps, intensity }],
    nutrition_advice: { calories, macros, tips },
    recovery_tips: { sleep, active_recovery, nutrition }
}
Used In: AI Suggestions page
```

---

## 7. EXERCISE ENDPOINTS

### Get All Exercises

```
GET /api/exercises
Purpose: Get database of all available exercises
Response: { exercises: [{ name, description, difficulty, gif_url }] }
Used In: Muscle Workout page
```

---

## 8. ANALYTICS ENDPOINTS

### Get Analytics Data

```
GET /api/analytics
Purpose: Get workout analytics and statistics
Authentication: Required
Response: { charts, statistics, trends }
Used In: Analytics/Dashboard
```

---

## REQUEST/RESPONSE FLOW

```
Frontend Component
    ↓
Calls api.function() (e.g., api.member.getProfile())
    ↓
apiCall() function
    ↓
Adds headers: {
    'Content-Type': 'application/json',
    'Authorization': 'Bearer {token}'
}
    ↓
Sends HTTP request to backend
    ↓
Backend Route (e.g., /api/members/profile)
    ↓
Backend Middleware (auth check, validation)
    ↓
Backend Controller (business logic)
    ↓
Database Query (if needed)
    ↓
Response JSON
    ↓
Frontend receives and uses data
```

---

## AUTHENTICATION FLOW

### How JWT Token Works:

1. **Login**: User sends credentials → Backend returns JWT token
2. **Storage**: Token stored in `localStorage.getItem('token')`
3. **Every Request**: Token sent in Authorization header
4. **Backend Check**: Middleware verifies token validity
5. **Access**: Only authenticated requests allowed

---

## EXAMPLE: Complete User Journey with API Calls

### 1. User Registration

```
signup.html → api.signup() → POST /auth/signup → Token stored
```

### 2. Login to Dashboard

```
login.html → api.login() → POST /auth/login → Token stored → Redirect to dashboard
```

### 3. View Dashboard

```
dashboard.html → api.member.getProgress() → GET /members/progress → Display stats
```

### 4. Select Trainer

```
select-trainer.html → api.member.assignTrainer() → PUT /members/assign-trainer → Update profile
```

### 5. Do Workout

```
workout-execution.html → api.addWorkout() → POST /workouts → Save workout
```

### 6. View AI Suggestions

```
ai-suggestions.html → api.getAISuggestions() → GET /ai-suggestions/member/{id} → Display tips
```

### 7. View Progress

```
progress.html → api.getProgressReports() → GET /progress/member/{id} → Display charts
```

---

## API SECURITY

✅ **Authentication**: JWT tokens required for protected routes
✅ **Authorization**: Users can only access their own data
✅ **Headers**: Automatically added to every request
✅ **Token Validation**: Backend middleware validates every request

---

## WHERE API CALLS HAPPEN

### Frontend Files Making API Calls:

1. **auth.js** → Login/Signup
2. **dashboard.js** → Progress, trainer info
3. **profile.js** → Profile CRUD operations
4. **trainer.js** → Trainer-specific functions
5. **workout.js** → Workout logging
6. **main.js** → AI suggestions

---

## COMPLETE API ENDPOINTS LIST

| Category      | Method | Endpoint                   | Purpose              |
| ------------- | ------ | -------------------------- | -------------------- |
| **Auth**      | POST   | /auth/login                | User login           |
|               | POST   | /auth/signup               | User registration    |
| **Members**   | GET    | /members/profile           | Get profile          |
|               | PUT    | /members/profile           | Update profile       |
|               | GET    | /members/progress          | Get progress         |
|               | PUT    | /members/assign-trainer    | Assign trainer       |
|               | GET    | /members/current-trainer   | Get assigned trainer |
| **Trainers**  | GET    | /trainers/profile          | Get profile          |
|               | PUT    | /trainers/profile          | Update profile       |
|               | GET    | /trainers/clients          | Get clients list     |
|               | GET    | /trainers/clients/:id      | Get client details   |
|               | DELETE | /trainers/clients/:id      | Remove client        |
| **Workouts**  | POST   | /workouts                  | Create workout       |
|               | GET    | /workouts/member/:id       | Get workouts         |
| **Progress**  | GET    | /progress/member/:id       | Get progress         |
| **AI**        | GET    | /ai-suggestions/member/:id | Get suggestions      |
| **Exercises** | GET    | /exercises                 | Get exercises        |
| **Analytics** | GET    | /analytics                 | Get analytics        |

---

## IMPORTANT NOTES

⚠️ **All protected endpoints require JWT token in Authorization header**

⚠️ **API base URL:** Must match backend port (default: 5000)

⚠️ **CORS:** Configured on backend to allow frontend requests

⚠️ **Error Handling:** All API calls have try-catch in frontend code

---

**Summary: YES, APIs are heavily used for:**

- ✅ User authentication
- ✅ Profile management
- ✅ Trainer-member relationships
- ✅ Workout logging
- ✅ Progress tracking
- ✅ AI recommendations
- ✅ Analytics

The application is a **true client-server architecture** where the frontend communicates with backend through REST APIs!
