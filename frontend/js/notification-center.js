/**
 * Global Notification Center API
 * Use this to add notifications from anywhere in the application
 */

window.notificationCenter = window.notificationCenter || {
    /**
     * Add a message notification (from trainer/member)
     * @param {string} title - Notification title
     * @param {string} message - Notification message
     * @param {string} sender - Name of the sender
     * @param {string} [senderType] - 'trainer' or 'member' for styling
     */
    addMessage: (title, message, sender, senderType = 'trainer') => {
        const notification = {
            type: 'message',
            icon: senderType === 'trainer' ? '👨‍🏫' : '💬',
            title: title,
            message: message,
            sender: sender,
            timestamp: new Date().toISOString(),
            isRead: false
        };
        
        // Save to localStorage
        const notifications = JSON.parse(localStorage.getItem('notifications') || '[]');
        notifications.unshift(notification);
        localStorage.setItem('notifications', JSON.stringify(notifications));
        
        // Show toast notification
        showToastNotification(title, message, 'info');
        
        return notification;
    },

    /**
     * Add a progress/workout notification
     * @param {string} title - Notification title
     * @param {string} message - Notification message
     * @param {string} [details] - Additional details
     */
    addProgress: (title, message, details = '') => {
        const notification = {
            type: 'progress',
            icon: '✓',
            title: title,
            message: message,
            details: details,
            timestamp: new Date().toISOString(),
            isRead: false
        };
        
        // Save to localStorage
        const notifications = JSON.parse(localStorage.getItem('notifications') || '[]');
        notifications.unshift(notification);
        localStorage.setItem('notifications', JSON.stringify(notifications));
        
        // Show toast notification
        showToastNotification(title, message, 'success');
        
        return notification;
    },

    /**
     * Add a system notification
     * @param {string} title - Notification title
     * @param {string} message - Notification message
     * @param {string} [action] - Action taken
     */
    addSystem: (title, message, action = '') => {
        const notification = {
            type: 'system',
            icon: '⚙️',
            title: title,
            message: message,
            action: action,
            timestamp: new Date().toISOString(),
            isRead: false
        };
        
        // Save to localStorage
        const notifications = JSON.parse(localStorage.getItem('notifications') || '[]');
        notifications.unshift(notification);
        localStorage.setItem('notifications', JSON.stringify(notifications));
        
        // Show toast notification
        showToastNotification(title, message, 'info');
        
        return notification;
    },

    /**
     * Add an alert/error notification
     * @param {string} title - Notification title
     * @param {string} message - Notification message
     * @param {string} [action] - Action that caused the alert
     */
    addAlert: (title, message, action = '') => {
        const notification = {
            type: 'alert',
            icon: '⚠️',
            title: title,
            message: message,
            action: action,
            timestamp: new Date().toISOString(),
            isRead: false
        };
        
        // Save to localStorage
        const notifications = JSON.parse(localStorage.getItem('notifications') || '[]');
        notifications.unshift(notification);
        localStorage.setItem('notifications', JSON.stringify(notifications));
        
        // Show toast notification
        showToastNotification(title, message, 'error');
        
        return notification;
    },

    /**
     * Get unread notification count
     * @returns {number} Count of unread notifications
     */
    getUnreadCount: () => {
        const notifications = JSON.parse(localStorage.getItem('notifications') || '[]');
        return notifications.filter(n => !n.isRead).length;
    },

    /**
     * Get all notifications
     * @param {string} [filter] - Filter by type: 'message', 'progress', 'system', 'alert', or null for all
     * @returns {Array} Filtered notifications
     */
    getNotifications: (filter = null) => {
        const notifications = JSON.parse(localStorage.getItem('notifications') || '[]');
        if (filter) {
            return notifications.filter(n => n.type === filter);
        }
        return notifications;
    },

    /**
     * Mark notification as read
     * @param {number} index - Index of notification in array
     */
    markAsRead: (index) => {
        const notifications = JSON.parse(localStorage.getItem('notifications') || '[]');
        if (notifications[index]) {
            notifications[index].isRead = true;
            localStorage.setItem('notifications', JSON.stringify(notifications));
        }
    },

    /**
     * Clear all notifications
     */
    clearAll: () => {
        localStorage.setItem('notifications', JSON.stringify([]));
    }
};

/**
 * Show a toast notification (for immediate feedback)
 * @param {string} title - Notification title
 * @param {string} message - Notification message
 * @param {string} type - 'success', 'error', 'info', 'warning'
 */
function showToastNotification(title, message, type = 'info') {
    // Create notification container if it doesn't exist
    let container = document.getElementById('toast-notification-container');
    if (!container) {
        container = document.createElement('div');
        container.id = 'toast-notification-container';
        container.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            z-index: 10000;
            max-width: 400px;
        `;
        document.body.appendChild(container);
    }

    // Create toast element
    const toast = document.createElement('div');
    const bgColors = {
        success: '#F0FDF4',
        error: '#FEF2F2',
        info: '#EFF6FF',
        warning: '#FEF3C7'
    };
    const borderColors = {
        success: '#10B981',
        error: '#EF4444',
        info: '#3B82F6',
        warning: '#F59E0B'
    };
    const icons = {
        success: '✓',
        error: '✕',
        info: 'ℹ',
        warning: '⚠'
    };

    toast.style.cssText = `
        background: ${bgColors[type]};
        padding: 16px 24px;
        border-radius: 12px;
        margin-bottom: 12px;
        box-shadow: 0 8px 24px rgba(0, 0, 0, 0.15);
        border-left: 4px solid ${borderColors[type]};
        display: flex;
        align-items: flex-start;
        gap: 12px;
        animation: slideIn 0.3s ease-out;
    `;

    toast.innerHTML = `
        <span style="font-size: 20px; flex-shrink: 0;">${icons[type] || '•'}</span>
        <div style="flex: 1;">
            <div style="font-weight: 600; color: ${borderColors[type]}; margin-bottom: 4px; font-size: 14px;">${title}</div>
            <div style="color: #475569; font-size: 13px; line-height: 1.4;">${message}</div>
        </div>
    `;

    container.appendChild(toast);

    // Auto remove after 4 seconds
    setTimeout(() => {
        toast.style.animation = 'slideOut 0.3s ease-out forwards';
        setTimeout(() => toast.remove(), 300);
    }, 4000);
}

// Add CSS animations if not already present
if (!document.getElementById('notification-animations')) {
    const style = document.createElement('style');
    style.id = 'notification-animations';
    style.textContent = `
        @keyframes slideIn {
            from {
                transform: translateX(400px);
                opacity: 0;
            }
            to {
                transform: translateX(0);
                opacity: 1;
            }
        }

        @keyframes slideOut {
            from {
                transform: translateX(0);
                opacity: 1;
            }
            to {
                transform: translateX(400px);
                opacity: 0;
            }
        }
    `;
    document.head.appendChild(style);
}
