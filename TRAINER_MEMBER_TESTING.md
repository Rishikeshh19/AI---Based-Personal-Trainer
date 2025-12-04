# Member-Trainer Relationship Testing Guide

## Quick Setup

### Step 1: Create Test Users

**Create a Trainer Account:**

- Go to `http://localhost:5173/pages/signup.html`
- Fill form:
  - Username: `john_trainer`
  - Email: `trainer@example.com`
  - Password: `trainer123`
  - Role: Select "trainer" from dropdown (if available)
- Click Sign Up
- Complete trainer profile:
  - First Name: John
  - Last Name: Smith
  - Specialization: Strength Training
  - Bio: Expert in powerlifting and functional fitness
  - Years of Experience: 5

**Create a Member Account:**

- Go to `http://localhost:5173/pages/signup.html`
- Fill form:
  - Username: `jane_member`
  - Email: `member@example.com`
  - Password: `member123`
  - Role: Select "member" from dropdown (if available)
- Click Sign Up
- Complete member profile:
  - First Name: Jane
  - Last Name: Doe
  - Age: 28
  - Gender: Female
  - Height: 165 cm
  - Weight: 65 kg
  - Fitness Level: Intermediate
  - Goals: Muscle gain, strength

### Step 2: Test Member Selecting Trainer

**As Member (jane_member):**

1. Login with member account
2. Click "Select Trainer" in sidebar
3. Should see trainer list with:
   - John Smith (Strength Training)
   - Shows 0 clients initially
   - Displays bio and specialization
4. Click "Select Trainer" button on John Smith's card
5. Confirm selection
6. Success message: "✅ Trainer assigned successfully!"
7. Should see green banner: "Your Current Trainer: John Smith"
8. Can change trainer anytime by clicking another trainer

### Step 3: Test Trainer Dashboard

**As Trainer (john_trainer):**

1. Login with trainer account
2. Click "Trainer Dashboard" in sidebar
3. Should see updated stats:
   - Total Clients: 1 (was 0)
   - Jane Doe appears in client list
4. Click on Jane's card to see details:
   - Total Workouts: 0 (no workouts yet)
   - Calories Burned: 0
   - Last Workout: N/A
5. Jane appears with:
   - Email: member@example.com
   - Recent workouts section (empty initially)

### Step 4: Test Member Recording Workout

**As Member (jane_member):**

1. Go to "Muscle Workout" page
2. Add a sample workout:
   - Exercise: Push-ups
   - Sets: 3
   - Reps: 10
   - Duration: 15 min
   - Intensity: moderate
3. Save workout
4. Go to "View Progress" to confirm it was recorded

### Step 5: Verify Trainer Can See Workout

**As Trainer (john_trainer):**

1. Go to "Trainer Dashboard"
2. Click on Jane's client card
3. Should now show:
   - Total Workouts: 1
   - Recent workouts list shows the push-ups workout
   - Average duration calculated

### Step 6: Test Remove Client

**As Trainer:**

1. In trainer dashboard, click "Remove" on client card (if button exists)
2. Confirms relationship is removed
3. Jane no longer appears in trainer's client list

**As Member:**

1. Go to "Select Trainer"
2. Trainer shows 0 clients again
3. Jane can select another trainer

## Expected Behavior

### ✅ Working Correctly

- Trainer list loads in Select Trainer page
- Current trainer banner appears after selection
- Trainer dashboard shows assigned clients
- Client workouts visible to trainer
- Stats calculate correctly
- Bidirectional relationship maintained in DB

### ⚠️ Things to Check

- Role-based access (members can't see trainer dashboard)
- Proper error handling when trainer not found
- Database synchronization between front and backend
- JWT token validity throughout flow
- Pagination if many trainers/clients (future enhancement)

## API Testing (With Postman/curl)

### Get All Trainers

```bash
GET http://localhost:5000/api/auth/users
Header: Authorization: Bearer YOUR_TOKEN
```

### Assign Trainer to Member

```bash
PUT http://localhost:5000/api/members/assign-trainer
Header: Authorization: Bearer MEMBER_TOKEN
Body: {
  "trainerId": "TRAINER_ID_FROM_DB"
}
```

### Get Member's Current Trainer

```bash
GET http://localhost:5000/api/members/current-trainer
Header: Authorization: Bearer MEMBER_TOKEN
```

### Get Trainer's Clients

```bash
GET http://localhost:5000/api/trainers/clients
Header: Authorization: Bearer TRAINER_TOKEN
```

### Get Client Details

```bash
GET http://localhost:5000/api/trainers/clients/CLIENT_ID
Header: Authorization: Bearer TRAINER_TOKEN
```

## Troubleshooting

### Trainers not showing in list

- Check if trainers exist in database
- Verify role field is set to 'trainer'
- Check browser console for API errors
- Verify `/api/auth/users` is returning data

### Client not appearing in trainer dashboard

- Verify member's trainerId field is updated
- Check if trainer's assignedClients array includes member
- Refresh page to reload data
- Check MongoDB for relationship

### Workouts not showing for trainer

- Verify workouts are saved with correct user ID
- Check if member is actually assigned to this trainer
- Verify workout date is within last 30 days
- Check `/api/trainers/clients/:clientId` response

### "This page is for trainers only" error

- Verify user role is set to 'trainer' in database
- Check JWT token includes correct role claim
- Re-login if role was just updated

## Next Steps

- Add workout assignment feature (trainer assigns workouts to members)
- Add progress charts and analytics
- Add messaging between trainer and member
- Add certification/qualification display for trainers
- Add rating system for trainers
- Implement pagination for large client lists
