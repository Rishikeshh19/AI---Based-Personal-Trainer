// Navigation utility functions
// Note: This file should be loaded after storage.js if using storage utilities

function updateNavigation(token) {
    const loginItem = document.getElementById("login-item");
    const signupItem = document.getElementById("signup-item");
    const dashboardItem = document.getElementById("dashboard-item");
    const workoutItem = document.getElementById("workout-item");
    const progressItem = document.getElementById("progress-item");
    const aiSuggestionsItem = document.getElementById("ai-suggestions-item");
    const logoutItem = document.getElementById("logout-item");
    const trainerDashboardItem = document.getElementById("trainer-dashboard-item");
    const trainerSelectItem = document.getElementById("trainer-select-item");
    const messagesItem = document.getElementById("messages-item");
    const homeItem = document.getElementById("home-item");

    if (token) {
        // User is logged in - show protected pages
        if (loginItem) loginItem.style.display = "none";
        if (signupItem) signupItem.style.display = "none";
        if (homeItem) homeItem.style.display = "none"; // Hide Home when logged in
        if (dashboardItem) dashboardItem.style.display = "block";
        if (progressItem) progressItem.style.display = "block";
        if (aiSuggestionsItem) aiSuggestionsItem.style.display = "block";
        if (logoutItem) logoutItem.style.display = "block";

        // Role-based items (requires storage.js)
        let currentUser = null;
        if (typeof storage !== 'undefined' && storage.getCurrentUser) {
            currentUser = storage.getCurrentUser();
        }

        const role = currentUser && currentUser.role ? currentUser.role : null;

        if (role === 'trainer') {
            // Trainer: show trainer dashboard / clients, hide member-only options and AI suggestions
            if (trainerDashboardItem) trainerDashboardItem.style.display = "block";
            if (workoutItem) workoutItem.style.display = "none";
            if (trainerSelectItem) trainerSelectItem.style.display = "none";
            if (messagesItem) messagesItem.style.display = "none";
            if (aiSuggestionsItem) aiSuggestionsItem.style.display = "none";
        } else {
            // Member or other roles: show workout + select-trainer + messages + AI suggestions, hide trainer dashboard
            if (trainerDashboardItem) trainerDashboardItem.style.display = "none";
            if (workoutItem) workoutItem.style.display = "block";
            if (trainerSelectItem) trainerSelectItem.style.display = "block";
            if (messagesItem) messagesItem.style.display = "block";
            if (aiSuggestionsItem) aiSuggestionsItem.style.display = "block";
        }
    } else {
        // User is not logged in - show auth pages
        if (loginItem) loginItem.style.display = "block";
        if (signupItem) signupItem.style.display = "block";
        if (homeItem) homeItem.style.display = "block"; // Show Home when not logged in
        if (dashboardItem) dashboardItem.style.display = "none";
        if (workoutItem) workoutItem.style.display = "none";
        if (progressItem) progressItem.style.display = "none";
        if (aiSuggestionsItem) aiSuggestionsItem.style.display = "none";
        if (logoutItem) logoutItem.style.display = "none";
    }
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

    // Keep sidebar open - don't collapse on link clicks
    // All menu items remain visible and static
}

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initSidebarToggle);
} else {
    initSidebarToggle();
}
