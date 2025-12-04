# Member-Trainer Relationship Implementation

## Overview

Complete implementation of member-trainer relationship system allowing members to select trainers and trainers to view their assigned clients in the database.

## Database Changes

### User Model (`backend/models/User.js`)

Added two new fields:

- **trainerId**: Reference to the trainer assigned to a member
- **assignedClients**: Array of member IDs assigned to a trainer

```javascript
trainerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null
},
assignedClients: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
}]
```

## Backend API Endpoints

### Member Endpoints

#### 1. Assign Trainer

- **Route**: `PUT /api/members/assign-trainer`
- **Auth**: Required (member)
- **Body**: `{ trainerId: "trainer_id" }`
- **Response**: Updated member data with trainer reference
- **Function**: `member.controller.js` - `assignTrainer`

#### 2. Get Current Trainer

- **Route**: `GET /api/members/current-trainer`
- **Auth**: Required (member)
- **Response**: Current trainer details or null
- **Function**: `member.controller.js` - `getCurrentTrainer`

### Trainer Endpoints

#### 1. Get Assigned Clients

- **Route**: `GET /api/trainers/clients`
- **Auth**: Required (trainer)
- **Response**: Array of assigned client users
- **Function**: `trainer.controller.js` - `getAssignedClients`

#### 2. Get Client Details

- **Route**: `GET /api/trainers/clients/:clientId`
- **Auth**: Required (trainer)
- **Response**: Client details + progress stats and recent workouts
- **Function**: `trainer.controller.js` - `getClientDetails`

#### 3. Remove Client

- **Route**: `DELETE /api/trainers/clients/:clientId`
- **Auth**: Required (trainer)
- **Function**: `trainer.controller.js` - `removeClient`

#### 4. Get Trainer Profile

- **Route**: `GET /api/trainers/profile`
- **Auth**: Required (trainer)
- **Function**: `trainer.controller.js` - `getProfile`

#### 5. Update Trainer Profile

- **Route**: `PUT /api/trainers/profile`
- **Auth**: Required (trainer)
- **Function**: `trainer.controller.js` - `updateProfile`

### Auth Endpoints

#### Get All Users

- **Route**: `GET /api/auth/users`
- **Auth**: Required
- **Response**: Array of all users (for trainer selection)
- **Function**: `auth.controller.js` - `getAllUsers`

## Backend Files Created/Modified

### New Files

- `backend/controllers/trainer.controller.js` - Trainer-specific operations
- `backend/routes/trainer.routes.js` - Trainer routes

### Modified Files

- `backend/models/User.js` - Added trainerId and assignedClients fields
- `backend/controllers/member.controller.js` - Added assignTrainer and getCurrentTrainer endpoints
- `backend/routes/member.routes.js` - Added new member routes
- `backend/routes/index.js` - Added trainer routes to API
- `backend/controllers/auth.controller.js` - Added getAllUsers endpoint
- `backend/routes/auth.routes.js` - Added users endpoint route

## Frontend API Integration

### Updated `frontend/js/api.js`

Added organized API methods:

```javascript
api.member.assignTrainer(trainerId);
api.member.getCurrentTrainer();
api.trainer.getAssignedClients();
api.trainer.getClientDetails(clientId);
api.trainer.removeClient(clientId);
api.trainer.getProfile();
api.trainer.updateProfile(profileData);
```

## Frontend Pages

### Select Trainer Page (`frontend/pages/select-trainer.html`)

- **Updated**: Now fetches trainers from database via API
- **Functionality**:
  - Displays list of all trainers with their details
  - Shows current assigned trainer in banner
  - Members can select a trainer (creates bidirectional relationship)
  - Displays client count, specialization, bio
  - Button reflects selected state

### Trainer Dashboard (`frontend/pages/trainer-dashboard.html`)

- **Updated**: Now fetches assigned clients from database
- **Functionality**:
  - Shows all clients assigned to the trainer
  - Displays overview stats (total clients, workouts, calories)
  - Shows recent workouts for each client
  - Click on client to see detailed progress
  - Pulls real data from API with stats calculation

## Workflow

### Member Selecting a Trainer

1. Member goes to "Select Trainer" page
2. Fetches all trainers from `/api/auth/users` (filtered for role=trainer)
3. Member clicks "Select Trainer" button
4. Sends `PUT /api/members/assign-trainer` with trainerId
5. Backend:
   - Updates member's trainerId field
   - Adds member to trainer's assignedClients array
6. Member's current trainer is displayed in banner
7. Can change trainer anytime

### Trainer Viewing Clients

1. Trainer goes to "Trainer Dashboard"
2. Fetches all assigned clients from `/api/trainers/clients`
3. For each client, fetches detailed stats from `/api/trainers/clients/:clientId`
4. Displays client cards with:
   - Total workouts
   - Calories burned
   - Recent workout history
   - Average workout duration
5. Trainer can click on client for detailed progress view
6. Can remove client relationship if needed

## Data Flow

```
Member Select Trainer Page
        ↓
   GET /api/auth/users (get all trainers)
        ↓
   Display trainers list
        ↓
   Member clicks Select
        ↓
   PUT /api/members/assign-trainer
        ↓
Database Updated:
- User.trainerId = trainer._id
- Trainer.assignedClients += [member._id]
        ↓
   Trainer Dashboard loads
        ↓
   GET /api/trainers/clients
        ↓
   For each client: GET /api/trainers/clients/:clientId
        ↓
   Display clients with stats
```

## Benefits

✅ Persistent member-trainer relationship in database
✅ Trainers can see all assigned clients
✅ Real-time data syncing
✅ Bidirectional relationship maintenance
✅ Role-based access control
✅ Scalable architecture for multiple trainers and clients
✅ Complete audit trail via MongoDB

## Testing Flow

1. Create trainer account (role: 'trainer')
2. Create member account (role: 'member')
3. Member goes to Select Trainer → selects trainer
4. Trainer goes to Trainer Dashboard → sees member in clients list
5. Trainer clicks on member → sees their workout stats
