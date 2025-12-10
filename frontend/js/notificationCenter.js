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
            if (!token) {
                console.log('⚠️ No auth token, using local notifications only');
                return this.getAll();
            }
            
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
                merged.sort((a, b) => new Date(b.timestamp || b.createdAt || 0) - new Date(a.timestamp || a.createdAt || 0));
                
                localStorage.setItem('notifications', JSON.stringify(merged));
                this.updateBadge();
                
                console.log('📡 Notifications synced from backend');
                return merged;
            } else if (response.status === 404) {
                console.log('⚠️ Notifications API not available, using local storage');
                return this.getAll();
            } else {
                console.warn('⚠️ Failed to fetch notifications, using local storage');
                return this.getAll();
            }
        } catch (error) {
            console.log('⚠️ Backend unavailable, using local notifications:', error.message);
            return this.getAll();
        }
    },
    
    // Initialize Socket.IO for real-time notifications
    initSocketIO: function() {
        try {
            const token = localStorage.getItem('token');
            const userStr = localStorage.getItem('user');
            
            if (!token || !userStr) return;
            
            const user = JSON.parse(userStr);
            const userId = user._id || user.id;
            
            if (!userId) return;
            
            // Connect to Socket.IO server
            if (typeof io !== 'undefined') {
                this.socket = io('http://localhost:8000', {
                    transports: ['websocket', 'polling'],
                    auth: { token }
                });
                
                this.socket.on('connect', () => {
                    console.log('🔌 Socket.IO connected for notifications');
                    // Join user-specific notification room
                    this.socket.emit('joinNotificationRoom', userId);
                });
                
                // Listen for real-time notifications
                this.socket.on('notification', (notification) => {
                    console.log('🔔 Real-time notification received:', notification);
                    this.addNotification(notification);
                    
                    // Show browser notification if permitted
                    this.showBrowserNotification(notification);
                });
                
                this.socket.on('disconnect', () => {
                    console.log('🔌 Socket.IO disconnected');
                });
                
                this.socket.on('error', (error) => {
                    console.error('Socket.IO error:', error);
                });
            }
        } catch (error) {
            console.error('Error initializing Socket.IO:', error);
        }
    },
    
    // Show browser notification
    showBrowserNotification: function(notification) {
        if ('Notification' in window && Notification.permission === 'granted') {
            new Notification(notification.title, {
                body: notification.message,
                icon: '/favicon.ico',
                tag: notification.id || Date.now()
            });
        }
    },
    
    // Request browser notification permission
    requestNotificationPermission: function() {
        if ('Notification' in window && Notification.permission === 'default') {
            Notification.requestPermission().then(permission => {
                console.log('Notification permission:', permission);
            });
        }
    },
    
    // Initialize notification center
    init: function() {
        console.log('🔔 Notification Center initialized');
        
        // Clean up corrupted notifications on init
        try {
            const notifications = this.getAll();
            const cleaned = notifications.filter(n => 
                n && 
                n.title && 
                n.message &&
                n.title !== 'undefined' && 
                n.message !== 'undefined' &&
                typeof n.title === 'string' &&
                typeof n.message === 'string' &&
                !n.title.includes('storage.setCurrentUser')
            );
            
            if (cleaned.length !== notifications.length) {
                console.log(`🧹 Cleaned ${notifications.length - cleaned.length} corrupted notifications`);
                localStorage.setItem('notifications', JSON.stringify(cleaned));
            }
        } catch (e) {
            console.warn('Error cleaning notifications:', e);
            localStorage.setItem('notifications', '[]');
        }
        
        this.updateBadge();
        
        // Request browser notification permission
        this.requestNotificationPermission();
        
        // Initialize Socket.IO for real-time notifications
        this.initSocketIO();
        
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
