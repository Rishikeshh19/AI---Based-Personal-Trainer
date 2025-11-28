// Navigation utility functions

function updateNavigation(token) {
    const loginItem = document.getElementById("login-item");
    const signupItem = document.getElementById("signup-item");
    const dashboardItem = document.getElementById("dashboard-item");
    const workoutItem = document.getElementById("workout-item");
    const progressItem = document.getElementById("progress-item");
    const logoutItem = document.getElementById("logout-item");

    if (token) {
        // User is logged in - show protected pages
        if (loginItem) loginItem.style.display = "none";
        if (signupItem) signupItem.style.display = "none";
        if (dashboardItem) dashboardItem.style.display = "block";
        if (workoutItem) workoutItem.style.display = "block";
        if (progressItem) progressItem.style.display = "block";
        if (logoutItem) logoutItem.style.display = "block";
    } else {
        // User is not logged in - show auth pages
        if (loginItem) loginItem.style.display = "block";
        if (signupItem) signupItem.style.display = "block";
        if (dashboardItem) dashboardItem.style.display = "none";
        if (workoutItem) workoutItem.style.display = "none";
        if (progressItem) progressItem.style.display = "none";
        if (logoutItem) logoutItem.style.display = "none";
    }
}

function logout() {
    localStorage.removeItem("token");
    window.location.href = "../index.html";
}
