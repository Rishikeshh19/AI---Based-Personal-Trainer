/* =====================================================
   REAL-TIME NOTIFICATION TOAST SYSTEM
   Beautiful, Non-Intrusive, Socket.IO Powered
   ===================================================== */

class NotificationToast {
    constructor() {
        this.container = null;
        this.notifications = new Map();
        this.socket = null;
        this.init();
    }

    init() {
        // Create container if it doesn't exist
        if (!document.getElementById('toast-container')) {
            this.container = document.createElement('div');
            this.container.id = 'toast-container';
            this.container.className = 'toast-container';
            document.body.appendChild(this.container);
        } else {
            this.container = document.getElementById('toast-container');
        }

        // Add styles
        this.injectStyles();

        // Initialize Socket.IO if user is logged in
        this.initSocket();
    }

    injectStyles() {
        if (document.getElementById('toast-styles')) return;

        const style = document.createElement('style');
        style.id = 'toast-styles';
        style.textContent = `
            .toast-container {
                position: fixed;
                top: 20px;
                right: 20px;
                z-index: 10000;
                display: flex;
                flex-direction: column;
                gap: 12px;
                max-width: 400px;
                pointer-events: none;
            }

            .toast {
                background: white;
                border-radius: 12px;
                padding: 16px 20px;
                box-shadow: 0 8px 32px rgba(0, 0, 0, 0.15);
                display: flex;
                align-items: flex-start;
                gap: 12px;
                min-width: 320px;
                pointer-events: all;
                animation: toastSlideIn 0.4s cubic-bezier(0.4, 0, 0.2, 1);
                position: relative;
                overflow: hidden;
                border-left: 4px solid;
            }

            .toast.removing {
                animation: toastSlideOut 0.3s cubic-bezier(0.4, 0, 0.2, 1);
            }

            .toast::before {
                content: '';
                position: absolute;
                bottom: 0;
                left: 0;
                right: 0;
                height: 4px;
                background: linear-gradient(90deg, transparent, var(--toast-color));
                animation: toastProgress 5s linear;
            }

            .toast-icon {
                width: 24px;
                height: 24px;
                border-radius: 50%;
                display: flex;
                align-items: center;
                justify-content: center;
                font-size: 14px;
                flex-shrink: 0;
                animation: scaleIn 0.3s ease-out 0.2s backwards;
            }

            .toast-content {
                flex: 1;
                min-width: 0;
            }

            .toast-title {
                font-weight: 600;
                font-size: 14px;
                margin-bottom: 4px;
                color: #0F172A;
            }

            .toast-message {
                font-size: 13px;
                color: #475569;
                line-height: 1.5;
            }

            .toast-close {
                width: 24px;
                height: 24px;
                border-radius: 50%;
                border: none;
                background: rgba(15, 23, 42, 0.1);
                color: #475569;
                cursor: pointer;
                display: flex;
                align-items: center;
                justify-content: center;
                font-size: 14px;
                transition: all 0.2s ease;
                flex-shrink: 0;
            }

            .toast-close:hover {
                background: rgba(15, 23, 42, 0.2);
                transform: scale(1.1);
            }

            .toast-actions {
                display: flex;
                gap: 8px;
                margin-top: 12px;
            }

            .toast-action-btn {
                padding: 6px 12px;
                border-radius: 6px;
                border: none;
                font-size: 12px;
                font-weight: 600;
                cursor: pointer;
                transition: all 0.2s ease;
            }

            .toast-action-btn.primary {
                background: #1E40AF;
                color: white;
            }

            .toast-action-btn.primary:hover {
                background: #1E3A8A;
                transform: scale(1.05);
            }

            .toast-action-btn.secondary {
                background: #E0F2FE;
                color: #1E40AF;
            }

            .toast-action-btn.secondary:hover {
                background: #BAE6FD;
            }

            /* Toast Types */
            .toast.success {
                border-left-color: #10B981;
                --toast-color: #10B981;
            }

            .toast.success .toast-icon {
                background: linear-gradient(135deg, #D1FAE5, #A7F3D0);
                color: #065F46;
            }

            .toast.error {
                border-left-color: #EF4444;
                --toast-color: #EF4444;
            }

            .toast.error .toast-icon {
                background: linear-gradient(135deg, #FEE2E2, #FECACA);
                color: #991B1B;
            }

            .toast.warning {
                border-left-color: #F59E0B;
                --toast-color: #F59E0B;
            }

            .toast.warning .toast-icon {
                background: linear-gradient(135deg, #FEF3C7, #FDE68A);
                color: #92400E;
            }

            .toast.info {
                border-left-color: #06B6D4;
                --toast-color: #06B6D4;
            }

            .toast.info .toast-icon {
                background: linear-gradient(135deg, #E0F2FE, #BAE6FD);
                color: #164E63;
            }

            .toast.workout {
                border-left-color: #8B5CF6;
                --toast-color: #8B5CF6;
            }

            .toast.workout .toast-icon {
                background: linear-gradient(135deg, #EDE9FE, #DDD6FE);
                color: #5B21B6;
            }

            @keyframes toastProgress {
                from { transform: scaleX(1); }
                to { transform: scaleX(0); }
            }

            @media (max-width: 768px) {
                .toast-container {
                    top: 10px;
                    right: 10px;
                    left: 10px;
                    max-width: none;
                }

                .toast {
                    min-width: auto;
                }
            }
        `;
        document.head.appendChild(style);
    }

    initSocket() {
        try {
            const token = localStorage.getItem('token');
            if (!token) return;

            const userStr = localStorage.getItem('current_user');
            if (!userStr) return;

            const user = JSON.parse(userStr);
            
            // Initialize Socket.IO connection
            this.socket = io('http://localhost:8000', {
                auth: { token },
                transports: ['websocket', 'polling']
            });

            this.socket.on('connect', () => {
                console.log('🔔 Toast notification system connected to Socket.IO');
                this.socket.emit('joinNotificationRoom', user.id);
            });

            // Listen for various notification types
            this.socket.on('notification', (data) => {
                this.show({
                    type: data.type || 'info',
                    title: data.title || 'Notification',
                    message: data.message,
                    duration: data.duration || 5000,
                    actions: data.actions
                });
            });

            // Workout-specific notifications
            this.socket.on('workoutAssigned', (data) => {
                this.show({
                    type: 'workout',
                    title: '💪 New Workout Assigned',
                    message: `Your trainer has assigned you a new workout: ${data.workoutName}`,
                    duration: 7000,
                    actions: [
                        {
                            label: 'View Workout',
                            primary: true,
                            onClick: () => window.location.href = '/pages/workout.html'
                        }
                    ]
                });
            });

            // Achievement notifications
            this.socket.on('achievement', (data) => {
                this.show({
                    type: 'success',
                    title: '🏆 Achievement Unlocked!',
                    message: data.message,
                    duration: 8000,
                    actions: [
                        {
                            label: 'View Progress',
                            primary: true,
                            onClick: () => window.location.href = '/pages/progress.html'
                        }
                    ]
                });
                
                // Play celebration animation
                this.playConfetti();
            });

            // Message notifications
            this.socket.on('newMessage', (data) => {
                this.show({
                    type: 'info',
                    title: '💬 New Message',
                    message: `${data.senderName}: ${data.message.substring(0, 50)}${data.message.length > 50 ? '...' : ''}`,
                    duration: 6000,
                    actions: [
                        {
                            label: 'Reply',
                            primary: true,
                            onClick: () => window.location.href = '/pages/messages.html'
                        }
                    ]
                });
            });

            // System alerts
            this.socket.on('systemAlert', (data) => {
                this.show({
                    type: data.severity || 'warning',
                    title: '⚠️ System Alert',
                    message: data.message,
                    duration: 10000
                });
            });

            this.socket.on('disconnect', () => {
                console.log('🔔 Toast notification system disconnected');
            });

        } catch (error) {
            console.error('Error initializing Socket.IO for toasts:', error);
        }
    }

    show(options) {
        const {
            type = 'info',
            title = 'Notification',
            message = '',
            duration = 5000,
            actions = []
        } = options;

        const id = Date.now() + Math.random();
        
        const toast = document.createElement('div');
        toast.className = `toast ${type}`;
        toast.setAttribute('data-id', id);

        const icons = {
            success: '✓',
            error: '✕',
            warning: '!',
            info: 'ℹ',
            workout: '💪'
        };

        let actionsHTML = '';
        if (actions.length > 0) {
            actionsHTML = '<div class="toast-actions">';
            actions.forEach(action => {
                actionsHTML += `
                    <button class="toast-action-btn ${action.primary ? 'primary' : 'secondary'}" 
                            data-action="${actions.indexOf(action)}">
                        ${action.label}
                    </button>
                `;
            });
            actionsHTML += '</div>';
        }

        toast.innerHTML = `
            <div class="toast-icon">
                ${icons[type] || icons.info}
            </div>
            <div class="toast-content">
                <div class="toast-title">${title}</div>
                <div class="toast-message">${message}</div>
                ${actionsHTML}
            </div>
            <button class="toast-close" aria-label="Close">
                ×
            </button>
        `;

        // Add event listeners for actions
        actions.forEach((action, index) => {
            const btn = toast.querySelector(`[data-action="${index}"]`);
            if (btn) {
                btn.addEventListener('click', () => {
                    if (action.onClick) action.onClick();
                    this.remove(id);
                });
            }
        });

        // Add close button listener
        const closeBtn = toast.querySelector('.toast-close');
        closeBtn.addEventListener('click', () => this.remove(id));

        this.container.appendChild(toast);
        this.notifications.set(id, { toast, timeout: null });

        // Auto remove after duration
        if (duration > 0) {
            const timeout = setTimeout(() => this.remove(id), duration);
            this.notifications.get(id).timeout = timeout;
        }

        // Play sound (optional)
        this.playSound(type);

        return id;
    }

    remove(id) {
        const notification = this.notifications.get(id);
        if (!notification) return;

        const { toast, timeout } = notification;
        
        if (timeout) clearTimeout(timeout);

        toast.classList.add('removing');
        setTimeout(() => {
            if (toast.parentNode) {
                toast.parentNode.removeChild(toast);
            }
            this.notifications.delete(id);
        }, 300);
    }

    playSound(type) {
        try {
            // Create a simple beep sound using Web Audio API
            const audioContext = new (window.AudioContext || window.webkitAudioContext)();
            const oscillator = audioContext.createOscillator();
            const gainNode = audioContext.createGain();

            oscillator.connect(gainNode);
            gainNode.connect(audioContext.destination);

            // Different frequencies for different notification types
            const frequencies = {
                success: 800,
                error: 400,
                warning: 600,
                info: 700,
                workout: 900
            };

            oscillator.frequency.value = frequencies[type] || 700;
            oscillator.type = 'sine';

            gainNode.gain.setValueAtTime(0.1, audioContext.currentTime);
            gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.1);

            oscillator.start(audioContext.currentTime);
            oscillator.stop(audioContext.currentTime + 0.1);
        } catch (error) {
            // Silent fail - audio not critical
        }
    }

    playConfetti() {
        // Simple confetti effect
        if (typeof confetti !== 'undefined') {
            confetti({
                particleCount: 100,
                spread: 70,
                origin: { y: 0.6 }
            });
        }
    }

    // Public API methods
    success(message, title = 'Success', options = {}) {
        return this.show({ type: 'success', title, message, ...options });
    }

    error(message, title = 'Error', options = {}) {
        return this.show({ type: 'error', title, message, ...options });
    }

    warning(message, title = 'Warning', options = {}) {
        return this.show({ type: 'warning', title, message, ...options });
    }

    info(message, title = 'Info', options = {}) {
        return this.show({ type: 'info', title, message, ...options });
    }

    workout(message, title = 'Workout', options = {}) {
        return this.show({ type: 'workout', title, message, ...options });
    }

    clearAll() {
        this.notifications.forEach((_, id) => this.remove(id));
    }
}

// Initialize global instance
window.toast = new NotificationToast();

// Export for module usage
if (typeof module !== 'undefined' && module.exports) {
    module.exports = NotificationToast;
}
