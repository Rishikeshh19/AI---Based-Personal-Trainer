// Navigation utility functions
// Note: This file should be loaded after storage.js if using storage utilities

// Defined navigation structures
const NAV_ITEMS = {
    member: [
        { id: 'dashboard-item', href: 'dashboard.html', text: 'Dashboard', icon: 'fas fa-tachometer-alt' },
        { id: 'workout-item', href: 'muscle-workout.html', text: 'Muscle Workout', icon: 'fas fa-dumbbell' },
        { id: 'trainer-select-item', href: 'select-trainer.html', text: 'Select Trainer', icon: 'fas fa-user-tie' },
        { id: 'messages-item', href: 'messages.html', text: 'Messages', icon: 'fas fa-envelope' },
        { id: 'notifications-item', href: 'notifications.html', text: 'Notifications', icon: 'fas fa-bell' },
        { id: 'ai-suggestions-item', href: 'ai-suggestions.html', text: 'AI Suggestions', icon: 'fas fa-robot' },
        { id: 'diet-plan-item', href: 'diet-plan.html', text: 'AI Diet Plan', icon: 'fas fa-apple-alt' },
        { id: 'progress-item', href: 'progress.html', text: 'View Progress', icon: 'fas fa-chart-line' },
        { id: 'profile-item', href: 'profile.html', text: 'Profile', icon: 'fas fa-user' },
    ],
    trainer: [
        { id: 'trainer-dashboard-item', href: 'trainer-dashboard.html', text: 'My Clients', icon: 'fas fa-users' },
        { id: 'client-progress-item', href: 'client-progress.html', text: 'Client Progress', icon: 'fas fa-chart-line' },
        { id: 'clients-interaction-item', href: 'clients-interaction.html', text: 'Client Interaction', icon: 'fas fa-comments' },
        { id: 'profile-item', href: 'profile.html', text: 'Profile', icon: 'fas fa-user' },
    ],
    trainer_shared: [
        { id: 'logout-item', href: '#', text: 'Logout', icon: 'fas fa-sign-out-alt', isLogout: true, className: 'nav-right logout-btn' }
    ],
    shared: [
        { id: 'logout-item', href: '#', text: 'Logout', icon: 'fas fa-sign-out-alt', isLogout: true, className: 'nav-right logout-btn' }
    ],
    auth: [
        { id: 'login-item', href: 'login.html', text: 'Login' },
        { id: 'signup-item', href: 'signup.html', text: 'Sign Up' },
        { id: 'home-item', href: '../index.html', text: 'Home' }
    ]
};

function updateNavigation(token) {
    try {
        console.log('Nav: Starting updateNavigation');
        const navList = document.querySelector('nav ul');
        if (!navList) {
            console.error('Nav: Navigation list container (nav ul) not found!');
            return;
        }

        // Clear existing nav
        navList.innerHTML = '';

        if (!token) {
            console.log('Nav: No token, rendering auth items');
            // Not logged in: Show Auth items
            NAV_ITEMS.auth.forEach(item => {
                navList.appendChild(createNavItem(item));
            });
            return;
        }

        // User is logged in
        let currentUser = null;
        if (typeof storage !== 'undefined' && storage.getCurrentUser) {
            currentUser = storage.getCurrentUser();
        } else {
            console.warn('Nav: storage utility not found or getCurrentUser missing');
        }

        // Robust role detection
        let role = currentUser && currentUser.role ? currentUser.role.toLowerCase() : null;
        console.log('Nav: Detected role:', role);

        // Fallback: If on a trainer page, force trainer view just in case
        if (window.location.href.includes('trainer-dashboard') ||
            window.location.href.includes('clients-interaction') ||
            window.location.href.includes('client-progress')) {
            role = 'trainer';
        }

        // Build the menu based on role
        let menuItems = [];

        if (role === 'trainer') {
            menuItems = [...NAV_ITEMS.trainer, ...NAV_ITEMS.trainer_shared];
        } else {
            // Default to member view for anyone else (including 'member')
            menuItems = [...NAV_ITEMS.member, ...NAV_ITEMS.shared];
        }

        // Separate left and right items
        const leftItems = menuItems.filter(item => !item.className || !item.className.includes('nav-right'));
        const rightItems = menuItems.filter(item => item.className && item.className.includes('nav-right'));

        // Render left items
        leftItems.forEach(item => {
            if (item) {
                // Create list item
                const li = document.createElement('li');
                li.id = item.id;
                
                const a = document.createElement('a');
                a.href = item.href;
                a.className = 'nav-link';
                
                // For left items, we want PLAIN text as per user request (no icons)
                a.textContent = item.text;
                
                li.appendChild(a);
                navList.appendChild(li);
            }
        });

        // Render right items in a container
        if (rightItems.length > 0) {
            const rightContainer = document.createElement('div');
            rightContainer.style.display = 'flex';
            rightContainer.style.marginLeft = 'auto';
            rightContainer.style.alignItems = 'center';
            rightContainer.style.borderLeft = '1px solid rgba(255, 255, 255, 0.2)';

            rightItems.forEach(item => {
                if (item) {
                    const li = document.createElement('li');
                    li.id = item.id;
                    li.style.display = 'inline-block';
                    
                    const a = document.createElement('a');
                    a.href = item.href;
                    a.className = 'nav-link';
                    
                    // Plain text for right items too
                    a.textContent = item.text;

                    if (item.id === 'logout-item') {
                        a.id = 'logout-link';
                        a.style.color = '#ff6b6b';
                    }

                    li.appendChild(a);
                    rightContainer.appendChild(li);
                }
            });

            navList.appendChild(rightContainer);
        }

        // Re-attach logout listener since we recreated the element
        const logoutLink = document.getElementById('logout-link');
        if (logoutLink) {
            logoutLink.addEventListener('click', function (e) {
                e.preventDefault();
                if (typeof logout === 'function') {
                    logout();
                } else if (typeof storage !== 'undefined' && storage.clearSession) {
                    storage.clearSession();
                    window.location.href = '../index.html';
                } else {
                    localStorage.removeItem("token");
                    localStorage.removeItem("current_user");
                    window.location.href = "../index.html";
                }
            });
        }
        console.log('Nav: Navigation updated successfully');

    } catch (error) {
        console.error('Nav: Critical error in updateNavigation:', error);
    }
}

function createNavItem(item) {
    const li = document.createElement('li');
    li.id = item.id;
    if (item.className) {
        li.className = item.className;
    }

    const a = document.createElement('a');
    a.href = item.href;
    a.className = 'nav-link';
    
    // Add icon if provided
    if (item.icon) {
        const icon = document.createElement('i');
        icon.className = item.icon;
        a.appendChild(icon);
        
        const text = document.createElement('span');
        text.textContent = item.text;
        a.appendChild(text);
    } else {
        a.textContent = item.text;
    }

    if (item.id === 'logout-item') {
        a.id = 'logout-link';
    }

    li.appendChild(a);
    return li;
}

function logout() {
    // Use storage utility if available, otherwise fallback
    if (typeof storage !== 'undefined' && storage.clearSession) {
        storage.clearSession();
    } else {
        localStorage.removeItem("token");
        localStorage.removeItem("current_user");
    }
    window.location.href = "../index.html";
}

function initSidebarToggle() {
    const sidebar = document.querySelector('.sidebar');
    if (!sidebar) return;

    // Get the toggle button (now inside sidebar)
    const toggle = document.querySelector('.sidebar-toggle');
    if (!toggle) return; // Button must exist in HTML

    const mediaQuery = window.matchMedia('(max-width: 768px)');

    // Show/hide toggle based on screen size
    function updateToggleVisibility() {
        if (mediaQuery.matches) {
            toggle.style.display = 'flex';
        } else {
            toggle.style.display = 'none';
            // Ensure sidebar is visible on desktop
            sidebar.classList.remove('sidebar-collapsed');
        }
    }

    // Initial check
    updateToggleVisibility();

    // Listen for screen size changes
    mediaQuery.addEventListener('change', updateToggleVisibility);

    // Toggle click handler
    toggle.addEventListener('click', function (e) {
        e.preventDefault();
        e.stopPropagation();
        sidebar.classList.toggle('sidebar-collapsed');
    });
}

function initNavigation() {
    console.log('Nav: Initializing navigation...');
    // If we're on the login or signup page, we might want different auth-nav logic
    // But updateNavigation handles !token case (showing Login/Signup links)

    let token = null;
    if (typeof storage !== 'undefined' && storage.getToken) {
        token = storage.getToken();
    } else {
        token = localStorage.getItem('token');
    }
    console.log('Nav: Token found:', !!token);

    // Update navigation based on user role
    updateNavigation(token); 

    initSidebarToggle();
}

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initNavigation);
} else {
    initNavigation();
}
