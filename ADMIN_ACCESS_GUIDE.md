# 🔐 Admin Monitoring System - Access Guide

## 📍 Quick Access

### **System Monitoring Dashboard**

- **URL**: `http://localhost:5173/pages/system-monitoring.html`
- **Required Role**: Admin
- **Login Required**: Yes

---

## 👤 Admin Login Credentials

### Option 1: Use Existing Admin Account

```
Email: admin@aitrainer.com
Password: Admin@123
```

### Option 2: Create New Admin Account

Run this command in the backend directory:

```powershell
cd backend
node create_admin_user.js
```

This creates/updates three test accounts:

- **Admin**: admin@aitrainer.com / Admin@123
- **Trainer**: trainer@aitrainer.com / Trainer@123
- **Member**: member@aitrainer.com / Member@123

---

## 🚀 Step-by-Step Access Instructions

### Step 1: Ensure Backend is Running

```powershell
cd "c:\Users\Rishikesh\Downloads\Code\AI---Based-Personal-Trainer\backend"
node app.js
```

✅ Should see: "Server running on http://localhost:8000"

### Step 2: Ensure Frontend is Running

```powershell
cd "c:\Users\Rishikesh\Downloads\Code\AI---Based-Personal-Trainer\frontend"
npm run dev
```

✅ Should see: "Local: http://localhost:5173"

### Step 3: Ensure Prometheus is Running (Docker)

```powershell
docker ps
```

✅ Should see container: `prometheus-trainer`

If not running:

```powershell
cd "c:\Users\Rishikesh\Downloads\Code\AI---Based-Personal-Trainer"
docker-compose up -d prometheus
```

### Step 4: Login as Admin

1. Open browser: `http://localhost:5173`
2. Click **Login** in navigation
3. Enter admin credentials:
   - Email: `admin@aitrainer.com`
   - Password: `Admin@123`
4. Click **Login**

### Step 5: Access Monitoring Dashboard

After successful login, navigate to:

```
http://localhost:5173/pages/system-monitoring.html
```

Or use the Admin Dashboard link from the navigation menu (if available)

---

## 📊 What You'll See in System Monitoring

### Real-Time Metrics Cards

- **Total Users**: Count of all registered users
- **Active Workouts**: Currently active workout sessions
- **API Health**: Success rate and response times
- **System Uptime**: Server uptime duration

### Charts & Visualizations

1. **API Response Time Trends** (Line chart)
2. **User Activity Heatmap** (Bar chart)
3. **Workout Distribution** (Pie chart)
4. **Error Rate Tracking** (Line chart)

### Live Data

- Auto-refreshes every 30 seconds
- Manual refresh button available
- Real-time WebSocket updates (if implemented)

---

## 🔧 Troubleshooting

### Issue: "Cannot access monitoring page"

**Solution**: Ensure you're logged in as admin

```javascript
// Check in browser console
localStorage.getItem("token"); // Should return a token
localStorage.getItem("role"); // Should return 'admin'
```

### Issue: "No metrics data showing"

**Solution 1**: Check backend metrics endpoint

```powershell
curl http://localhost:8000/api/metrics/dashboard
```

**Solution 2**: Check Prometheus

```powershell
curl http://localhost:8000/api/metrics
```

### Issue: "Prometheus connection failed"

**Solution**: Restart Prometheus container

```powershell
docker restart prometheus-trainer
```

### Issue: "401 Unauthorized"

**Solution**: Clear localStorage and re-login

```javascript
// In browser console
localStorage.clear();
// Then login again
```

---

## 🎯 Admin Monitoring Features

### Current Features Available:

- ✅ **System Health Monitoring**

  - CPU, Memory, Disk usage (via Prometheus)
  - API response times
  - Error rates and types

- ✅ **User Analytics**

  - Total users by role (admin/trainer/member)
  - Active users count
  - Registration trends

- ✅ **Workout Analytics**

  - Total workouts created
  - Workouts by type/muscle group
  - Completion rates

- ✅ **API Performance**

  - Request counts by endpoint
  - Average response times
  - Success/error rates

- ✅ **Database Metrics**
  - Connection pool status
  - Query performance
  - Collection sizes

### Prometheus Metrics Available:

Visit `http://localhost:8000/api/metrics` to see raw metrics in Prometheus format:

- `http_request_duration_seconds` - API latency
- `http_requests_total` - Request counter
- `active_users` - Current active users
- `workout_operations_total` - Workout CRUD operations
- `api_errors_total` - Error counter by type
- `db_operations_duration_seconds` - Database query times
- `auth_attempts_total` - Login/registration attempts

---

## 🔗 Related Access Points

### Admin Dashboard

- **URL**: `http://localhost:5173/pages/admin-dashboard.html`
- **Features**: User management, trainer assignments, system settings

### Prometheus Dashboard (Raw Metrics)

- **URL**: `http://localhost:9090`
- **Access**: Direct access (no login required)
- **Use**: Raw metrics exploration and custom queries

### Grafana Dashboard (if configured)

- **URL**: `http://localhost:3001`
- **Default Login**: admin / admin
- **Use**: Advanced visualizations and alerting

---

## 📱 Mobile Access

The monitoring dashboard is responsive and can be accessed on mobile devices:

```
http://YOUR_LOCAL_IP:5173/pages/system-monitoring.html
```

Replace `YOUR_LOCAL_IP` with your computer's local IP (e.g., 192.168.1.x)

---

## 🔒 Security Notes

1. **Change Default Passwords**: The default admin password should be changed in production
2. **Role-Based Access**: Only admin users can access monitoring endpoints
3. **Token Expiration**: Login tokens expire after 30 days
4. **HTTPS**: Use HTTPS in production environments
5. **Rate Limiting**: Monitoring endpoints are rate-limited to prevent abuse

---

## 📞 Quick Reference Commands

```powershell
# Start everything at once
cd backend
node app.js &
cd ../frontend
npm run dev &
docker-compose up -d prometheus

# Check if everything is running
curl http://localhost:8000/health           # Backend health
curl http://localhost:5173                  # Frontend
curl http://localhost:8000/api/metrics      # Metrics endpoint
docker ps | grep prometheus                 # Prometheus status

# Create/reset admin user
cd backend
node create_admin_user.js

# View backend logs
cd backend
Get-Content -Path "logs/combined.log" -Tail 50

# Stop everything
Get-Process -Name node | Stop-Process
docker-compose down
```

---

## 🎓 Tutorial: First Time Setup

### Complete Setup (5 minutes)

1. **Install Dependencies** (if not done)

   ```powershell
   cd backend
   npm install
   cd ../frontend
   npm install
   ```

2. **Configure Environment**

   ```powershell
   cd backend
   # Ensure .env file exists with correct settings
   ```

3. **Start Docker Services**

   ```powershell
   docker-compose up -d
   ```

4. **Create Admin User**

   ```powershell
   cd backend
   node create_admin_user.js
   ```

5. **Start Backend**

   ```powershell
   node app.js
   ```

6. **Start Frontend** (new terminal)

   ```powershell
   cd frontend
   npm run dev
   ```

7. **Access System**
   - Open: `http://localhost:5173`
   - Login with: `admin@aitrainer.com` / `Admin@123`
   - Navigate to: `http://localhost:5173/pages/system-monitoring.html`

---

## 📊 Monitoring Best Practices

1. **Regular Checks**: Monitor system health daily
2. **Alert Setup**: Configure alerts for critical metrics
3. **Log Review**: Check error logs weekly
4. **Performance**: Track API response times for degradation
5. **Capacity**: Monitor user growth and database size
6. **Backup**: Regular database backups recommended

---

## 🆘 Support

If you encounter issues:

1. Check browser console (F12) for errors
2. Check backend logs in `backend/logs/`
3. Verify all services are running (backend, frontend, Prometheus)
4. Clear browser cache and localStorage
5. Restart backend and frontend servers

---

**Last Updated**: December 8, 2025  
**Version**: 1.0  
**Maintained by**: AI Personal Trainer Team
