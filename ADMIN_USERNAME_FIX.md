# Admin Dashboard Username Display Fix

## Issue

The Recent Activity section in the admin dashboard was displaying "Unknown" instead of actual usernames.

## Root Cause

The `getActivityLog` controller in `backend/controllers/admin.controller.js` was:

1. Populating workout.user but only selecting limited fields ('name email role')
2. The User model doesn't have a `name` field - it uses `profile.firstName` and `profile.lastName`
3. When the populated user was null, it showed "Unknown" as a fallback

## Solution Applied

### Backend Fix (admin.controller.js)

Updated the `getActivityLog` function to:

1. **Populate proper fields**:

   ```javascript
   .populate({
       path: 'user',
       select: 'username email role profile.firstName profile.lastName'
   })
   ```

2. **Filter out null users**:

   ```javascript
   .filter(workout => workout.user) // Only include workouts with valid user references
   ```

3. **Construct display names properly**:
   ```javascript
   const displayName =
     user.profile?.firstName && user.profile?.lastName
       ? `${user.profile.firstName} ${user.profile.lastName}`
       : user.username || user.email?.split("@")[0] || "User";
   ```

### Name Construction Logic

The fix uses a cascading fallback strategy:

1. **Primary**: `firstName + lastName` (e.g., "John Doe")
2. **Secondary**: `username` (e.g., "jonsnow")
3. **Tertiary**: First part of email (e.g., "user" from "user@example.com")
4. **Last Resort**: "User"

This matches the same logic used in `getAllUsers` for consistency.

### What Changed

**Before**:

- Populated: `'name email role'` (but 'name' doesn't exist in User model)
- Fallback: `{ name: 'Unknown', email: 'N/A', role: 'user' }`
- Result: Always showed "Unknown" when user was null

**After**:

- Populated: `'username email role profile.firstName profile.lastName'`
- Filters: Removes workouts with null users completely
- Constructs: Proper display name from available fields
- Result: Shows actual user names (first + last name, or username)

## Testing

After restarting the backend server, the admin dashboard will now display:

- Full names for users who have filled their profile (firstName + lastName)
- Usernames for users who haven't completed their profile
- Email prefixes as a last resort

## Files Modified

- `backend/controllers/admin.controller.js` - Lines 218-246

## Impact

- ✅ No more "Unknown" usernames in Recent Activity
- ✅ Consistent name display across all admin panels
- ✅ Better user experience for admins
- ✅ Automatically filters out orphaned workout records (where user was deleted)
