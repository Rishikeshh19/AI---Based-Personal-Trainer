# GIF Display Testing Guide

## Prerequisites

- Backend running on `http://localhost:5000`
- Frontend running on `http://localhost:5174`
- MongoDB Atlas connection active
- User account (login/signup)

## Quick Test Scenario

### Step 1: Login/Signup

1. Navigate to `http://localhost:5174/frontend/pages/login.html`
2. Sign up or login with test credentials
3. Verify you're redirected to dashboard

### Step 2: Navigate to Muscle Workout

1. Click "💪 Muscle Workout" in sidebar
2. Page loads with muscle group selection (11 options)
3. Click any muscle group (e.g., "Chest")

### Step 3: View Exercise Selection with GIFs

1. **Expected**: 4 exercises appear with cards
2. **Look for**:
   - Exercise name and description
   - Difficulty badge (beginner/intermediate/advanced)
   - Sets and reps info
   - **GIF placeholder showing "Loading GIF..."**
3. **Wait**: 2-5 seconds for GIFs to load
4. **Verify**: Animated GIFs appear in each exercise card
   - GIFs show exercise demonstrations
   - GIFs are responsive (fit in card)
   - No broken image icons ❌

### Step 4: Select Exercises

1. Click on 2-3 exercise cards to select them
2. **Verify**: ✓ checkbox appears on selected exercises
3. **Check**: "Start Workout" button becomes enabled
4. **Note**: GIFs remain visible for selected exercises

### Step 5: Start Workout

1. Click "▶️ Start Workout" button
2. **Expected**: Page redirects to workout execution
3. **Verify**: URL changes to `workout-execution.html`

### Step 6: Verify GIFs in Execution Page

1. **Look for**:
   - Workout header with muscle group name
   - "X exercises selected" subtitle
   - Progress bar
   - Stats (exercises, sets, reps)
2. **Check each exercise card**:
   - Exercise number and name
   - Difficulty badge
   - **Large GIF display (16:9 aspect ratio)**
   - Sets and reps tracking inputs
   - "✓ Complete Set" buttons

### Step 7: GIF Display Quality

1. GIFs should show clear exercise demonstrations
2. Animation should be smooth and loop continuously
3. GIFs should not pixelate or appear broken
4. Layout should be responsive:
   - Desktop: GIF takes ~600px width
   - Tablet: GIF scales to ~80% viewport width
   - Mobile: GIF full width with padding

### Step 8: Track Workout with GIFs Visible

1. For each exercise:
   - Watch the GIF demonstration
   - Enter number of reps in input field
   - Click "✓ Complete Set" button
   - **GIF stays visible** during tracking
2. Repeat for multiple sets per exercise
3. **Verify**: Progress bar updates as you complete sets

### Step 9: Finish Workout

1. Click "✅ Finish Workout" button
2. Confirm the dialog
3. **Expected**: Workout saves to database
4. **Verify**: Redirected to dashboard
5. **Check**: Newly completed workout appears in workout history

---

## Detailed GIF Verification Checklist

### Exercise Selection Page (muscle-workout.html)

- [ ] **GIF Loading**

  - [ ] Placeholder text "Loading GIF..." appears initially
  - [ ] Placeholder disappears after GIF loads
  - [ ] GIF image becomes visible
  - [ ] No broken image icons (❌)

- [ ] **GIF Display**

  - [ ] GIF is centered in card
  - [ ] GIF max-width is 300px
  - [ ] GIF maintains aspect ratio
  - [ ] GIF background is light blue (#f1f5f9)
  - [ ] GIF has rounded corners (12px)

- [ ] **GIF Quality**

  - [ ] Animation is smooth
  - [ ] Colors are vibrant and clear
  - [ ] Exercise movement is recognizable
  - [ ] GIF loops continuously

- [ ] **Multiple Exercises**
  - [ ] All 4 exercises load with GIFs
  - [ ] Each GIF is different and relevant
  - [ ] No duplicate GIFs (unless same exercise)
  - [ ] GIFs load concurrently (fast)

### Workout Execution Page (workout-execution.html)

- [ ] **GIF Container**

  - [ ] GIF container uses 16:9 aspect ratio
  - [ ] GIF container max-width is 600px
  - [ ] GIF container centered horizontally
  - [ ] GIF container has dashed border when empty
  - [ ] Border disappears when GIF loads

- [ ] **GIF Display**

  - [ ] GIF displays immediately if already cached
  - [ ] GIF is full width of container
  - [ ] GIF maintains aspect ratio
  - [ ] No distortion or stretching
  - [ ] GIF loops continuously during tracking

- [ ] **GIF Positioning**

  - [ ] GIF appears between exercise title and details
  - [ ] Details cards (sets/reps) below GIF
  - [ ] Set tracking buttons below details
  - [ ] Layout is not broken by GIF
  - [ ] Mobile layout is responsive

- [ ] **Multiple Exercises**
  - [ ] Each exercise has its own GIF
  - [ ] All GIFs load successfully
  - [ ] GIFs scroll with exercises
  - [ ] Performance is acceptable (no lag)

---

## Browser Developer Tools Inspection

### Console Checks

```javascript
// Check if GIFs are in exercise data
sessionStorage.getItem("currentWorkout");
// Look for: "gif": "https://..." in exercise objects

// Check for CORS errors
// Look in Console tab - no error messages about GIFs
```

### Network Tab Checks

1. Open DevTools (F12)
2. Go to Network tab
3. Refresh page
4. **Verify**: GIF images appear in network log
   - Filter by "image" or "gif"
   - Check response status is 200 (successful)
   - Check response size (typically 1-5MB for GIFs)
   - Check load time (should be <3 seconds)

### Elements Inspector

1. Right-click on GIF
2. Select "Inspect"
3. **Verify** HTML structure:

```html
<img
  src="https://media.giphy.com/media/..."
  alt="Exercise Name"
  class="gif-image"
  style="display: block; max-width: 100%; height: auto;"
/>
```

---

## Muscle Group Test Coverage

Test at least these muscle groups to ensure all GIFs work:

| #   | Muscle    | Exercises                                                        | Status |
| --- | --------- | ---------------------------------------------------------------- | ------ |
| 1   | Chest     | Push-ups, Bench Press, Dumbbell Flyes, Incline Bench             | [ ]    |
| 2   | Shoulders | Overhead Press, Lateral Raises, Front Raises, Face Pulls         | [ ]    |
| 3   | Biceps    | Barbell Curls, Hammer Curls, Concentration Curls, Preacher Curls | [ ]    |
| 4   | Back      | Pull-ups, Bent-Over Rows, Lat Pulldown, Deadlifts                | [ ]    |
| 5   | Core      | Planks, Russian Twists, Bicycle Crunches, Hanging Leg Raises     | [ ]    |

---

## Performance Testing

### GIF Load Times

- **First GIF**: Should appear within 2-3 seconds
- **Subsequent GIFs**: Should appear within 1-2 seconds
- **Cached GIFs**: Should appear instantly (<100ms)

### Page Load Times

- **Muscle Selection**: <1 second
- **Workout Execution**: <2 seconds
- **GIF Load**: <3 seconds per GIF

### Memory Usage

- Open DevTools → Performance tab
- Start recording
- Scroll through all exercises
- Stop recording
- Memory should remain stable (no steady increase)

---

## Troubleshooting Issues

### Issue: GIFs Show as Broken Images (❌)

**Solutions**:

1. Check browser console for CORS errors
2. Verify internet connection
3. Try different muscle group
4. Clear browser cache
5. Try different browser (Chrome/Edge/Firefox)

### Issue: GIFs Don't Load At All

**Solutions**:

1. Wait 5 seconds (GIFs may be slow to load)
2. Refresh page (F5)
3. Check NetworkTab for failed requests
4. Verify Giphy API is accessible
5. Check for browser extensions blocking images

### Issue: Layout Broken/Elements Overlapping

**Solutions**:

1. Open DevTools → Elements tab
2. Check CSS classes are applied
3. Verify GIF container has `aspect-ratio: 16/9`
4. Clear browser cache
5. Try different viewport size

### Issue: GIFs Lag or Performance Poor

**Solutions**:

1. GIFs may be large (1-5MB)
2. Try different muscle group
3. Check internet speed
4. Disable browser extensions
5. Try incognito/private mode

---

## Regression Testing

After any code changes, verify:

- [ ] Exercise cards still display
- [ ] GIFs still load on selection page
- [ ] GIFs still display on execution page
- [ ] Selection → Execution flow works
- [ ] Set tracking still works while GIFs visible
- [ ] Finish workout saves correctly
- [ ] No console errors (F12 → Console)
- [ ] Responsive design still works (mobile, tablet, desktop)

---

## Success Criteria

✅ **Test Passed If All These Are True:**

1. GIFs load on muscle-workout.html page
2. GIFs display on workout-execution.html page
3. Each exercise has a relevant GIF
4. No broken image icons (❌)
5. No CORS or network errors
6. Layout is not broken by GIFs
7. Performance is acceptable (<3 sec per page)
8. Mobile responsive layout works
9. Workout can be completed and saved
10. No console errors in DevTools

---

**Last Updated**: Today  
**Version**: 1.0  
**Status**: Ready for Testing ✅
