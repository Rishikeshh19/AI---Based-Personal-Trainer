/* =====================================================
   SOCKET.IO EVENT EMITTER UTILITIES
   Centralized real-time notification system
   ===================================================== */

const logger = require('./logger');

/**
 * Emit workout completion notification
 * @param {string} userId - User ID
 * @param {object} workoutData - Workout details
 */
const emitWorkoutCompleted = (userId, workoutData) => {
    try {
        if (!global.io) {
            logger.warn('Socket.IO not initialized');
            return;
        }

        const notification = {
            type: 'workout',
            title: '💪 Workout Completed!',
            message: `Great job! You burned ${workoutData.calories || 0} calories in ${workoutData.duration || 0} minutes.`,
            calories: workoutData.calories || 0,
            duration: workoutData.duration || 0,
            timestamp: new Date().toISOString()
        };

        // Emit to user's dashboard
        global.io.to(`dashboard:${userId}`).emit('workoutCompleted', {
            calories: workoutData.calories || 0,
            duration: workoutData.duration || 0
        });

        // Emit general notification
        global.io.to(`user:${userId}`).emit('notification', notification);

        logger.info(`Workout completion notification sent to user ${userId}`);
    } catch (error) {
        logger.error('Error emitting workout completed:', error);
    }
};

/**
 * Emit achievement unlocked notification
 * @param {string} userId - User ID
 * @param {object} achievementData - Achievement details
 */
const emitAchievement = (userId, achievementData) => {
    try {
        if (!global.io) {
            logger.warn('Socket.IO not initialized');
            return;
        }

        const notification = {
            type: 'success',
            title: '🏆 Achievement Unlocked!',
            message: achievementData.message || 'You unlocked a new achievement!',
            achievement: achievementData.name,
            timestamp: new Date().toISOString()
        };

        // Emit to dashboard
        global.io.to(`dashboard:${userId}`).emit('achievementUnlocked', {
            message: achievementData.message,
            name: achievementData.name
        });

        // Emit general notification
        global.io.to(`user:${userId}`).emit('achievement', notification);

        logger.info(`Achievement notification sent to user ${userId}`);
    } catch (error) {
        logger.error('Error emitting achievement:', error);
    }
};

/**
 * Emit streak update notification
 * @param {string} userId - User ID
 * @param {number} streak - Current streak count
 * @param {boolean} milestone - Whether this is a milestone
 */
const emitStreakUpdate = (userId, streak, milestone = false) => {
    try {
        if (!global.io) {
            logger.warn('Socket.IO not initialized');
            return;
        }

        // Emit to dashboard
        global.io.to(`dashboard:${userId}`).emit('streakUpdated', {
            streak,
            milestone
        });

        // If milestone, send notification
        if (milestone) {
            const notification = {
                type: 'warning',
                title: '🔥 Streak Milestone!',
                message: `Amazing! You've maintained a ${streak}-day workout streak!`,
                streak,
                timestamp: new Date().toISOString()
            };

            global.io.to(`user:${userId}`).emit('notification', notification);
        }

        logger.info(`Streak update sent to user ${userId}: ${streak} days`);
    } catch (error) {
        logger.error('Error emitting streak update:', error);
    }
};

/**
 * Emit workout assignment notification
 * @param {string} userId - Member user ID
 * @param {object} workoutData - Workout details
 */
const emitWorkoutAssigned = (userId, workoutData) => {
    try {
        if (!global.io) {
            logger.warn('Socket.IO not initialized');
            return;
        }

        const notification = {
            type: 'workout',
            title: '💪 New Workout Assigned',
            message: `Your trainer has assigned you a new workout: ${workoutData.name}`,
            workoutId: workoutData._id,
            workoutName: workoutData.name,
            duration: 7000,
            timestamp: new Date().toISOString()
        };

        global.io.to(`user:${userId}`).emit('workoutAssigned', notification);
        global.io.to(`user:${userId}`).emit('notification', notification);

        logger.info(`Workout assignment notification sent to user ${userId}`);
    } catch (error) {
        logger.error('Error emitting workout assignment:', error);
    }
};

/**
 * Emit new message notification
 * @param {string} recipientId - Recipient user ID
 * @param {object} messageData - Message details
 */
const emitNewMessage = (recipientId, messageData) => {
    try {
        if (!global.io) {
            logger.warn('Socket.IO not initialized');
            return;
        }

        const notification = {
            type: 'info',
            title: '💬 New Message',
            message: `${messageData.senderName}: ${messageData.message.substring(0, 50)}${messageData.message.length > 50 ? '...' : ''}`,
            senderId: messageData.senderId,
            senderName: messageData.senderName,
            timestamp: new Date().toISOString()
        };

        global.io.to(`user:${recipientId}`).emit('newMessage', notification);
        global.io.to(`user:${recipientId}`).emit('notification', notification);

        logger.info(`New message notification sent to user ${recipientId}`);
    } catch (error) {
        logger.error('Error emitting new message:', error);
    }
};

/**
 * Emit system alert
 * @param {string|null} userId - User ID (null for broadcast)
 * @param {object} alertData - Alert details
 */
const emitSystemAlert = (userId, alertData) => {
    try {
        if (!global.io) {
            logger.warn('Socket.IO not initialized');
            return;
        }

        const notification = {
            type: alertData.severity || 'warning',
            title: '⚠️ System Alert',
            message: alertData.message,
            duration: 10000,
            timestamp: new Date().toISOString()
        };

        if (userId) {
            // Send to specific user
            global.io.to(`user:${userId}`).emit('systemAlert', notification);
            global.io.to(`user:${userId}`).emit('notification', notification);
        } else {
            // Broadcast to all connected users
            global.io.emit('systemAlert', notification);
            global.io.emit('notification', notification);
        }

        logger.info(`System alert sent${userId ? ` to user ${userId}` : ' (broadcast)'}`);
    } catch (error) {
        logger.error('Error emitting system alert:', error);
    }
};

/**
 * Emit progress update
 * @param {string} userId - User ID
 * @param {object} progressData - Progress details
 */
const emitProgressUpdate = (userId, progressData) => {
    try {
        if (!global.io) {
            logger.warn('Socket.IO not initialized');
            return;
        }

        global.io.to(`progress:${userId}`).emit('progressUpdated', {
            ...progressData,
            timestamp: new Date().toISOString()
        });

        logger.info(`Progress update sent to user ${userId}`);
    } catch (error) {
        logger.error('Error emitting progress update:', error);
    }
};

/**
 * Emit diet plan update
 * @param {string} userId - User ID
 * @param {object} dietPlan - Diet plan details
 */
const emitDietPlanUpdate = (userId, dietPlan) => {
    try {
        if (!global.io) {
            logger.warn('Socket.IO not initialized');
            return;
        }

        const notification = {
            type: 'info',
            title: '🍎 Diet Plan Updated',
            message: 'Your personalized diet plan has been updated.',
            timestamp: new Date().toISOString()
        };

        global.io.to(`user:${userId}`).emit('dietPlanUpdated', dietPlan);
        global.io.to(`user:${userId}`).emit('notification', notification);

        logger.info(`Diet plan update notification sent to user ${userId}`);
    } catch (error) {
        logger.error('Error emitting diet plan update:', error);
    }
};

/**
 * Emit trainer request notification
 * @param {string} trainerId - Trainer user ID
 * @param {object} requestData - Request details
 */
const emitTrainerRequest = (trainerId, requestData) => {
    try {
        if (!global.io) {
            logger.warn('Socket.IO not initialized');
            return;
        }

        const notification = {
            type: 'info',
            title: '👥 New Client Request',
            message: `${requestData.memberName} wants you as their trainer!`,
            memberId: requestData.memberId,
            memberName: requestData.memberName,
            timestamp: new Date().toISOString()
        };

        global.io.to(`user:${trainerId}`).emit('trainerRequest', notification);
        global.io.to(`user:${trainerId}`).emit('notification', notification);

        logger.info(`Trainer request notification sent to trainer ${trainerId}`);
    } catch (error) {
        logger.error('Error emitting trainer request:', error);
    }
};

/**
 * Emit reminder notification
 * @param {string} userId - User ID
 * @param {object} reminderData - Reminder details
 */
const emitReminder = (userId, reminderData) => {
    try {
        if (!global.io) {
            logger.warn('Socket.IO not initialized');
            return;
        }

        const notification = {
            type: 'info',
            title: '🔔 Reminder',
            message: reminderData.message,
            timestamp: new Date().toISOString()
        };

        global.io.to(`user:${userId}`).emit('notification', notification);

        logger.info(`Reminder notification sent to user ${userId}`);
    } catch (error) {
        logger.error('Error emitting reminder:', error);
    }
};

module.exports = {
    emitWorkoutCompleted,
    emitAchievement,
    emitStreakUpdate,
    emitWorkoutAssigned,
    emitNewMessage,
    emitSystemAlert,
    emitProgressUpdate,
    emitDietPlanUpdate,
    emitTrainerRequest,
    emitReminder
};
