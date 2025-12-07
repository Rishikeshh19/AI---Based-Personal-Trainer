# Admin System - Testing & Verification Guide

## Quick Start (30 seconds)

### 1. Login as Admin

```
Email: admin@example.com
Password: admin123456
```

### 2. Access Admin Dashboard

1. Click "Monitoring" in sidebar
2. Click "Admin Panel" link (purple with crown icon)
3. You should see admin dashboard with stats and user management

### 3. Test Admin Features

- View all users in table
- Edit a user (click edit button, change name/role)
- Check activity log (click Activity tab)

---

## Detailed Testing Guide

### Backend API Testing

#### Test 1: Verify Admin Routes Exist

```powershell
# Test without token (should fail)
curl http://localhost:8000/api/admin/stats

# Expected: 401 Unauthorized
```

#### Test 2: Get Admin Token

1. Login as admin user:

```powershell
$login = @{
    email = "admin@example.com"
    password = "admin123456"
} | ConvertTo-Json

$response = Invoke-RestMethod -Uri "http://localhost:8000/api/auth/login" `
    -Method POST `
    -ContentType "application/json" `
    -Body $login

$token = $response.token
Write-Host "Token: $token"
```

#### Test 3: Test Admin Statistics Endpoint

```powershell
$headers = @{"Authorization" = "Bearer $token"}

$response = Invoke-RestMethod -Uri "http://localhost:8000/api/admin/stats" `
    -Headers $headers

$response | ConvertTo-Json | Write-Host
```

**Expected Response:**

```json
{
  "success": true,
  "stats": {
    "totalUsers": 10,
    "usersByRole": {
      "user": 5,
      "member": 3,
      "trainer": 1,
      "admin": 1
    },
    "totalWorkouts": 25,
    "totalExercises": 87
  }
}
```

#### Test 4: Get All Users

```powershell
$response = Invoke-RestMethod -Uri "http://localhost:8000/api/admin/users" `
    -Headers $headers

$response.users | Select-Object -First 3 | ConvertTo-Json | Write-Host
```

**Expected Response:**

```json
{
  "success": true,
  "count": 10,
  "users": [
    {
      "_id": "...",
      "name": "User Name",
      "email": "user@example.com",
      "role": "member",
      "createdAt": "2024-XX-XX"
    }
  ]
}
```

#### Test 5: Test Role-Based Access Control

```powershell
# Login as member (not admin)
$memberLogin = @{
    email = "member@example.com"
    password = "password123"
} | ConvertTo-Json

$memberResponse = Invoke-RestMethod -Uri "http://localhost:8000/api/auth/login" `
    -Method POST `
    -ContentType "application/json" `
    -Body $memberLogin

$memberToken = $memberResponse.token

# Try to access admin endpoint with member token
$memberHeaders = @{"Authorization" = "Bearer $memberToken"}

Invoke-RestMethod -Uri "http://localhost:8000/api/admin/stats" `
    -Headers $memberHeaders
```

**Expected: 403 Forbidden**

```json
{
  "success": false,
  "message": "Access denied. Admin role required."
}
```

### Frontend Testing

#### Test 1: Admin Dashboard Access

1. Open browser developer tools (F12)
2. Login as admin
3. Navigate to http://localhost:5173/pages/monitoring.html
4. Verify "Admin Panel" link appears in sidebar
5. Click "Admin Panel" link
6. Should load admin-dashboard.html without redirect

**Verification Points:**

- ✅ Dashboard loads
- ✅ Statistics cards show numbers
- ✅ Users tab shows user table
- ✅ Activity tab shows workout log
- ✅ Edit/delete buttons work

#### Test 2: Non-Admin Access

1. Open browser developer tools
2. Login as member or trainer
3. Navigate to http://localhost:5173/pages/monitoring.html
4. Verify "Admin Panel" link is NOT visible
5. Try accessing admin-dashboard.html directly
6. Should attempt to load then redirect

**Expected Behavior:**

- Admin link hidden in sidebar
- Direct URL access shows: "You do not have admin access"
- Redirects to monitoring.html after 2 seconds

#### Test 3: Edit User

1. Login as admin
2. Go to admin dashboard
3. Click edit button on any user
4. Change name to "Test Name"
5. Change role to "trainer"
6. Click "Save Changes"
7. Verify user updated in table

**Check console** for success message.

#### Test 4: Activity Log

1. Login as admin
2. Go to admin dashboard
3. Click "Activity" tab
4. Verify recent workouts display
5. Check user names, exercise counts, dates

---

## Verification Checklist

### Backend Components

- [ ] admin.controller.js exists with 6 functions
- [ ] admin.routes.js exists with 6 routes
- [ ] admin.js middleware exists
- [ ] routes/index.js includes admin routes
- [ ] Admin endpoints return correct responses
- [ ] Non-admin users get 403 Forbidden

### Frontend Components

- [ ] admin-dashboard.html exists and loads
- [ ] Statistics cards display data
- [ ] Users table displays users
- [ ] Activity log shows workouts
- [ ] Edit modal opens and saves
- [ ] Admin link visible only to admins

### Security & Access Control

- [ ] Admin user can access all endpoints
- [ ] Non-admin users cannot access admin endpoints
- [ ] Non-admin users cannot see admin link
- [ ] Token required for all API calls
- [ ] Invalid tokens rejected

### Integration with Existing System

- [ ] Monitoring still accessible to all users
- [ ] Member login still works
- [ ] Trainer login still works
- [ ] Member dashboard functions normally
- [ ] No CSS/UI conflicts

---

## Common Issues & Solutions

### Issue: "Admin Panel" link not showing

**Solution:**

1. Clear browser cache: Ctrl+Shift+Delete
2. Logout and login again
3. Check localStorage has user with role='admin':
   ```javascript
   console.log(JSON.parse(localStorage.getItem("user")));
   ```

### Issue: 401 Unauthorized on admin endpoints

**Solution:**

1. Verify token is valid:
   ```javascript
   console.log(localStorage.getItem("token"));
   ```
2. Token should be long string, not empty
3. Login again if needed

### Issue: 403 Forbidden when accessing admin endpoints

**Solution:**

1. Verify user has admin role:
   ```javascript
   console.log(JSON.parse(localStorage.getItem("user")).role);
   ```
2. Should show "admin", not "member" or "trainer"
3. Check database to verify user role is 'admin'

### Issue: Admin dashboard shows empty tables

**Solution:**

1. Check browser console (F12) for errors
2. Verify backend is running: http://localhost:8000
3. Check network tab for failed requests
4. Verify token is valid

### Issue: Cannot login as admin

**Solution:**

1. Verify admin user exists in database:
   ```powershell
   # From MongoDB Atlas or local MongoDB
   db.users.find({email: "admin@example.com"})
   ```
2. If not found, run: `node create_admin_user.js`
3. Verify password is exactly: `admin123456`

---

## Performance Testing

### Load Admin Dashboard

- Expected load time: < 2 seconds
- Should display all stats/users without lag
- Scrolling should be smooth

### Load User List

- 100+ users should load without freezing
- Pagination should work (if implemented)

### Edit User

- Update should complete < 1 second
- UI should update immediately

---

## Security Testing

### Test 1: SQL Injection Protection

```
Try entering: admin'; DROP TABLE users; --
Result: Should be escaped, no data loss
```

### Test 2: XSS Protection

```
Try entering: <script>alert('XSS')</script>
Result: Should be displayed as text, not executed
```

### Test 3: Token Expiration

```
1. Get token
2. Wait for expiration (or modify token)
3. Try to access admin endpoint
Result: Should get 401 Unauthorized
```

---

## Regression Testing

Ensure existing functionality still works:

### Member Workflows

- [ ] Member can login
- [ ] Member can view dashboard
- [ ] Member can start workout
- [ ] Member can track progress
- [ ] Member cannot access admin features

### Trainer Workflows

- [ ] Trainer can login
- [ ] Trainer can view members
- [ ] Trainer can send messages
- [ ] Trainer cannot access admin features

### User Workflows

- [ ] User can login
- [ ] User can view monitoring (all users can)
- [ ] User cannot access admin features

---

## Deployment Checklist

Before deploying to production:

- [ ] Admin user created with secure password
- [ ] Change admin password from default
- [ ] Test all admin endpoints
- [ ] Test with multiple users
- [ ] Verify no console errors
- [ ] Test on mobile (responsive design)
- [ ] Verify security (no exposed tokens)
- [ ] Backup database
- [ ] Document admin procedures
- [ ] Create staff documentation

---

## Quick Test Command (Bash/PowerShell)

```powershell
# Comprehensive admin system test
$baseUrl = "http://localhost:8000/api"

# 1. Login
Write-Host "1. Testing login..."
$login = @{email="admin@example.com"; password="admin123456"} | ConvertTo-Json
$auth = Invoke-RestMethod -Uri "$baseUrl/auth/login" -Method POST -ContentType "application/json" -Body $login
$token = $auth.token
Write-Host "✅ Login successful"

# 2. Get stats
Write-Host "2. Testing admin stats..."
$headers = @{"Authorization"="Bearer $token"}
$stats = Invoke-RestMethod -Uri "$baseUrl/admin/stats" -Headers $headers
Write-Host "✅ Stats retrieved: $($stats.stats.totalUsers) users, $($stats.stats.totalWorkouts) workouts"

# 3. Get users
Write-Host "3. Testing user list..."
$users = Invoke-RestMethod -Uri "$baseUrl/admin/users" -Headers $headers
Write-Host "✅ Users retrieved: $($users.count) users"

# 4. Get activity
Write-Host "4. Testing activity log..."
$activity = Invoke-RestMethod -Uri "$baseUrl/admin/activity-log" -Headers $headers
Write-Host "✅ Activity retrieved: $($activity.count) recent workouts"

Write-Host ""
Write-Host "🎉 All tests passed!"
```

---

## Support & Next Steps

### If Everything Works ✅

Congratulations! The admin system is properly configured and ready to use.

### If Issues Found ❌

1. Check error messages in console (F12)
2. Verify backend is running
3. Review logs in `backend/logs/`
4. Check MongoDB connection
5. Consult ADMIN_SYSTEM_COMPLETE.md

### Future Enhancements

- [ ] Bulk user operations
- [ ] Advanced filtering
- [ ] User creation via admin dashboard
- [ ] Export to CSV
- [ ] Two-factor authentication
- [ ] Detailed audit logs
