# 🎯 Admin Dashboard - Complete Guide

## 🔑 Admin Credentials

**Email**: `admin@gmail.com`  
**Password**: `Admin@1234`

---

## ✨ Features

### 1. **Overview Tab**
- **Total Users**: Count of all registered users
- **Premium Members**: Number of members
- **Trainers**: Active trainers count
- **Workouts Logged**: Total workout sessions
- **Recent Activity**: Last 5 workout completions

### 2. **Users & Roles Tab** (Full CRUD)
- ✅ **View All Users**: Fetches from MongoDB Atlas
- ✅ **Add New User**: Create users with custom roles
- ✅ **Edit User Role**: Change user permissions (User/Member/Trainer/Admin)
- ✅ **Delete User**: Remove users (except admins)
- 📊 **User Details**: Name, Email, Role, Join Date

### 3. **Monitoring Tab** (Prometheus & Grafana)
- 📈 **Live Metrics**:
  - Active Users (real-time)
  - Average API Latency
  - Total HTTP Requests
- 📊 **Live Traffic Chart**: Real-time user activity visualization
- 🔗 **External Tools**:
  - **Grafana Dashboard**: http://localhost:3001 (admin/admin)
  - **Prometheus**: http://localhost:9090

---

## 🚀 Quick Start

### 1. Start Services
```powershell
# Start Docker (Prometheus & Grafana)
docker-compose up -d

# Start Backend (in backend folder)
node app.js

# Start Frontend (in frontend folder)
npm run dev
```

### 2. Access Dashboard
1. Open: http://localhost:5173/pages/login.html
2. Login with admin credentials above
3. You'll be auto-redirected to: http://localhost:5173/pages/admin-dashboard.html

---

## 📋 User Management Operations

### Add New User
1. Click **"Users & Roles"** tab
2. Click **"Add New User"** button
3. Fill in:
   - Name
   - Email
   - Password
   - Role (User/Member/Trainer/Admin)
4. Click **"Create User"**

### Edit User Role
1. Find user in the table
2. Click **Edit** icon (pencil)
3. Select new role from dropdown
4. Click **"Save Changes"**

### Delete User
1. Find user in the table
2. Click **Delete** icon (trash)
3. Confirm deletion
4. ⚠️ **Note**: Cannot delete admin users

---

## 🔧 API Endpoints Used

### Admin Routes (All require admin auth)
- `GET /api/admin/stats` - System statistics
- `GET /api/admin/users` - List all users
- `POST /api/admin/users` - Create new user
- `PUT /api/admin/users/:userId` - Update user
- `DELETE /api/admin/users/:userId` - Delete user
- `GET /api/admin/activity-log` - Recent activity

### Metrics Routes
- `GET /api/metrics` - Prometheus metrics endpoint
- `GET /api/metrics/dashboard` - Dashboard metrics

---

## 📊 Monitoring Setup

### Prometheus
- **URL**: http://localhost:9090
- **Scrape Interval**: 15 seconds
- **Metrics Endpoint**: http://localhost:8000/api/metrics

### Grafana
- **URL**: http://localhost:3001
- **Login**: admin / admin
- **Data Source**: Pre-configured Prometheus
- **Features**:
  - Anonymous viewing enabled
  - Embedding allowed
  - Auto-provisioned datasource

---

## 🎨 Design Features

### Modern UI Elements
- ✨ Glassmorphism effects
- 🎨 Gradient backgrounds
- 💫 Smooth animations
- 📱 Fully responsive
- 🌈 Color-coded role badges

### Role Badge Colors
- **Admin**: Purple gradient
- **Trainer**: Pink gradient  
- **Member**: Green gradient
- **User**: Gray

---

## 🔒 Security

- ✅ JWT Authentication required
- ✅ Admin-only route protection
- ✅ Password hashing (bcrypt)
- ✅ CORS enabled
- ✅ Helmet security headers

---

## 🐛 Troubleshooting

### "Invalid Credentials"
- Use: `admin@gmail.com` / `Admin@1234`
- NOT: `admin@aitrainer.com`

### "Cannot fetch users"
- Check backend is running on port 8000
- Check MongoDB connection
- Check browser console for errors

### "Monitoring shows 0"
- Wait 15-30 seconds for first scrape
- Check Prometheus is running: `docker ps`
- Verify metrics endpoint: http://localhost:8000/api/metrics

### "Redirected to member dashboard"
- Clear browser cache (Ctrl + Shift + R)
- Clear localStorage and re-login
- Check user role in localStorage: `localStorage.getItem('current_user')`

---

## 📁 File Structure

```
frontend/
├── pages/
│   └── admin-dashboard.html    # Main admin UI
├── js/
│   └── admin.js                # Admin logic & API calls
└── css/
    └── (shared styles)

backend/
├── controllers/
│   └── admin.controller.js     # Admin CRUD operations
├── routes/
│   └── admin.routes.js         # Admin API routes
└── middleware/
    ├── auth.js                 # JWT verification
    └── admin.js                # Admin role check

infra/
├── prometheus.yml              # Prometheus config
└── grafana/
    └── provisioning/
        └── datasources/
            └── datasource.yml  # Auto-config Grafana
```

---

## 🎯 Next Steps

1. **Customize Grafana Dashboards**:
   - Login to http://localhost:3001
   - Create custom panels
   - Add alerts

2. **Extend User Management**:
   - Add bulk operations
   - Export user data
   - Advanced filtering

3. **Enhanced Monitoring**:
   - Add custom metrics
   - Set up alerting
   - Create SLA dashboards

---

## 📞 Support

For issues:
1. Check browser console (F12)
2. Check backend logs
3. Verify all services running
4. Clear cache and retry

---

**Last Updated**: December 10, 2025  
**Version**: 2.0  
**Status**: ✅ Fully Functional
