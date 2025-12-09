// Global Notification Center for handling all notifications
const notificationCenter = {
    // Add a notification to local storage and try to sync with backend
    addNotification: function(notification) {
        try {
            // Get existing notifications
            const notifications = JSON.parse(localStorage.getItem('notifications') || '[]');
            
            // Create new notification with required fields
            const newNotif = {
                id: Date.now(),
                timestamp: new Date().toISOString(),
                isRead: false,
                read: false,
                ...notification
            };
            
            // Add to beginning of array (newest first)
            notifications.unshift(newNotif);
            
            // Save to localStorage
            localStorage.setItem('notifications', JSON.stringify(notifications));
            
            // Try to save to backend
            this.syncToBackend(newNotif);
            
            // Update notification badge if it exists
            this.updateBadge();
            
            console.log('✅ Notification added:', newNotif);
            
            return newNotif;
        } catch (error) {
            console.error('Error adding notification:', error);
        }
    },
    
    // Sync notification to backend
    syncToBackend: async function(notification) {
        try {
            const token = localStorage.getItem('token');
            if (!token) return;
            
            const response = await fetch('http://localhost:8000/api/notifications', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(notification)
            });
            
            if (response.ok) {
                console.log('📡 Notification synced to backend');
            }
        } catch (error) {
            console.log('⚠️ Notification saved locally, will sync when online');
        }
    },
    
    // Get all notifications
    getAll: function() {
        try {
            return JSON.parse(localStorage.getItem('notifications') || '[]');
        } catch (error) {
            console.error('Error getting notifications:', error);
            return [];
        }
    },
    
    // Get unread count
    getUnreadCount: function() {
        try {
            const notifications = this.getAll();
            return notifications.filter(n => !n.isRead && !n.read).length;
        } catch (error) {
            return 0;
        }
    },
    
    // Mark notification as read
    markAsRead: function(notificationId) {
        try {
            const notifications = this.getAll();
            const notification = notifications.find(n => n.id === notificationId);
            if (notification) {
                notification.isRead = true;
                notification.read = true;
                localStorage.setItem('notifications', JSON.stringify(notifications));
                this.updateBadge();
            }
        } catch (error) {
            console.error('Error marking notification as read:', error);
        }
    },
    
    // Mark all as read
    markAllAsRead: function() {
        try {
            const notifications = this.getAll();
            notifications.forEach(n => {
                n.isRead = true;
                n.read = true;
            });
            localStorage.setItem('notifications', JSON.stringify(notifications));
            this.updateBadge();
        } catch (error) {
            console.error('Error marking all as read:', error);
        }
    },
    
    // Clear all notifications
    clearAll: function() {
        try {
            localStorage.setItem('notifications', '[]');
            this.updateBadge();
        } catch (error) {
            console.error('Error clearing notifications:', error);
        }
    },
    
    // Update notification badge in UI
    updateBadge: function() {
        try {
            const count = this.getUnreadCount();
            const badges = document.querySelectorAll('.notification-badge, .badge');
            
            badges.forEach(badge => {
                if (count > 0) {
                    badge.textContent = count > 99 ? '99+' : count;
                    badge.style.display = 'block';
                } else {
                    badge.style.display = 'none';
                }
            });
        } catch (error) {
            console.error('Error updating badge:', error);
        }
    },
    
    // Fetch notifications from backend
    fetchFromBackend: async function() {
        try {
            const token = localStorage.getItem('token');
            if (!token) return;
            
            const response = await fetch('http://localhost:8000/api/notifications', {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            
            if (response.ok) {
                const data = await response.json();
                const backendNotifications = data.notifications || [];
                
                // Merge with local notifications (keep local ones that aren't in backend yet)
                const localNotifications = this.getAll();
                const merged = [...backendNotifications];
                
                // Add local notifications that aren't in backend
                localNotifications.forEach(local => {
                    if (!backendNotifications.some(b => b.id === local.id)) {
                        merged.push(local);
                    }
                });
                
                // Sort by timestamp (newest first)
                merged.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
                
                localStorage.setItem('notifications', JSON.stringify(merged));
                this.updateBadge();
                
                console.log('📡 Notifications synced from backend');
                return merged;
            }
        } catch (error) {
            console.error('Error fetching notifications from backend:', error);
        }
    },
    
    // Initialize notification center
    init: function() {
        console.log('🔔 Notification Center initialized');
        this.updateBadge();
        
        // Fetch from backend periodically (every 30 seconds)
        setInterval(() => {
            this.fetchFromBackend();
        }, 30000);
        
        // Fetch once on init
        this.fetchFromBackend();
    }
};

// Make it globally available
window.notificationCenter = notificationCenter;

// Initialize when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        notificationCenter.init();
    });
} else {
    notificationCenter.init();
}
