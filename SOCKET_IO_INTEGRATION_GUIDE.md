# 🔌 SOCKET.IO INTEGRATION GUIDE

## How to Use Socket.IO Events in Your Controllers

### Import the utility functions:

```javascript
const {
  emitWorkoutCompleted,
  emitAchievement,
  emitStreakUpdate,
  emitWorkoutAssigned,
  emitNewMessage,
  emitSystemAlert,
  emitProgressUpdate,
  emitDietPlanUpdate,
  emitTrainerRequest,
  emitReminder,
} = require("../utils/socketEvents");
```

## Example Integrations

### 1. **Workout Controller** (`backend/controllers/workout.controller.js`)

```javascript
// When a member completes a workout
exports.completeWorkout = async (req, res) => {
  try {
    const { workoutId } = req.params;
    const userId = req.user.id;

    const workout = await Workout.findByIdAndUpdate(
      workoutId,
      {
        status: "completed",
        completedAt: Date.now(),
      },
      { new: true }
    );

    // ✨ EMIT SOCKET.IO EVENT
    emitWorkoutCompleted(userId, {
      calories: workout.totalCalories,
      duration: workout.totalDuration,
    });

    // Check for achievements
    const totalWorkouts = await Workout.countDocuments({
      user: userId,
      status: "completed",
    });

    // Achievement milestones
    const milestones = [5, 10, 25, 50, 100];
    if (milestones.includes(totalWorkouts)) {
      // ✨ EMIT ACHIEVEMENT
      emitAchievement(userId, {
        name: `${totalWorkouts} Workouts Completed`,
        message: `🎉 Congratulations! You've completed ${totalWorkouts} workouts!`,
      });
    }

    // Check and update streak
    const streak = await calculateStreak(userId);
    const isMilestone = streak % 7 === 0; // Every week is a milestone

    // ✨ EMIT STREAK UPDATE
    emitStreakUpdate(userId, streak, isMilestone);

    res.status(200).json({
      success: true,
      data: workout,
      streak,
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};
```

### 2. **Trainer Controller** (`backend/controllers/trainer.controller.js`)

```javascript
// When trainer assigns a workout to a member
exports.assignWorkout = async (req, res) => {
  try {
    const { memberId, workoutPlan } = req.body;
    const trainerId = req.user.id;

    const workout = await Workout.create({
      user: memberId,
      trainer: trainerId,
      ...workoutPlan,
    });

    // ✨ EMIT WORKOUT ASSIGNMENT
    emitWorkoutAssigned(memberId, {
      _id: workout._id,
      name: workout.name || "New Workout",
    });

    res.status(201).json({
      success: true,
      data: workout,
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// When member selects a trainer
exports.acceptTrainerRequest = async (req, res) => {
  try {
    const { trainerId, memberId } = req.body;

    // Update member's trainer
    await User.findByIdAndUpdate(memberId, { trainer: trainerId });

    // Get member details
    const member = await User.findById(memberId).select("name");

    // ✨ EMIT TRAINER REQUEST NOTIFICATION
    emitTrainerRequest(trainerId, {
      memberId,
      memberName: member.name,
    });

    res.status(200).json({
      success: true,
      message: "Trainer request sent",
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};
```

### 3. **Message Controller** (`backend/controllers/message.controller.js`)

```javascript
// When sending a message
exports.sendMessage = async (req, res) => {
  try {
    const { recipientId, message } = req.body;
    const senderId = req.user.id;

    const newMessage = await Message.create({
      sender: senderId,
      recipient: recipientId,
      message,
    });

    // Get sender details
    const sender = await User.findById(senderId).select("name");

    // ✨ EMIT NEW MESSAGE NOTIFICATION
    emitNewMessage(recipientId, {
      senderId,
      senderName: sender.name,
      message,
    });

    res.status(201).json({
      success: true,
      data: newMessage,
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};
```

### 4. **Progress Controller** (`backend/controllers/progress.controller.js`)

```javascript
// When updating progress
exports.updateProgress = async (req, res) => {
  try {
    const userId = req.user.id;
    const { weight, measurements } = req.body;

    const progress = await Progress.create({
      user: userId,
      weight,
      measurements,
      date: Date.now(),
    });

    // ✨ EMIT PROGRESS UPDATE
    emitProgressUpdate(userId, {
      weight,
      measurements,
      date: progress.date,
    });

    res.status(200).json({
      success: true,
      data: progress,
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};
```

### 5. **Diet Plan Controller** (`backend/controllers/diet-plan.controller.js`)

```javascript
// When generating or updating diet plan
exports.generateDietPlan = async (req, res) => {
  try {
    const userId = req.user.id;
    const { preferences, goals } = req.body;

    const dietPlan = await DietPlan.create({
      user: userId,
      preferences,
      goals,
      meals: generatedMeals,
    });

    // ✨ EMIT DIET PLAN UPDATE
    emitDietPlanUpdate(userId, dietPlan);

    res.status(201).json({
      success: true,
      data: dietPlan,
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};
```

### 6. **Admin Controller** (`backend/controllers/admin.controller.js`)

```javascript
// System-wide announcement
exports.sendAnnouncement = async (req, res) => {
  try {
    const { message, severity } = req.body;

    // ✨ BROADCAST TO ALL USERS
    emitSystemAlert(null, {
      message,
      severity: severity || "info",
    });

    res.status(200).json({
      success: true,
      message: "Announcement sent to all users",
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// Send alert to specific user
exports.sendUserAlert = async (req, res) => {
  try {
    const { userId, message, severity } = req.body;

    // ✨ SEND TO SPECIFIC USER
    emitSystemAlert(userId, {
      message,
      severity: severity || "warning",
    });

    res.status(200).json({
      success: true,
      message: "Alert sent to user",
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};
```

### 7. **Reminder System** (Scheduled Job)

```javascript
// In a cron job or scheduled task
const sendWorkoutReminder = async () => {
  try {
    // Get users who haven't worked out today
    const inactiveUsers = await User.find({
      lastWorkout: { $lt: startOfToday },
    });

    inactiveUsers.forEach((user) => {
      // ✨ EMIT REMINDER
      emitReminder(user._id.toString(), {
        message: "Don't forget to complete your workout today! 💪",
      });
    });

    logger.info(`Sent reminders to ${inactiveUsers.length} users`);
  } catch (error) {
    logger.error("Error sending reminders:", error);
  }
};
```

## Quick Reference

| Function               | Use Case                 | Params                                         |
| ---------------------- | ------------------------ | ---------------------------------------------- |
| `emitWorkoutCompleted` | After workout completion | userId, { calories, duration }                 |
| `emitAchievement`      | Milestone reached        | userId, { name, message }                      |
| `emitStreakUpdate`     | Daily streak update      | userId, streak, milestone                      |
| `emitWorkoutAssigned`  | Trainer assigns workout  | userId, { \_id, name }                         |
| `emitNewMessage`       | New chat message         | recipientId, { senderId, senderName, message } |
| `emitSystemAlert`      | Admin announcement       | userId (or null), { message, severity }        |
| `emitProgressUpdate`   | Progress recorded        | userId, { weight, measurements }               |
| `emitDietPlanUpdate`   | Diet plan changed        | userId, dietPlan                               |
| `emitTrainerRequest`   | Member requests trainer  | trainerId, { memberId, memberName }            |
| `emitReminder`         | Scheduled reminder       | userId, { message }                            |

## Testing Socket.IO Events

### Using Browser Console:

```javascript
// Connect to Socket.IO
const socket = io("http://localhost:8000", {
  auth: { token: localStorage.getItem("token") },
});

// Join rooms
const userId = JSON.parse(localStorage.getItem("current_user")).id;
socket.emit("joinNotificationRoom", userId);
socket.emit("joinDashboard", userId);

// Listen for events
socket.on("notification", (data) => {
  console.log("Notification received:", data);
});

socket.on("workoutCompleted", (data) => {
  console.log("Workout completed:", data);
});

socket.on("achievement", (data) => {
  console.log("Achievement unlocked:", data);
});
```

### Using Postman or REST Client:

1. Complete a workout via API
2. Check browser console for Socket.IO events
3. Verify toast notifications appear

## Best Practices

1. **Always wrap in try-catch** - Socket.IO errors shouldn't crash the app
2. **Check if io exists** - The utility functions already do this
3. **Log events** - Use logger for debugging
4. **Keep payloads small** - Only send necessary data
5. **Use room names consistently** - Follow the patterns:
   - `user:${userId}` for general notifications
   - `dashboard:${userId}` for dashboard updates
   - `progress:${userId}` for progress updates

## Troubleshooting

### Events not received?

- Check if Socket.IO is connected: `socket.connected`
- Verify user joined the correct room
- Check browser console for errors
- Verify backend is emitting to correct room name

### Duplicate notifications?

- User might be in multiple rooms
- Check if event is emitted multiple times
- Use `socket.once()` instead of `socket.on()` for one-time events

### Performance issues?

- Limit broadcast events
- Use rooms instead of broadcasting to all users
- Debounce frequent updates
- Consider Redis adapter for multiple server instances

## Next Steps

1. ✅ Import `socketEvents.js` in your controllers
2. ✅ Add event emissions after successful operations
3. ✅ Test events in browser console
4. ✅ Verify toast notifications appear
5. ✅ Monitor logs for debugging

Your real-time notification system is now fully integrated! 🎉
