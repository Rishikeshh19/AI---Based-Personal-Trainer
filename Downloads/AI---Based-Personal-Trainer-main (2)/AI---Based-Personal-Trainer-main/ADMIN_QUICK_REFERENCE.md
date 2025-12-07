# Admin System - Quick Reference

## 🚀 Quick Access

### Login Credentials

```
Email:    admin@example.com
Password: admin123456
```

### Dashboard URL

```
http://localhost:5173/pages/admin-dashboard.html
```

### Via Sidebar

1. Login as admin
2. Click "Monitoring"
3. Click "Admin Panel" (appears after login as admin)

---

## 📊 Dashboard Features

### Statistics Cards

- **Total Users** - Count of all users
- **Members** - Count of users with member role
- **Trainers** - Count of users with trainer role
- **Workouts** - Count of all workouts completed

### Users Tab (Default)

- Table of all users (max 100)
- Columns: Name, Email, Role, Joined Date, Actions
- Edit button: Change name/email/role
- Delete button: Remove user permanently

### Activity Tab

- Recent 50 workouts
- Columns: User, Exercises, Duration, Calories, Date
- Sorted newest first

---

## 🔧 API Quick Reference

### Headers Required

```
Authorization: Bearer {token}
Content-Type: application/json
```

### Get Admin Token

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
```

### Get Statistics

```
GET /api/admin/stats
```

### Get All Users

```
GET /api/admin/users
```

### Get Single User

```
GET /api/admin/users/{userId}
```

### Update User

```
PUT /api/admin/users/{userId}
Body: {
  "name": "New Name",
  "email": "new@email.com",
  "role": "trainer"
}
```

### Delete User

```
DELETE /api/admin/users/{userId}
```

### Get Activity Log

```
GET /api/admin/activity-log
```

---

## 🔐 Security Notes

⚠️ **Important**

- Admin endpoints require role = 'admin'
- Non-admins get 403 Forbidden
- Keep admin password secure
- Don't share admin credentials

✅ **What's Protected**

- All admin endpoints require authentication
- Role verified on every request
- Non-admins cannot see admin UI

---

## 📁 Files Overview

### Backend

```
admin.controller.js  → 6 functions for management
admin.routes.js      → 6 protected endpoints
admin.js             → Role verification middleware
create_admin_user.js → Script to create admin
```

### Frontend

```
admin-dashboard.html → Admin UI dashboard
monitoring.html      → Updated with admin link
```

### Documentation

```
ADMIN_SYSTEM_COMPLETE.md  → Full setup guide
ADMIN_TESTING_GUIDE.md    → Testing procedures
ADMIN_SYSTEM_READY.md     → Project summary
```

---

## ✅ Verification

### System Working?

1. Login as admin
2. Go to monitoring → admin panel
3. See statistics & users table
4. All = ✅ System working

### Backend Working?

```powershell
# Get token first (see above)
# Then run:
$headers = @{"Authorization"="Bearer $token"}
Invoke-RestMethod -Uri "http://localhost:8000/api/admin/stats" `
    -Headers $headers

# Should return stats without error
```

### Access Control Working?

```powershell
# Login as member (not admin)
# Try same request
# Should get: "Access denied. Admin role required."
```

---

## 🆘 Troubleshooting

### Admin link not visible?

```
Clear cache: Ctrl+Shift+Delete
Re-login as admin
Check console: F12 → Console tab
```

### Cannot login as admin?

```
Verify email: admin@example.com
Verify password: admin123456
Check MongoDB for admin user
```

### 403 Forbidden error?

```
Verify user role is 'admin' in database
Check token is valid
Make sure authenticated as admin user
```

### Dashboard shows empty?

```
Check console: F12 → Console tab for errors
Verify backend running: http://localhost:8000
Check network tab for failed requests
```

---

## 🎯 Common Tasks

### Edit User Role

1. Click edit button on user
2. Change "Role" dropdown
3. Click "Save Changes"
4. User role updated instantly

### Delete User

1. Click delete button on user
2. Confirm deletion
3. User removed from system
4. ⚠️ Irreversible

### Check System Stats

1. View statistics cards
2. Auto-updated on dashboard load
3. Refresh page to update

### View Recent Activity

1. Click "Activity" tab
2. See last 50 workouts
3. User, exercise count, duration, date

---

## 💡 Tips

### Faster Navigation

- Bookmark admin dashboard URL
- Keep tab open for quick access
- Monitor system regularly

### Bulk Operations

- Edit users one by one
- Consider add bulk operations in future
- Current: 1-by-1 management

### Export Data

- Not yet implemented
- Can be added if needed
- For now: manual note-taking

---

## 🚀 What's Next?

### Ready Now

- Login and explore
- Test all features
- Manage users
- Monitor activity

### Optional Enhancements

- User creation in dashboard
- Bulk operations
- CSV export
- Advanced analytics
- 2FA support

---

## 📞 Support

### For Setup

→ See: ADMIN_SYSTEM_COMPLETE.md

### For Testing

→ See: ADMIN_TESTING_GUIDE.md

### For Architecture

→ See code comments in admin controller

---

## 🎉 Summary

✅ Admin system ready
✅ Dashboard functional
✅ All endpoints working
✅ Security verified
✅ Documentation complete

**Ready to manage your users!**
