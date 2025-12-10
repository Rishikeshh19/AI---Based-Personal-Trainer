/* =====================================================
   BEAUTIFUL LOADING SCREEN
   Modern, Animated Loading Component
   ===================================================== */

class LoadingScreen {
    constructor() {
        this.overlay = null;
        this.init();
    }

    init() {
        // Create loading overlay
        this.overlay = document.createElement('div');
        this.overlay.className = 'loading-screen-overlay';
        this.overlay.innerHTML = `
            <div class="loading-screen-content">
                <div class="loading-logo">
                    <i class="fas fa-dumbbell"></i>
                </div>
                <div class="loading-spinner">
                    <div class="spinner-ring"></div>
                    <div class="spinner-ring"></div>
                    <div class="spinner-ring"></div>
                </div>
                <h2 class="loading-text">Loading...</h2>
                <p class="loading-subtext">Preparing your fitness journey</p>
                <div class="loading-progress">
                    <div class="loading-progress-bar"></div>
                </div>
            </div>
        `;

        // Add styles
        this.injectStyles();
    }

    injectStyles() {
        if (document.getElementById('loading-screen-styles')) return;

        const style = document.createElement('style');
        style.id = 'loading-screen-styles';
        style.textContent = `
            .loading-screen-overlay {
                position: fixed;
                top: 0;
                left: 0;
                right: 0;
                bottom: 0;
                background: linear-gradient(135deg, #1E40AF 0%, #1E3A8A 50%, #0369A1 100%);
                display: flex;
                align-items: center;
                justify-content: center;
                z-index: 99999;
                opacity: 1;
                transition: opacity 0.5s ease;
            }

            .loading-screen-overlay::before {
                content: '';
                position: absolute;
                top: 0;
                left: 0;
                right: 0;
                bottom: 0;
                background: url('data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 800"><defs><pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse"><path d="M 40 0 L 0 0 0 40" fill="none" stroke="rgba(255,255,255,0.05)" stroke-width="1"/></pattern></defs><rect width="1200" height="800" fill="url(%23grid)"/></svg>');
                opacity: 0.6;
                animation: floatingBackground 20s ease-in-out infinite;
            }

            .loading-screen-overlay.hidden {
                opacity: 0;
                pointer-events: none;
            }

            .loading-screen-content {
                text-align: center;
                position: relative;
                z-index: 1;
            }

            .loading-logo {
                font-size: 64px;
                color: white;
                margin-bottom: 32px;
                animation: pulse 2s ease-in-out infinite;
            }

            .loading-spinner {
                position: relative;
                width: 120px;
                height: 120px;
                margin: 0 auto 32px;
            }

            .spinner-ring {
                position: absolute;
                top: 0;
                left: 0;
                right: 0;
                bottom: 0;
                border: 4px solid transparent;
                border-top-color: rgba(255, 255, 255, 0.8);
                border-radius: 50%;
                animation: spin 1.5s cubic-bezier(0.68, -0.55, 0.265, 1.55) infinite;
            }

            .spinner-ring:nth-child(2) {
                border-top-color: rgba(6, 182, 212, 0.8);
                animation-delay: -0.5s;
                animation-duration: 2s;
            }

            .spinner-ring:nth-child(3) {
                border-top-color: rgba(255, 255, 255, 0.4);
                animation-delay: -1s;
                animation-duration: 2.5s;
            }

            .loading-text {
                color: white;
                font-size: 28px;
                font-weight: 700;
                margin: 0 0 12px 0;
                font-family: 'Poppins', sans-serif;
                animation: fadeInUp 0.6s ease-out;
            }

            .loading-subtext {
                color: rgba(255, 255, 255, 0.8);
                font-size: 16px;
                margin: 0 0 32px 0;
                font-family: 'Manrope', sans-serif;
                animation: fadeInUp 0.6s ease-out 0.2s backwards;
            }

            .loading-progress {
                width: 200px;
                height: 4px;
                background: rgba(255, 255, 255, 0.2);
                border-radius: 4px;
                margin: 0 auto;
                overflow: hidden;
                animation: fadeInUp 0.6s ease-out 0.4s backwards;
            }

            .loading-progress-bar {
                height: 100%;
                background: linear-gradient(90deg, #06B6D4, white);
                border-radius: 4px;
                animation: progressBar 2s ease-in-out infinite;
            }

            @keyframes progressBar {
                0% {
                    width: 0%;
                    opacity: 0.5;
                }
                50% {
                    width: 70%;
                    opacity: 1;
                }
                100% {
                    width: 100%;
                    opacity: 0.5;
                }
            }

            /* Minimal version for fast loading */
            .loading-screen-minimal {
                background: #1E40AF;
            }

            .loading-screen-minimal .loading-screen-content {
                transform: scale(0.8);
            }
        `;
        document.head.appendChild(style);
    }

    show(message = 'Loading...', subtext = 'Preparing your fitness journey') {
        const textElement = this.overlay.querySelector('.loading-text');
        const subtextElement = this.overlay.querySelector('.loading-subtext');
        
        if (textElement) textElement.textContent = message;
        if (subtextElement) subtextElement.textContent = subtext;

        if (!this.overlay.parentNode) {
            document.body.appendChild(this.overlay);
        }
        
        this.overlay.classList.remove('hidden');
    }

    hide() {
        this.overlay.classList.add('hidden');
        setTimeout(() => {
            if (this.overlay.parentNode) {
                this.overlay.parentNode.removeChild(this.overlay);
            }
        }, 500);
    }

    updateProgress(percent, message) {
        const progressBar = this.overlay.querySelector('.loading-progress-bar');
        const textElement = this.overlay.querySelector('.loading-text');
        
        if (progressBar) {
            progressBar.style.animation = 'none';
            progressBar.style.width = percent + '%';
        }
        
        if (message && textElement) {
            textElement.textContent = message;
        }
    }

    updateMessage(message, subtext) {
        const textElement = this.overlay.querySelector('.loading-text');
        const subtextElement = this.overlay.querySelector('.loading-subtext');
        
        if (textElement) textElement.textContent = message;
        if (subtext && subtextElement) subtextElement.textContent = subtext;
    }
}

// Initialize global loading screen
window.loadingScreen = new LoadingScreen();

// Auto-show on page load, hide when ready
window.addEventListener('load', () => {
    // Hide loading screen after page is fully loaded
    setTimeout(() => {
        if (window.loadingScreen) {
            window.loadingScreen.hide();
        }
    }, 500);
});

// Show loading screen on page navigation
window.addEventListener('beforeunload', () => {
    if (window.loadingScreen) {
        window.loadingScreen.show('Navigating...', 'Please wait');
    }
});

// Export for module usage
if (typeof module !== 'undefined' && module.exports) {
    module.exports = LoadingScreen;
}
