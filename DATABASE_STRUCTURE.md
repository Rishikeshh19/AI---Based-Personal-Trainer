# Member-Trainer Database Structure

## Overview

Complete member-trainer relationship is stored in MongoDB with proper references and bidirectional relationships.

---

## User Collection Structure

### Member User Document

```json
{
  "_id": ObjectId("67..."),
  "username": "jane_member",
  "email": "member@example.com",
  "password": "$2a$10$...(hashed)",
  "role": "member",
  "profile": {
    "firstName": "Jane",
    "lastName": "Doe",
    "age": 28,
    "gender": "female",
    "height": 165,
    "weight": 65,
    "fitnessLevel": "intermediate",
    "goals": ["muscle gain", "strength"],
    "bio": "Fitness enthusiast"
  },
  "trainerId": ObjectId("68..."),                    // ← REFERENCE TO TRAINER
  "assignedClients": [],                            // Empty for members
  "isEmailVerified": true,
  "lastLogin": ISODate("2025-12-03T23:57:54.000Z"),
  "status": "active",
  "createdAt": ISODate("2025-12-03T10:00:00.000Z"),
  "updatedAt": ISODate("2025-12-03T23:57:54.000Z")
}
```

### Trainer User Document

```json
{
  "_id": ObjectId("68..."),
  "username": "john_trainer",
  "email": "trainer@example.com",
  "password": "$2a$10$...(hashed)",
  "role": "trainer",
  "profile": {
    "firstName": "John",
    "lastName": "Smith",
    "specialization": "Strength Training",
    "certifications": ["NASM", "ACE"],
    "yearsOfExperience": 5,
    "hourlyRate": 50,
    "bio": "Expert in powerlifting"
  },
  "trainerId": null,                                 // Trainers don't have trainers
  "assignedClients": [
    ObjectId("67..."),                              // ← MEMBER 1
    ObjectId("69..."),                              // ← MEMBER 2
    ObjectId("70...")                               // ← MEMBER 3
  ],
  "isEmailVerified": true,
  "lastLogin": ISODate("2025-12-03T23:57:54.000Z"),
  "status": "active",
  "createdAt": ISODate("2025-12-02T10:00:00.000Z"),
  "updatedAt": ISODate("2025-12-03T23:57:54.000Z")
}
```

---

## Relationships

### One-to-Many Relationship

- **One Trainer** → **Many Members**

```
Trainer (John)
├── Member 1 (Jane)
├── Member 2 (Sarah)
└── Member 3 (Emily)
```

### Stored As

```
Trainer document:
  assignedClients: [jane_id, sarah_id, emily_id]

Member documents:
  jane.trainerId: john_id
  sarah.trainerId: john_id
  emily.trainerId: john_id
```

---

## Workout Collection Structure

### Workout Document

```json
{
  "_id": ObjectId("71..."),
  "user": ObjectId("67..."),                        // ← REFERENCE TO MEMBER
  "date": ISODate("2025-12-03T10:30:00.000Z"),
  "exercises": [
    {
      "name": "Push-ups",
      "type": "strength",
      "sets": 3,
      "reps": 10,
      "weight": 0,
      "duration": 15,
      "notes": "Good form maintained"
    },
    {
      "name": "Pull-ups",
      "type": "strength",
      "sets": 3,
      "reps": 5,
      "weight": 0,
      "duration": 10,
      "notes": "Used assistance bands"
    }
  ],
  "totalDuration": 25,                              // in minutes
  "totalCalories": 150,
  "intensity": "moderate",
  "mood": "good",
  "notes": "Great workout today!",
  "createdAt": ISODate("2025-12-03T10:30:00.000Z"),
  "updatedAt": ISODate("2025-12-03T10:30:00.000Z")
}
```

---

## Database Query Examples

### 1. Get a Member's Trainer

```javascript
const member = await User.findById(memberId).populate("trainerId");
// Result: member.trainerId contains full trainer document
```

### 2. Get All Clients of a Trainer

```javascript
const trainer = await User.findById(trainerId).populate("assignedClients");
// Result: trainer.assignedClients contains array of member documents
```

### 3. Get Member's Workouts with Trainer Info

```javascript
const member = await User.findById(memberId).populate("trainerId");
const workouts = await Workout.find({ user: memberId }).sort({ date: -1 });
// Trainer can access member workouts via this query
```

### 4. Assign Trainer to Member

```javascript
// Update member
await User.findByIdAndUpdate(memberId, { trainerId: trainerId });

// Update trainer
const trainer = await User.findById(trainerId);
trainer.assignedClients.push(memberId);
await trainer.save();
```

### 5. Get Member's Recent Workouts (Last 30 Days)

```javascript
const thirtyDaysAgo = new Date();
thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

const workouts = await Workout.find({
  user: memberId,
  date: { $gte: thirtyDaysAgo },
}).sort({ date: -1 });
```

### 6. Remove Client from Trainer

```javascript
// Update trainer
const trainer = await User.findById(trainerId);
trainer.assignedClients = trainer.assignedClients.filter(
  (id) => id.toString() !== memberId
);
await trainer.save();

// Update member
await User.findByIdAndUpdate(memberId, { trainerId: null });
```

---

## Indexes

### User Model Indexes

```javascript
// Text search index
userSchema.index({
  username: "text",
  email: "text",
  "profile.firstName": "text",
  "profile.lastName": "text",
});
```

### Workout Model Indexes

```javascript
// Efficient querying by user and date
workoutSchema.index({ user: 1, date: -1 });
workoutSchema.index({ user: 1, createdAt: -1 });
```

---

## Data Integrity

### Referential Integrity

- When deleting a trainer, all members should have trainerId set to null
- When deleting a member, should be removed from trainer's assignedClients

### Validation Rules

```javascript
// Trainer must exist and have role: 'trainer'
if (trainer.role !== "trainer") {
  throw new Error("User is not a trainer");
}

// Member can only have one trainer
member.trainerId = trainerId; // Overwrites previous trainer

// Trainer can have multiple members
trainer.assignedClients.push(memberId);
```

---

## API Response Examples

### Member Assigns Trainer

**Request**: `PUT /api/members/assign-trainer`

```json
{
  "trainerId": "68abc123def456ghi789"
}
```

**Response**:

```json
{
  "success": true,
  "message": "Trainer assigned successfully",
  "data": {
    "_id": "67...",
    "username": "jane_member",
    "email": "member@example.com",
    "role": "member",
    "trainerId": "68...",
    "profile": { ... }
  }
}
```

### Trainer Gets Assigned Clients

**Request**: `GET /api/trainers/clients`

**Response**:

```json
{
  "success": true,
  "count": 3,
  "data": [
    {
      "_id": "67...",
      "username": "jane_member",
      "email": "member@example.com",
      "profile": { "firstName": "Jane", "lastName": "Doe", ... }
    },
    {
      "_id": "69...",
      "username": "sarah_member",
      "email": "sarah@example.com",
      "profile": { "firstName": "Sarah", "lastName": "Jones", ... }
    }
  ]
}
```

### Trainer Gets Client Details

**Request**: `GET /api/trainers/clients/67...`

**Response**:

```json
{
  "success": true,
  "data": {
    "client": {
      "_id": "67...",
      "username": "jane_member",
      "email": "member@example.com",
      "profile": { ... }
    },
    "stats": {
      "totalWorkouts": 12,
      "totalCalories": 1800,
      "totalDuration": 300,
      "avgCaloriesPerWorkout": 150,
      "avgDurationPerWorkout": 25,
      "recentWorkouts": [
        {
          "_id": "71...",
          "date": "2025-12-03T10:30:00.000Z",
          "exercises": [...],
          "totalCalories": 150,
          "totalDuration": 25
        }
      ]
    }
  }
}
```

---

## Scaling Considerations

### Current Capacity

- One trainer can have unlimited members
- One member can have one trainer
- Works efficiently up to ~10,000 workouts per member

### Future Optimizations

1. **Pagination**: Add skip/limit for large client lists
2. **Caching**: Cache trainer-client relationships
3. **Archiving**: Archive old workouts (>1 year)
4. **Sharding**: If training data exceeds 100GB

### Performance Tips

1. Always populate references with specific fields needed
2. Use indexes for frequent queries
3. Denormalize frequently accessed data if needed
4. Use aggregation pipeline for complex stats

---

## Backup and Recovery

### MongoDB Backup Command

```bash
mongodump --uri "mongodb+srv://trainer:password@cluster.mongodb.net/ai_trainer" \
          --out ./backup
```

### Restore Command

```bash
mongorestore --uri "mongodb+srv://trainer:password@cluster.mongodb.net/ai_trainer" \
             ./backup/ai_trainer
```

---

## Migration Notes

### If Migrating Existing Data

1. Add new fields to existing user documents
2. Set trainerId = null for all members initially
3. Populate assignedClients array for trainers
4. No need to modify existing workouts

### Rollback Plan

1. Remove trainerId field from members
2. Remove assignedClients field from trainers
3. All existing workouts remain unchanged

---

**Last Updated**: December 3, 2025
**Status**: Production Ready
