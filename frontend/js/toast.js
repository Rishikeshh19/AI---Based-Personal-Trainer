// Toast Notification System - Replaces all alerts and confirms
(function() {
    // Create toast container if it doesn't exist
    function createToastContainer() {
        if (document.getElementById('toast-container')) return;
        
        const container = document.createElement('div');
        container.id = 'toast-container';
        container.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            z-index: 10000;
            display: flex;
            flex-direction: column;
            gap: 10px;
            max-width: 400px;
        `;
        document.body.appendChild(container);
    }

    // Show toast message
    function showToast(message, type = 'info', duration = 4000) {
        createToastContainer();
        
        const toast = document.createElement('div');
        toast.className = `toast toast-${type}`;
        
        const icons = {
            success: '✓',
            error: '✕',
            warning: '⚠',
            info: 'ℹ',
            question: '?'
        };
        
        const colors = {
            success: '#10B981',
            error: '#EF4444',
            warning: '#F59E0B',
            info: '#3B82F6',
            question: '#8B5CF6'
        };
        
        toast.style.cssText = `
            background: white;
            color: #1F2937;
            padding: 16px 20px;
            border-radius: 12px;
            box-shadow: 0 10px 25px rgba(0, 0, 0, 0.15);
            display: flex;
            align-items: center;
            gap: 12px;
            min-width: 300px;
            border-left: 4px solid ${colors[type] || colors.info};
            animation: slideIn 0.3s ease;
            cursor: pointer;
            transition: transform 0.2s;
        `;
        
        toast.innerHTML = `
            <div style="
                width: 32px;
                height: 32px;
                border-radius: 50%;
                background: ${colors[type] || colors.info};
                color: white;
                display: flex;
                align-items: center;
                justify-content: center;
                font-size: 18px;
                font-weight: bold;
                flex-shrink: 0;
            ">${icons[type] || icons.info}</div>
            <div style="flex: 1; font-size: 14px; line-height: 1.5;">${message}</div>
            <div style="
                width: 24px;
                height: 24px;
                border-radius: 50%;
                background: #F3F4F6;
                color: #6B7280;
                display: flex;
                align-items: center;
                justify-content: center;
                font-size: 16px;
                cursor: pointer;
                flex-shrink: 0;
            " onclick="this.parentElement.remove()">×</div>
        `;
        
        // Add hover effect
        toast.addEventListener('mouseenter', () => {
            toast.style.transform = 'translateX(-5px)';
        });
        toast.addEventListener('mouseleave', () => {
            toast.style.transform = 'translateX(0)';
        });
        
        // Click to dismiss
        toast.addEventListener('click', (e) => {
            if (e.target !== toast.querySelector('[onclick]')) {
                toast.remove();
            }
        });
        
        document.getElementById('toast-container').appendChild(toast);
        
        // Auto remove after duration
        if (duration > 0) {
            setTimeout(() => {
                toast.style.animation = 'slideOut 0.3s ease';
                setTimeout(() => toast.remove(), 300);
            }, duration);
        }
        
        return toast;
    }

    // Show confirm dialog
    function showConfirm(message, onConfirm, onCancel) {
        const overlay = document.createElement('div');
        overlay.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background: rgba(0, 0, 0, 0.5);
            z-index: 10001;
            display: flex;
            align-items: center;
            justify-content: center;
            animation: fadeIn 0.2s ease;
        `;
        
        const dialog = document.createElement('div');
        dialog.style.cssText = `
            background: white;
            padding: 24px;
            border-radius: 16px;
            max-width: 400px;
            width: 90%;
            box-shadow: 0 20px 50px rgba(0, 0, 0, 0.3);
            animation: scaleIn 0.3s ease;
        `;
        
        dialog.innerHTML = `
            <div style="display: flex; align-items: center; gap: 12px; margin-bottom: 16px;">
                <div style="
                    width: 40px;
                    height: 40px;
                    border-radius: 50%;
                    background: #8B5CF6;
                    color: white;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    font-size: 20px;
                    font-weight: bold;
                ">?</div>
                <h3 style="margin: 0; font-size: 18px; color: #1F2937;">Confirm Action</h3>
            </div>
            <p style="color: #6B7280; margin: 0 0 20px 0; line-height: 1.6;">${message}</p>
            <div style="display: flex; gap: 12px; justify-content: flex-end;">
                <button id="confirm-cancel" style="
                    padding: 10px 20px;
                    border: 2px solid #E5E7EB;
                    background: white;
                    color: #6B7280;
                    border-radius: 8px;
                    cursor: pointer;
                    font-weight: 600;
                    font-size: 14px;
                    transition: all 0.2s;
                ">Cancel</button>
                <button id="confirm-ok" style="
                    padding: 10px 20px;
                    border: none;
                    background: linear-gradient(135deg, #8B5CF6 0%, #6366F1 100%);
                    color: white;
                    border-radius: 8px;
                    cursor: pointer;
                    font-weight: 600;
                    font-size: 14px;
                    transition: all 0.2s;
                ">Confirm</button>
            </div>
        `;
        
        overlay.appendChild(dialog);
        document.body.appendChild(overlay);
        
        // Add hover effects
        const cancelBtn = dialog.querySelector('#confirm-cancel');
        const okBtn = dialog.querySelector('#confirm-ok');
        
        cancelBtn.addEventListener('mouseenter', () => {
            cancelBtn.style.background = '#F3F4F6';
            cancelBtn.style.borderColor = '#D1D5DB';
        });
        cancelBtn.addEventListener('mouseleave', () => {
            cancelBtn.style.background = 'white';
            cancelBtn.style.borderColor = '#E5E7EB';
        });
        
        okBtn.addEventListener('mouseenter', () => {
            okBtn.style.transform = 'translateY(-2px)';
            okBtn.style.boxShadow = '0 4px 12px rgba(139, 92, 246, 0.4)';
        });
        okBtn.addEventListener('mouseleave', () => {
            okBtn.style.transform = 'translateY(0)';
            okBtn.style.boxShadow = 'none';
        });
        
        // Handle button clicks
        cancelBtn.addEventListener('click', () => {
            overlay.remove();
            if (onCancel) onCancel();
        });
        
        okBtn.addEventListener('click', () => {
            overlay.remove();
            if (onConfirm) onConfirm();
        });
        
        // Close on overlay click
        overlay.addEventListener('click', (e) => {
            if (e.target === overlay) {
                overlay.remove();
                if (onCancel) onCancel();
            }
        });
    }

    // Add CSS animations
    const style = document.createElement('style');
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
        @keyframes fadeIn {
            from { opacity: 0; }
            to { opacity: 1; }
        }
        @keyframes scaleIn {
            from {
                transform: scale(0.9);
                opacity: 0;
            }
            to {
                transform: scale(1);
                opacity: 1;
            }
        }
    `;
    document.head.appendChild(style);

    // Global functions
    window.showToast = showToast;
    window.showConfirm = showConfirm;
    
    // Override alert and confirm (optional, but helps catch any we miss)
    window.alert = function(message) {
        showToast(message, 'info', 5000);
    };
    
    const originalConfirm = window.confirm;
    window.confirm = function(message) {
        // For synchronous confirm calls, we'll return true and show async confirm
        // This is a limitation, but better UX than blocking alerts
        showConfirm(message, () => {}, () => {});
        return originalConfirm(message); // Fallback for critical confirms
    };
})();
