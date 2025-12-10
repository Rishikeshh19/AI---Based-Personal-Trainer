const API_BASE = 'http://localhost:8000/api';
let authToken = localStorage.getItem('token');
let refreshInterval;
let charts = {};

// Check Auth on Load
document.addEventListener('DOMContentLoaded', () => {
    if (!authToken) {
        window.location.href = '/pages/login.html';
        return;
    }
    initDashboard();
});

async function initDashboard() {
    setupNavigation();
    loadOverview();

    // Start periodic refresh for monitoring if active
    setInterval(() => {
        if (document.getElementById('monitoring-tab').classList.contains('active')) {
            refreshMonitoring();
        }
    }, 5000);
}

function setupNavigation() {
    const navLinks = document.querySelectorAll('.nav-item');
    navLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            // Remove active class
            navLinks.forEach(n => n.classList.remove('active'));
            document.querySelectorAll('.tab-content').forEach(t => t.classList.remove('active'));

            // Add active class
            link.classList.add('active');
            const tabId = link.getAttribute('data-tab');
            document.getElementById(`${tabId}-tab`).classList.add('active');

            // Load specific content
            if (tabId === 'overview') loadOverview();
            if (tabId === 'users') loadUsers();
            if (tabId === 'monitoring') refreshMonitoring();
        });
    });

    // Mobile menu toggle
    const menuBtn = document.getElementById('menu-toggle');
    if (menuBtn) {
        menuBtn.addEventListener('click', () => {
            document.querySelector('.sidebar').classList.toggle('show');
        });
    }
}

// ==========================================
// OVERVIEW TAB
// ==========================================
async function loadOverview() {
    try {
        const response = await fetch(`${API_BASE}/admin/stats`, {
            headers: { 'Authorization': `Bearer ${authToken}` }
        });
        if (!response.ok) throw new Error('Failed to load stats');

        const data = await response.json();
        const stats = data.stats;

        document.getElementById('total-users').textContent = stats.totalUsers || 0;
        document.getElementById('total-members').textContent = stats.usersByRole.member || 0;
        document.getElementById('total-trainers').textContent = stats.usersByRole.trainer || 0;
        document.getElementById('total-workouts').textContent = stats.totalWorkouts || 0;

        // Load recent activity
        loadRecentActivity();

    } catch (error) {
        console.error('Error loading overview:', error);
    }
}

async function loadRecentActivity() {
    try {
        const response = await fetch(`${API_BASE}/admin/activity-log`, {
            headers: { 'Authorization': `Bearer ${authToken}` }
        });
        const data = await response.json();
        const tbody = document.getElementById('recent-activity-tbody');
        tbody.innerHTML = '';

        data.activity.slice(0, 5).forEach(act => {
            const row = `
                <tr>
                    <td>
                        <div class="user-info">
                            <div class="user-avatar">${act.userId?.name?.[0] || 'U'}</div>
                            <div>
                                <div class="font-medium">${act.userId?.name || 'Unknown'}</div>
                                <div class="text-xs text-muted">Completed Workout</div>
                            </div>
                        </div>
                    </td>
                    <td>${new Date(act.date).toLocaleDateString()}</td>
                    <td><span class="badge badge-success">Completed</span></td>
                </tr>
            `;
            tbody.innerHTML += row;
        });
    } catch (e) {
        console.error(e);
    }
}


// ==========================================
// USERS TAB
// ==========================================
async function loadUsers() {
    const tbody = document.getElementById('users-tbody');
    tbody.innerHTML = '<tr><td colspan="4" class="text-center">Loading...</td></tr>';

    try {
        const response = await fetch(`${API_BASE}/admin/users`, {
            headers: { 'Authorization': `Bearer ${authToken}` }
        });
        const data = await response.json();

        tbody.innerHTML = '';
        data.users.forEach(user => {
            tbody.innerHTML += `
                <tr>
                    <td>
                        <div class="user-info">
                            <div class="user-avatar secondary">${user.email?.[0]?.toUpperCase() || 'U'}</div>
                            <div>
                                <div class="font-medium">${user.email}</div>
                            </div>
                        </div>
                    </td>
                    <td><span class="badge badge-${user.role}">${user.role}</span></td>
                    <td>${new Date(user.createdAt).toLocaleDateString()}</td>
                    <td>
                        <div class="flex gap-2">
                            <button class="btn-icon" onclick="openEditModal('${user._id}', '${user.email}', '${user.role}')"><i class="fas fa-edit"></i></button>
                            ${user.role !== 'admin' ? `<button class="btn-icon danger" onclick="deleteUser('${user._id}')"><i class="fas fa-trash"></i></button>` : ''}
                        </div>
                    </td>
                </tr>
            `;
        });
    } catch (error) {
        tbody.innerHTML = '<tr><td colspan="4" class="text-center text-danger">Error loading users</td></tr>';
    }
}

async function deleteUser(id) {
    if (!confirm('Are you sure? This cannot be undone.')) return;

    try {
        const res = await fetch(`${API_BASE}/admin/users/${id}`, {
            method: 'DELETE',
            headers: { 'Authorization': `Bearer ${authToken}` }
        });
        if (res.ok) {
            showToast('User deleted', 'success');
            loadUsers();
        } else {
            showToast('Failed to delete', 'error');
        }
    } catch (e) {
        showToast('Error deleting user', 'error');
    }
}

// User Edit Modal Logic
window.openEditModal = (id, name, role) => {
    document.getElementById('edit-user-id').value = id;
    document.getElementById('edit-user-name').value = name;
    document.getElementById('edit-user-role').value = role;
    document.getElementById('editModal').classList.add('show');
};

window.closeModal = () => {
    document.getElementById('editModal').classList.remove('show');
};

window.saveUser = async () => {
    const id = document.getElementById('edit-user-id').value;
    const role = document.getElementById('edit-user-role').value;

    try {
        const res = await fetch(`${API_BASE}/admin/users/${id}`, {
            method: 'PUT',
            headers: {
                'Authorization': `Bearer ${authToken}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ role }) // Only allowing role change for now
        });

        if (res.ok) {
            showToast('User updated', 'success');
            closeModal();
            loadUsers();
        } else {
            showToast('Failed to update', 'error');
        }
    } catch (e) {
        console.error(e);
        showToast('Error updating user', 'error');
    }
};

// Add User Modal Logic
window.openAddUserModal = () => {
    document.getElementById('add-user-name').value = '';
    document.getElementById('add-user-email').value = '';
    document.getElementById('add-user-password').value = '';
    document.getElementById('add-user-role').value = 'member';
    document.getElementById('addUserModal').classList.add('show');
};

window.closeAddUserModal = () => {
    document.getElementById('addUserModal').classList.remove('show');
};

window.createNewUser = async () => {
    const name = document.getElementById('add-user-name').value.trim();
    const email = document.getElementById('add-user-email').value.trim();
    const password = document.getElementById('add-user-password').value;
    const role = document.getElementById('add-user-role').value;

    if (!name || !email || !password) {
        showToast('Please fill all fields', 'error');
        return;
    }

    try {
        const res = await fetch(`${API_BASE}/admin/users`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${authToken}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ name, email, password, role })
        });

        const data = await res.json();

        if (res.ok) {
            showToast('User created successfully', 'success');
            closeAddUserModal();
            loadUsers();
        } else {
            showToast(data.message || 'Failed to create user', 'error');
        }
    } catch (e) {
        console.error(e);
        showToast('Error creating user', 'error');
    }
};


// ==========================================
// MONITORING TAB (Prometheus/Grafana)
// ==========================================
async function refreshMonitoring() {
    try {
        // Fetch raw metrics from backend
        // Note: In docker setup, browser can't hit 'http://prometheus:9090' directly easily without port mapping.
        // We rely on backend /api/metrics endpoint which proxies or exposes metrics.

        const response = await fetch(`${API_BASE}/metrics`); // This is the backend exposing prom-client metrics
        const text = await response.text();

        // Parse basic metrics
        const reqTotal = parseMetric(text, 'http_requests_total');
        const reqDuration = parseMetric(text, 'http_request_duration_seconds_sum') / parseMetric(text, 'http_request_duration_seconds_count');
        const activeUsers = parseMetric(text, 'active_users_total');

        document.getElementById('mon-req-total').textContent = Math.floor(reqTotal);
        document.getElementById('mon-avg-latency').textContent = (reqDuration * 1000).toFixed(1) + 'ms';
        document.getElementById('mon-active-users').textContent = Math.floor(activeUsers);

        // Update Charts
        updateCharts(activeUsers, reqDuration);

    } catch (e) {
        console.error('Monitoring error:', e);
    }
}

function parseMetric(text, name) {
    const lines = text.split('\n');
    let sum = 0;
    for (let line of lines) {
        if (line.startsWith(name)) {
            const parts = line.split(' ');
            sum += parseFloat(parts[parts.length - 1]);
        }
    }
    return sum;
}

function updateCharts(users, latency) {
    const ctx = document.getElementById('liveChart');
    if (!ctx) return;

    if (!charts.live) {
        charts.live = new Chart(ctx, {
            type: 'line',
            data: {
                labels: [],
                datasets: [{
                    label: 'Active Users',
                    borderColor: '#10B981', // Emerald 500
                    data: [],
                    tension: 0.4
                }]
            },
            options: {
                responsive: true,
                plugins: { legend: { display: false } },
                scales: { x: { display: false } }
            }
        });
    }

    // Add data
    const chart = charts.live;
    const now = new Date().toLocaleTimeString();

    if (chart.data.labels.length > 20) {
        chart.data.labels.shift();
        chart.data.datasets[0].data.shift();
    }

    chart.data.labels.push(now);
    chart.data.datasets[0].data.push(users);
    chart.update();
}

function logout() {
    localStorage.removeItem('token');
    window.location.href = '/pages/login.html';
}
