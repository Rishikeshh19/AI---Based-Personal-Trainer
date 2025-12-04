const express = require('express');
const router = express.Router();
const {
    createWorkout,
    getWorkouts,
    getWorkout,
    updateWorkout,
    deleteWorkout,
    getWorkoutsByDateRange,
    getWorkoutStats,
    getMemberWorkouts
} = require('../controllers/workout.controller');

const { protect } = require('../middleware/auth');

// All routes require authentication
router.use(protect);

router.route('/')
    .get(getWorkouts)
    .post(createWorkout);

router.route('/stats')
    .get(getWorkoutStats);

router.route('/member/:memberId')
    .get(getMemberWorkouts);

router.route('/range/:startDate/:endDate')
    .get(getWorkoutsByDateRange);

router.route('/:id')
    .get(getWorkout)
    .put(updateWorkout)
    .delete(deleteWorkout);

module.exports = router;
