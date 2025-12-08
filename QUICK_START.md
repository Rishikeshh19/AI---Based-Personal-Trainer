# AI Personal Trainer - Quick Start Guide

## ✅ System Status

**Backend Server**: Running on http://localhost:8000
**Frontend Server**: Running on http://localhost:5173
**Database**: MongoDB Atlas (Connected ✅)
**Cache**: Redis (Connected ✅)

---

## 🔑 Test User Credentials

### Admin Account

- **Email**: admin@aitrainer.com
- **Password**: Admin@123
- **Access**: Full system administration

### Trainer Account

- **Email**: trainer@aitrainer.com
- **Password**: Trainer@123
- **Access**: Manage clients, create workouts, view progress

### Member Account

- **Email**: member@aitrainer.com
- **Password**: Member@123
- **Access**: Personal workouts, progress tracking, trainer communication

---

## 🚀 How to Use

### 1. Access the Application

1. Open your browser
2. Go to: **http://localhost:5173**
3. You'll see the login page

### 2. Login

1. Enter one of the test user emails above
2. Enter the corresponding password
3. Click "Login"

**Note**: On first login, old JWT tokens will be automatically cleared.

### 3. Features Available

#### For Members:

- ✅ View personalized dashboard
- ✅ Track workouts and progress
- ✅ Get AI-powered suggestions
- ✅ Request diet plans
- ✅ Message your trainer
- ✅ View exercise library with GIFs
- ✅ Dark mode toggle in settings

#### For Trainers:

- ✅ View all assigned clients
- ✅ Create custom workouts
- ✅ Monitor client progress
- ✅ Send messages to clients
- ✅ Generate diet recommendations
- ✅ Access client analytics

#### For Admins:

- ✅ Manage all users
- ✅ View system analytics
- ✅ Monitor platform activity
- ✅ Configure system settings

---

## 🔧 Troubleshooting

### If you see "401 Unauthorized" errors:

1. Clear your browser's localStorage (F12 → Application → Local Storage → Clear All)
2. Refresh the page
3. Log in again with fresh credentials

### If servers aren't running:

**Backend**:

```powershell
cd c:\Users\Rishikesh\Downloads\Code\AI---Based-Personal-Trainer\backend
npm start
```

**Frontend**:

```powershell
cd c:\Users\Rishikesh\Downloads\Code\AI---Based-Personal-Trainer\frontend
npm run dev
```

### If you need to reset user passwords:

```powershell
cd c:\Users\Rishikesh\Downloads\Code\AI---Based-Personal-Trainer\backend
node create_admin_user.js
```

---

## 📝 Important Notes

1. **JWT Secret Updated**: All users have fresh passwords that work with the new JWT_SECRET
2. **Auto Token Cleanup**: The system automatically clears old tokens when you visit any page
3. **MongoDB Atlas**: Connected to cloud database - all data is persistent
4. **Redis Cache**: Session management and performance optimization enabled
5. **Dark Mode**: Available in settings (Settings icon in navbar)

---

## 🎯 Next Steps

1. **Login** with any of the test accounts
2. **Explore** the dashboard and features
3. **Test** workout tracking and progress monitoring
4. **Try** the AI suggestions feature
5. **Configure** settings and dark mode

---

## ⚙️ Technical Details

- **Backend Port**: 8000
- **Frontend Port**: 5173
- **Database**: MongoDB Atlas (ai_trainer)
- **Authentication**: JWT with 30-day expiration
- **Real-time**: Socket.IO for live updates
- **API Base URL**: http://localhost:8000/api

---

## 🔐 Security

- Passwords are hashed with bcrypt
- JWT tokens expire after 30 days
- All API routes are protected
- MongoDB Atlas uses secure authentication
- Redis for session management

---

## ✨ Ready to Go!

The system is now fully configured and ready to use. Simply:

1. Open http://localhost:5173
2. Login with test credentials
3. Start exploring!

**Enjoy your AI Personal Trainer experience! 💪**
