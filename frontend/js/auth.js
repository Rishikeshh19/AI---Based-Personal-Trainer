// This file contains JavaScript functions for handling authentication, including login and signup processes.

// Timeout for API requests (10 seconds)
const API_TIMEOUT = 10000;

// Helper function to fetch with timeout
async function fetchWithTimeout(url, options = {}) {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), API_TIMEOUT);

    try {
        const response = await fetch(url, {
            ...options,
            signal: controller.signal
        });
        clearTimeout(timeoutId);
        return response;
    } catch (error) {
        clearTimeout(timeoutId);
        if (error.name === 'AbortError') {
            throw new Error('Request timeout. Server may be slow or not responding.');
        }
        throw error;
    }
}

document.addEventListener("DOMContentLoaded", function () {
    const loginForm = document.getElementById("login-form");
    const signupForm = document.getElementById("signup-form");

    if (loginForm) {
        loginForm.addEventListener("submit", async function (event) {
            event.preventDefault();
            const email = document.getElementById("email").value;
            const password = document.getElementById("password").value;
            const submitBtn = loginForm.querySelector("button[type='submit']");

            // Disable button and show loading state
            submitBtn.disabled = true;
            submitBtn.textContent = "Logging in...";

            try {
                const response = await fetchWithTimeout("http://localhost:8000/api/auth/login", {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify({ email, password })
                });

                const data = await response.json();

                if (data.token) {
                    localStorage.setItem("token", data.token);
                    
                    // Store user data if provided
                    if (data.user) {
                        localStorage.setItem("user", JSON.stringify(data.user));
                    }
                    
                    // Redirect based on role
                    const userRole = data.user?.role || 'member';
                    
                    if (userRole === 'admin') {
                        window.location.href = "../pages/monitoring-dashboard.html";
                    } else if (userRole === 'trainer') {
                        window.location.href = "../pages/dashboard.html";
                    } else {
                        window.location.href = "../pages/dashboard.html";
                    }
                } else {
                    if (typeof showToast === 'function') {
                        showToast(data.detail || data.message || "Login failed", 'error', 5000);
                    } else {
                        alert(data.detail || data.message || "Login failed");
                    }
                }
            } catch (error) {
                console.error("Error:", error);
                if (typeof showToast === 'function') {
                    showToast(error.message || "Login failed. Backend may not be running.", 'error', 5000);
                } else {
                    alert(error.message || "Login failed. Backend may not be running.");
                }
            } finally {
                // Re-enable button
                submitBtn.disabled = false;
                submitBtn.textContent = "Login";
            }
        });
    }

    if (signupForm) {
        signupForm.addEventListener("submit", async function (event) {
            event.preventDefault();
            const username = document.getElementById("name").value;
            const email = document.getElementById("email").value;
            const password = document.getElementById("password").value;
            const role = document.getElementById("role").value;
            const submitBtn = signupForm.querySelector("button[type='submit']");

            // Disable button and show loading state
            submitBtn.disabled = true;
            submitBtn.textContent = "Creating account...";

            try {
                const response = await fetchWithTimeout("http://localhost:8000/api/auth/register", {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify({ username, email, password, role })
                });

                const data = await response.json();

                if (data.success) {
                    if (typeof showToast === 'function') {
                        showToast("Signup successful! Please log in.", 'success', 4000);
                    } else {
                        alert("Signup successful! Please log in.");
                    }
                    setTimeout(() => window.location.href = "login.html", 1500);
                } else {
                    if (typeof showToast === 'function') {
                        showToast(data.detail || data.message || "Signup failed", 'error', 5000);
                    } else {
                        alert(data.detail || data.message || "Signup failed");
                    }
                }
            } catch (error) {
                console.error("Error:", error);
                if (typeof showToast === 'function') {
                    showToast(error.message || "Signup failed. Backend may not be running.", 'error', 5000);
                } else {
                    alert(error.message || "Signup failed. Backend may not be running.");
                }
            } finally {
                // Re-enable button
                submitBtn.disabled = false;
                submitBtn.textContent = "Sign Up";
            }
        });
    }
});