# ⚡ Quick Start Guide - AI Personal Trainer

## 🎯 What's Ready

✅ **Authentication** - Signup/Login with JWT  
✅ **Workout Logging** - Track exercises with sets, reps, calories  
✅ **Progress Tracking** - View stats and history  
✅ **AI Suggestions** - Personalized recommendations  
✅ **MongoDB Storage** - Persistent data  
✅ **Docker Ready** - One-command deployment

## 🚀 Start in 30 Seconds

### Option A: Local Development

```bash
# Terminal 1 - Backend
cd backend
uvicorn app:app --host 127.0.0.1 --port 8000 --reload

# Terminal 2 - Frontend
cd frontend
python -m http.server 5000
```

**Access:** http://localhost:5000

### Option B: Docker (Production-Ready)

```bash
docker-compose up -d
```

**Access:** http://localhost:5000

## 📝 Test Account

**Email:** testuser@example.com  
**Password:** TestPass@123

Or signup at: http://localhost:5000/pages/signup.html

## 🎮 Try These Features

1. **Login**

   - Go to Login page
   - Use test credentials
   - Dashboard loads with your data

2. **Log a Workout**

   - Click "Log Workout"
   - Add exercise details
   - Track calories and duration

3. **View Progress**

   - Go to Progress page
   - See 30-day stats
   - Track improvement

4. **Get AI Suggestions**
   - AI Suggestions page
   - Get personalized recommendations
   - Based on your workout history

## 🔌 API Examples

**Test API (Terminal/PowerShell)**

```bash
# Signup
$body = @{name="Test";email="test@test.com";password="Pass@123";role="member"} | ConvertTo-Json
$r = Invoke-WebRequest -Uri "http://localhost:8000/api/auth/signup" -Method POST -ContentType "application/json" -Body $body
$r.Content

# Login
$body = @{email="test@test.com";password="Pass@123"} | ConvertTo-Json
$r = Invoke-WebRequest -Uri "http://localhost:8000/api/auth/login" -Method POST -ContentType "application/json" -Body $body
$r.Content
```

## 📊 Backend API Routes

```
Authentication:
  POST /api/auth/signup          - Create account
  POST /api/auth/login           - Login

Workouts:
  POST /api/workouts/log         - Log exercise
  GET  /api/workouts/today       - Today's workout
  GET  /api/workouts/history     - Workout history
  GET  /api/workouts/progress    - Progress stats

AI:
  GET  /api/ai/suggestions       - AI recommendations
  GET  /api/ai/nutrition-advice  - Nutrition tips
  GET  /api/ai/recovery-tips     - Recovery guide

Profile:
  GET  /api/progress/            - Progress summary
  GET  /api/members/profile      - Your profile
```

## 🛑 Stop Services

```bash
# Docker
docker-compose down

# Local
Press Ctrl+C in both terminals
```

## 📱 Features Overview

### Dashboard

- Welcome message with user name
- Quick stats card
- Recent workouts
- Progress overview

### Workout Logging

- Exercise name, type, duration
- Calories and intensity
- Sets/reps for strength training
- Optional notes

### Progress Page

- 30-day stats
- Total workouts completed
- Total calories burned
- Average per workout
- Workout history list

### AI Suggestions

- Personalized exercise recommendations
- Fitness tips and goals
- Nutrition advice
- Recovery techniques
- Based on your workout data

### Settings

- User profile
- Password change (ready to implement)
- Role management (trainers/admins)

## 🐛 Common Issues

**Port in use?**

```bash
# Windows - Find what's using port 8000
netstat -ano | findstr :8000
taskkill /PID <PID> /F

# Mac/Linux
lsof -ti:8000 | xargs kill -9
```

**MongoDB not connecting?**

- Ensure MongoDB is running: `mongod`
- Check connection string in `.env`
- Verify MongoDB is on localhost:27017

**Frontend not loading?**

- Verify backend is running on 8000
- Check browser console (F12) for errors
- Clear browser cache

## 📚 Next Steps

1. **Customize** - Update colors, text, branding
2. **Deploy** - Use Docker or cloud platform (see DEPLOYMENT_GUIDE.md)
3. **Add Features** - Integrate payment, social sharing, etc.
4. **Scale** - Add Redis caching, CDN, load balancing

## 💾 Data Persistence

- Users stored in MongoDB
- Workouts tracked with date
- Progress calculated automatically
- All data persists across sessions

## 🔐 Security

- Passwords hashed with bcrypt
- JWT tokens (30-min expiration)
- Email validation
- Password strength requirements

## 📞 Support

Check DEPLOYMENT_GUIDE.md for:

- Full API documentation
- Production deployment options
- Architecture overview
- Troubleshooting guide

---

**Ready to deploy?** See `DEPLOYMENT_GUIDE.md` for cloud deployment options!
