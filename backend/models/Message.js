const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema({
    sender: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    receiver: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    message: {
        type: String,
        required: true,
        trim: true,
        maxlength: 1000
    },
    isRead: {
        type: Boolean,
        default: false
    },
    readAt: {
        type: Date,
        default: null
    }
}, {
    timestamps: true
});

// Compound index for efficient conversation queries
messageSchema.index({ sender: 1, receiver: 1, createdAt: -1 });

// Index for unread message queries
messageSchema.index({ receiver: 1, isRead: 1 });

// Method to mark message as read
messageSchema.methods.markAsRead = function () {
    this.isRead = true;
    this.readAt = new Date();
    return this.save();
};

// Static method to get conversation between two users
messageSchema.statics.getConversation = async function (user1Id, user2Id, limit = 50) {
    return this.find({
        $or: [
            { sender: user1Id, receiver: user2Id },
            { sender: user2Id, receiver: user1Id }
        ]
    })
        .sort({ createdAt: 1 })
        .limit(limit)
        .populate('sender', 'username email profile.firstName profile.lastName')
        .populate('receiver', 'username email profile.firstName profile.lastName');
};

// Static method to get all conversations for a user
messageSchema.statics.getConversations = async function (userId) {
    const messages = await this.aggregate([
        {
            $match: {
                $or: [
                    { sender: mongoose.Types.ObjectId(userId) },
                    { receiver: mongoose.Types.ObjectId(userId) }
                ]
            }
        },
        {
            $sort: { createdAt: -1 }
        },
        {
            $group: {
                _id: {
                    $cond: [
                        { $eq: ['$sender', mongoose.Types.ObjectId(userId)] },
                        '$receiver',
                        '$sender'
                    ]
                },
                lastMessage: { $first: '$$ROOT' },
                unreadCount: {
                    $sum: {
                        $cond: [
                            {
                                $and: [
                                    { $eq: ['$receiver', mongoose.Types.ObjectId(userId)] },
                                    { $eq: ['$isRead', false] }
                                ]
                            },
                            1,
                            0
                        ]
                    }
                }
            }
        }
    ]);

    // Populate user details
    await this.populate(messages, {
        path: '_id',
        select: 'username email profile.firstName profile.lastName'
    });

    return messages;
};

const Message = mongoose.model('Message', messageSchema);

module.exports = Message;
