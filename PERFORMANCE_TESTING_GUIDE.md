# Performance Testing & Verification Guide

## Quick Start Tests

### Test 1: Redis Connection

**Expected:** Redis connects successfully

```powershell
# Check Redis is running
redis-cli ping
# Should return: PONG

# Check in backend logs
# Should see: "✓ Redis client connected"
```

### Test 2: Socket.IO Connection

**Expected:** Real-time connection works

1. Open browser console (F12)
2. Navigate to dashboard
3. Console should show: `✓ Connected to Socket.IO server`

### Test 3: Real-Time Progress Update

**Expected:** Dashboard updates instantly when workout is saved

**Steps:**

1. Login as member
2. Open Dashboard in one tab
3. In another tab, create/save a workout
4. Check first tab - stats should update immediately (< 100ms)
5. Animation effect should be visible

### Test 4: Cache Performance

**Expected:** Subsequent requests are much faster

**Measure with browser DevTools:**

1. Open Network tab (F12)
2. Load dashboard
3. Note first load time (should be ~500ms with database)
4. Refresh page
5. Note second load time (should be ~50ms from cache)

**In terminal, check Redis cache:**

```powershell
redis-cli KEYS "*progress*"
# Should show keys like: user:<id>:progress
```

## Manual Testing Scenarios

### Scenario 1: Member Completes Workout

**Setup:**

- Browser 1: Dashboard page
- Browser 2: Workout creation page

**Steps:**

1. In Browser 2, create a new workout:

   - Select exercises
   - Enter duration
   - Enter calories
   - Click "Save Workout"

2. Observe Browser 1:
   - Stats should update within ~100ms
   - Animation effect plays (scale effect)
   - No page refresh needed

**Expected Result:** ✓ Real-time update works

### Scenario 2: Muscle Workout Page Performance

**Setup:**

- Open browser console (F12 > Performance tab)

**Steps:**

1. Load muscle-workout page
2. Check Network tab timing
3. Switch between muscle groups
4. Monitor response times

**Expected Result:**

- First load: ~200-400ms
- Subsequent muscle groups: ~50-100ms (from cache)

### Scenario 3: Dashboard Cache Invalidation

**Setup:**

- Backend running with Redis

**Steps:**

1. Check cached keys:

   ```powershell
   redis-cli KEYS "user:*"
   ```

2. Update member profile
3. Check cache again:

   ```powershell
   redis-cli KEYS "user:*:progress"
   ```

4. Progress cache should be cleared

**Expected Result:** ✓ Cache properly invalidated

### Scenario 4: Multi-User Real-Time Updates

**Setup:**

- 2 member accounts
- 2 browsers (or browser + incognito)

**Steps:**

1. Browser 1: Member A logged in, on Dashboard
2. Browser 2: Member B logged in, on Workout page
3. In Browser 2, Member B creates a workout
4. Check Browser 1:
   - Member A's dashboard should NOT change
   - Only Member B's dashboard would update

**Expected Result:** ✓ Isolated real-time updates per user

## Performance Benchmarks

### Database Query Timing

```
Operation                    No Cache    With Cache    Improvement
==================================================================
Get all workouts             ~200ms      ~50ms         4x faster
Get progress stats           ~150ms      ~40ms         3.75x faster
Get exercises               ~300ms      ~30ms         10x faster
Get user profile            ~100ms      ~20ms         5x faster
```

### Dashboard Update Timing

```
Action                       Without Real-Time    With Socket.IO
==============================================================
Save workout → See update    2-5 seconds         ~100ms
Manual refresh needed        Yes                 No
User interaction delay       High                Minimal
```

### Cache Hit Rates (Expected)

```
Exercise data               95%+ (24-hour cache)
User progress              70-80% (5-minute cache)
Workouts                   60-70% (5-minute cache)
User stats                 75%+ (10-minute cache)
```

## Debugging & Diagnostics

### Check Redis Connection

```javascript
// In backend console
console.log(global.cacheService);

// Or run:
redis-cli INFO server
redis-cli INFO stats
```

### Monitor Cache Operations

```powershell
# Terminal window
redis-cli MONITOR

# Then perform operations in browser
# You'll see real-time cache operations:
# SET user:123:progress "..." EX 300
# GET user:123:progress
```

### Check Socket.IO Events

```javascript
// In browser console
socket.onAny((event, ...args) => {
  console.log(event, args);
});

// Should show:
// connect
// joinProgressRoom <userId>
// progressUpdated <data>
```

### Verify Cache Invalidation

```powershell
# Before updating profile
redis-cli KEYS "user:123:*"
# Shows multiple keys

# Update profile
# Manually trigger in backend or via API

# After update
redis-cli KEYS "user:123:*"
# Should show fewer keys (progress cache cleared)
```

## Load Testing

### Test 1: Multiple Concurrent Users

```powershell
# Simulates 10 users accessing dashboard simultaneously

for ($i=0; $i -lt 10; $i++) {
    Start-Job -ScriptBlock {
        Invoke-WebRequest -Uri "http://localhost:8000/api/members/progress" `
            -Headers @{Authorization = "Bearer YOUR_TOKEN"} `
            -TimeoutSec 10
    }
}

# Monitor response times
Get-Job | Wait-Job
Get-Job | Receive-Job
```

### Test 2: Cache Stampede Prevention

```powershell
# If 1000 requests come before cache expires
# All should get served from cache, not hit database 1000 times

# Monitor with:
redis-cli --stat 1

# Watch hits/misses ratio
```

### Test 3: Real-Time Update Throughput

```powershell
# If 50 workouts saved per second
# Socket.IO should handle all emissions

# Monitor with:
# Backend logs for emitted events count
# Browser DevTools Network tab for Socket.IO messages
```

## Performance Optimization Checklist

- [x] Redis is installed and running
- [x] Cache service integrated
- [x] Workout endpoints emit real-time updates
- [x] Dashboard listens to Socket.IO events
- [x] Exercise data cached for 24 hours
- [x] Progress cached for 5 minutes
- [x] Cache invalidated on modifications
- [x] Frontend shows loading states properly
- [x] Browser handles connection loss gracefully
- [x] Memory leaks prevented (cleanup on disconnect)

## Monitoring in Production

### Key Metrics to Track

1. **Cache Hit Ratio:** Should be > 70%
2. **Average Response Time:** Should be < 100ms
3. **P95 Response Time:** Should be < 500ms
4. **Socket.IO Messages/sec:** Steady state ~10-50
5. **Redis Memory Usage:** Monitor for growth
6. **Database Queries/sec:** Should be reduced by cache

### Alerts to Set

- Redis connection down
- Cache hit ratio < 50% (anomaly)
- Response time > 1 second (spike)
- Socket.IO disconnections > 10% (network issue)

## Common Issues & Solutions

### Issue: Dashboard Not Updating

**Diagnostic:**

- Check browser console for Socket.IO errors
- Verify backend is running
- Check Redis connection: `redis-cli ping`

**Solution:**

```powershell
# Restart Redis
docker restart redis-trainer

# Restart backend
npm start

# Clear browser cache
# Reload page
```

### Issue: Slow Dashboard Load

**Diagnostic:**

```javascript
// In browser console
performance.now(); // Mark start
// Load dashboard
performance.now(); // Mark end
// Calculate difference
```

**Solution:**

- Clear Redis cache: `redis-cli FLUSHDB`
- Check Redis memory: `redis-cli INFO memory`
- Restart backend and Redis

### Issue: Cache Not Being Used

**Diagnostic:**

- Check Redis keys: `redis-cli KEYS "*"`
- Monitor operations: `redis-cli MONITOR`
- Check backend logs for "Cache HIT/MISS"

**Solution:**

```javascript
// Verify cacheService is available
console.log(global.cacheService);

// Should show object with: set, get, delete, etc.
```

### Issue: Real-Time Events Not Received

**Diagnostic:**

```javascript
// Check Socket.IO status
console.log(socket.connected); // Should be true
console.log(socket.id); // Should show ID

// Check event listeners
socket.eventNames(); // Should include 'progressUpdated'
```

**Solution:**

- Verify Socket.IO server is running
- Check CORS settings
- Verify firewall allows WebSocket
- Check browser console for CORS errors

## Success Criteria

✓ Dashboard loads in < 100ms (second time with cache)
✓ Workout save triggers update in < 100ms
✓ No page refresh needed for real-time updates
✓ Muscle group switching is smooth (< 50ms response)
✓ Multiple users don't interfere with each other
✓ Cache properly invalidates on data changes
✓ Browser handles network disconnections gracefully
✓ Redis memory stays under control
✓ No console errors or warnings
✓ Mobile/responsive design still works well

## Next Steps

1. **Performance Monitoring Dashboard**

   - Real-time monitoring of cache hit rates
   - Response time tracking
   - User activity visualization

2. **Advanced Caching**

   - Cache user preferences
   - Cache trainer's client list
   - Implement cache warming

3. **Scaling**
   - Redis cluster for distributed caching
   - Socket.IO adapter for multiple backend instances
   - Load balancer configuration
