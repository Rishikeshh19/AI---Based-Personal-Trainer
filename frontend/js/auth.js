// This file contains JavaScript functions for handling authentication, including login and signup processes.

document.addEventListener("DOMContentLoaded", function() {
    const loginForm = document.getElementById("login-form");
    const signupForm = document.getElementById("signup-form");

    if (loginForm) {
        loginForm.addEventListener("submit", function(event) {
            event.preventDefault();
            const email = document.getElementById("email").value;
            const password = document.getElementById("password").value;

            fetch("http://localhost:8000/api/auth/login", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({ email, password })
            })
            .then(response => response.json())
            .then(data => {
                if (data.token) {
                    localStorage.setItem("token", data.token);
                    window.location.href = "../pages/dashboard.html";
                } else {
                    alert(data.message || "Login failed");
                }
            })
            .catch(error => {
                console.error("Error:", error);
                alert("Login failed. Backend may not be running.");
            });
        });
    }

    if (signupForm) {
        signupForm.addEventListener("submit", function(event) {
            event.preventDefault();
            const name = document.getElementById("name").value;
            const email = document.getElementById("email").value;
            const password = document.getElementById("password").value;
            const role = document.getElementById("role").value;

            fetch("http://localhost:8000/api/auth/signup", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({ name, email, password, role })
            })
            .then(response => response.json())
            .then(data => {
                if (data.success) {
                    alert("Signup successful! Please log in.");
                    window.location.href = "login.html";
                } else {
                    alert(data.message || "Signup failed");
                }
            })
            .catch(error => {
                console.error("Error:", error);
                alert("Signup failed. Backend may not be running.");
            });
        });
    }
});