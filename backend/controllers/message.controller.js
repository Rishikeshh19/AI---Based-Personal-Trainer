const Message = require('../models/Message');
const User = require('../models/User');
const logger = require('../utils/logger');

// Send a message
exports.sendMessage = async (req, res) => {
    try {
        const { receiverId, message } = req.body;
        const senderId = req.user.id;

        // Validate input
        if (!receiverId || !message) {
            return res.status(400).json({
                success: false,
                message: 'Receiver ID and message are required'
            });
        }

        if (message.trim().length === 0) {
            return res.status(400).json({
                success: false,
                message: 'Message cannot be empty'
            });
        }

        // Get sender and receiver
        const sender = await User.findById(senderId);
        const receiver = await User.findById(receiverId);

        if (!receiver) {
            return res.status(404).json({
                success: false,
                message: 'Receiver not found'
            });
        }

        // Authorization check
        if (sender.role === 'trainer') {
            // Trainer can only message their assigned clients
            const isAssignedClient = sender.assignedClients.some(
                clientId => clientId.toString() === receiverId
            );
            if (!isAssignedClient) {
                return res.status(403).json({
                    success: false,
                    message: 'You can only message your assigned clients'
                });
            }
        } else if (sender.role === 'member') {
            // Member can only message their assigned trainer
            if (!sender.trainerId || sender.trainerId.toString() !== receiverId) {
                return res.status(403).json({
                    success: false,
                    message: 'You can only message your assigned trainer'
                });
            }
        }

        // Create message
        const newMessage = await Message.create({
            sender: senderId,
            receiver: receiverId,
            message: message.trim()
        });

        // Populate sender and receiver details
        await newMessage.populate('sender', 'username email profile.firstName profile.lastName');
        await newMessage.populate('receiver', 'username email profile.firstName profile.lastName');

        // Create notification for receiver
        try {
            const notification = {
                userId: receiverId,
                type: 'new_message',
                title: 'New Message',
                message: `${sender.profile?.firstName || sender.username} sent you a message`,
                metadata: { senderId: senderId, messageId: newMessage._id },
                read: false
            };
            await global.notificationQueue?.add(notification);
        } catch (notifError) {
            logger.error('Error creating message notification:', notifError);
        }

        logger.info(`Message sent from ${senderId} to ${receiverId}`);

        res.status(201).json({
            success: true,
            message: 'Message sent successfully',
            data: newMessage
        });
    } catch (error) {
        logger.error('Error sending message:', error);
        res.status(500).json({
            success: false,
            message: 'Error sending message',
            error: error.message
        });
    }
};

// Get conversation with a specific user
exports.getConversation = async (req, res) => {
    try {
        const { userId } = req.params;
        const currentUserId = req.user.id;

        if (!userId) {
            return res.status(400).json({
                success: false,
                message: 'User ID is required'
            });
        }

        // Get conversation
        const messages = await Message.getConversation(currentUserId, userId);

        // Mark messages as read (messages sent to current user)
        await Message.updateMany(
            {
                sender: userId,
                receiver: currentUserId,
                isRead: false
            },
            {
                isRead: true,
                readAt: new Date()
            }
        );

        res.status(200).json({
            success: true,
            count: messages.length,
            data: messages
        });
    } catch (error) {
        logger.error('Error getting conversation:', error);
        res.status(500).json({
            success: false,
            message: 'Error getting conversation',
            error: error.message
        });
    }
};

// Get all conversations for current user
exports.getConversations = async (req, res) => {
    try {
        const userId = req.user.id;

        const conversations = await Message.getConversations(userId);

        res.status(200).json({
            success: true,
            count: conversations.length,
            data: conversations
        });
    } catch (error) {
        logger.error('Error getting conversations:', error);
        res.status(500).json({
            success: false,
            message: 'Error getting conversations',
            error: error.message
        });
    }
};

// Mark message as read
exports.markAsRead = async (req, res) => {
    try {
        const { messageId } = req.params;
        const userId = req.user.id;

        const message = await Message.findById(messageId);

        if (!message) {
            return res.status(404).json({
                success: false,
                message: 'Message not found'
            });
        }

        // Only receiver can mark as read
        if (message.receiver.toString() !== userId) {
            return res.status(403).json({
                success: false,
                message: 'You can only mark your own messages as read'
            });
        }

        await message.markAsRead();

        res.status(200).json({
            success: true,
            message: 'Message marked as read',
            data: message
        });
    } catch (error) {
        logger.error('Error marking message as read:', error);
        res.status(500).json({
            success: false,
            message: 'Error marking message as read',
            error: error.message
        });
    }
};

// Get unread message count
exports.getUnreadCount = async (req, res) => {
    try {
        const userId = req.user.id;

        const count = await Message.countDocuments({
            receiver: userId,
            isRead: false
        });

        res.status(200).json({
            success: true,
            data: { unreadCount: count }
        });
    } catch (error) {
        logger.error('Error getting unread count:', error);
        res.status(500).json({
            success: false,
            message: 'Error getting unread count',
            error: error.message
        });
    }
};

// Clear conversation with a specific user
exports.clearChat = async (req, res) => {
    try {
        const { otherUserId } = req.params;
        const currentUserId = req.user.id;

        if (!otherUserId) {
            return res.status(400).json({
                success: false,
                message: 'User ID is required'
            });
        }

        // Delete all messages between the two users
        await Message.deleteMany({
            $or: [
                { sender: currentUserId, receiver: otherUserId },
                { sender: otherUserId, receiver: currentUserId }
            ]
        });

        logger.info(`Conversation cleared between ${currentUserId} and ${otherUserId}`);

        res.status(200).json({
            success: true,
            message: 'Conversation cleared successfully'
        });
    } catch (error) {
        logger.error('Error clearing conversation:', error);
        res.status(500).json({
            success: false,
            message: 'Error clearing conversation',
            error: error.message
        });
    }
};
