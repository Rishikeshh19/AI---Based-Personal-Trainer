// Dark Mode Manager
// Global script to manage dark mode across all pages

class DarkModeManager {
    constructor() {
        this.STORAGE_KEY = 'app_settings';
        this.init();
    }

    init() {
        // Apply saved theme on page load
        this.applySavedTheme();
        
        // Listen for settings changes in other tabs
        window.addEventListener('storage', () => {
            this.applySavedTheme();
        });
        
        // Listen for system preference changes
        if (window.matchMedia) {
            window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', () => {
                const settings = this.getSettings();
                if (settings.theme === 'auto') {
                    this.applyTheme(settings.theme);
                }
            });
        }
    }

    getSettings() {
        return JSON.parse(localStorage.getItem(this.STORAGE_KEY) || '{"theme":"light"}');
    }

    applySavedTheme() {
        const settings = this.getSettings();
        this.applyTheme(settings.theme);
    }

    applyTheme(theme) {
        if (theme === 'dark') {
            document.documentElement.classList.add('dark-mode');
        } else if (theme === 'light') {
            document.documentElement.classList.remove('dark-mode');
        } else if (theme === 'auto') {
            const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
            if (prefersDark) {
                document.documentElement.classList.add('dark-mode');
            } else {
                document.documentElement.classList.remove('dark-mode');
            }
        }
    }

    toggle() {
        const settings = this.getSettings();
        const newTheme = settings.theme === 'dark' ? 'light' : 'dark';
        settings.theme = newTheme;
        localStorage.setItem(this.STORAGE_KEY, JSON.stringify(settings));
        this.applyTheme(newTheme);
        return newTheme;
    }
}

// Initialize on DOM ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        window.darkModeManager = new DarkModeManager();
    });
} else {
    window.darkModeManager = new DarkModeManager();
}
