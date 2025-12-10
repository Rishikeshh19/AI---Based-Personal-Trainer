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
            const displayName = user.name || 'User';
            const initial = displayName[0]?.toUpperCase() || 'U';
            tbody.innerHTML += `
                <tr>
                    <td>
                        <div class="user-info">
                            <div class="user-avatar secondary">${initial}</div>
                            <div>
                                <div class="font-medium">${displayName}</div>
                                <div class="text-xs text-muted">${user.email}</div>
                            </div>
                        </div>
                    </td>
                    <td><span class="badge badge-${user.role}">${user.role}</span></td>
                    <td>${new Date(user.createdAt).toLocaleDateString()}</td>
                    <td>
                        <div class="flex gap-2">
                            <button class="btn-icon" onclick="openEditModal('${user._id}', '${displayName}', '${user.role}')"><i class="fas fa-edit"></i></button>
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
// MONITORING TAB (Enhanced)
// ==========================================
async function refreshMonitoring() {
    try {
        // Fetch enhanced monitoring data
        await Promise.all([
            loadSystemHealth(),
            loadPerformanceMetrics(),
            loadPrometheusMetrics()
        ]);

    } catch (e) {
        console.error('Monitoring error:', e);
    }
}

async function loadSystemHealth() {
    try {
        const response = await fetch(`${API_BASE}/monitoring/health`, {
            headers: { 'Authorization': `Bearer ${authToken}` }
        });
        const data = await response.json();

        if (data.success) {
            const health = data.health;
            
            // Update system metrics
            document.getElementById('cpu-usage').textContent = health.system.loadAverage['1min'];
            document.getElementById('memory-usage').textContent = health.system.memory.usagePercent + '%';
            document.getElementById('system-uptime').textContent = formatUptime(health.process.uptime);
            document.getElementById('db-status').textContent = health.database.status;
            document.getElementById('db-status').className = `badge ${health.database.connected ? 'badge-success' : 'badge-danger'}`;

            // Update detailed system info
            document.getElementById('total-memory').textContent = health.system.memory.total + ' MB';
            document.getElementById('free-memory').textContent = health.system.memory.free + ' MB';
            document.getElementById('used-memory').textContent = health.system.memory.used + ' MB';
            document.getElementById('cpu-count').textContent = health.system.cpuCount;
            document.getElementById('platform').textContent = health.system.platform;
            document.getElementById('node-version').textContent = health.process.nodeVersion;
            document.getElementById('heap-used').textContent = health.process.memory.heapUsed + ' MB';
            document.getElementById('heap-total').textContent = health.process.memory.heapTotal + ' MB';
        }
    } catch (error) {
        console.error('Error loading system health:', error);
    }
}

async function loadPerformanceMetrics() {
    try {
        const response = await fetch(`${API_BASE}/monitoring/performance`, {
            headers: { 'Authorization': `Bearer ${authToken}` }
        });
        const data = await response.json();

        if (data.success) {
            const metrics = data.metrics;
            
            // Update performance stats
            document.getElementById('workouts-7days').textContent = metrics.workouts.last7Days;
            document.getElementById('workouts-30days').textContent = metrics.workouts.last30Days;
            document.getElementById('avg-workout-duration').textContent = metrics.workouts.avgDuration + ' min';
            document.getElementById('new-users-7days').textContent = metrics.users.newLast7Days;
            document.getElementById('new-users-30days').textContent = metrics.users.newLast30Days;

            // Update workout trend chart
            updateWorkoutTrendChart(metrics.workouts.dailyTrend);
        }
    } catch (error) {
        console.error('Error loading performance metrics:', error);
    }
}

async function loadPrometheusMetrics() {
    try {
        const response = await fetch(`${API_BASE}/metrics`);
        const text = await response.text();

        // Parse basic metrics
        const reqTotal = parseMetric(text, 'http_requests_total');
        const reqDuration = parseMetric(text, 'http_request_duration_seconds_sum') / parseMetric(text, 'http_request_duration_seconds_count');
        const activeUsers = parseMetric(text, 'active_users_total');

        document.getElementById('mon-req-total').textContent = Math.floor(reqTotal);
        document.getElementById('mon-avg-latency').textContent = (reqDuration * 1000).toFixed(1) + 'ms';
        document.getElementById('mon-active-users').textContent = Math.floor(activeUsers);

        // Update Charts
        updateLiveChart(activeUsers, reqDuration);

    } catch (e) {
        console.error('Prometheus metrics error:', e);
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

function updateLiveChart(users, latency) {
    const ctx = document.getElementById('liveChart');
    if (!ctx) return;

    if (!charts.live) {
        charts.live = new Chart(ctx, {
            type: 'line',
            data: {
                labels: [],
                datasets: [
                    {
                        label: 'Active Users',
                        borderColor: '#10B981',
                        backgroundColor: 'rgba(16, 185, 129, 0.1)',
                        data: [],
                        tension: 0.4,
                        fill: true
                    },
                    {
                        label: 'Latency (ms)',
                        borderColor: '#F59E0B',
                        backgroundColor: 'rgba(245, 158, 11, 0.1)',
                        data: [],
                        tension: 0.4,
                        fill: true,
                        yAxisID: 'y1'
                    }
                ]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                interaction: {
                    mode: 'index',
                    intersect: false,
                },
                plugins: {
                    legend: {
                        display: true,
                        position: 'top',
                    }
                },
                scales: {
                    x: { display: true },
                    y: {
                        type: 'linear',
                        display: true,
                        position: 'left',
                        title: { display: true, text: 'Users' }
                    },
                    y1: {
                        type: 'linear',
                        display: true,
                        position: 'right',
                        title: { display: true, text: 'Latency (ms)' },
                        grid: { drawOnChartArea: false }
                    }
                }
            }
        });
    }

    const chart = charts.live;
    const now = new Date().toLocaleTimeString();

    if (chart.data.labels.length > 20) {
        chart.data.labels.shift();
        chart.data.datasets[0].data.shift();
        chart.data.datasets[1].data.shift();
    }

    chart.data.labels.push(now);
    chart.data.datasets[0].data.push(users);
    chart.data.datasets[1].data.push((latency * 1000).toFixed(1));
    chart.update('none');
}

function updateWorkoutTrendChart(dailyTrend) {
    const ctx = document.getElementById('workoutTrendChart');
    if (!ctx) return;

    const labels = dailyTrend.map(d => d._id);
    const counts = dailyTrend.map(d => d.count);
    const calories = dailyTrend.map(d => d.totalCalories);

    if (!charts.workoutTrend) {
        charts.workoutTrend = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: labels,
                datasets: [
                    {
                        label: 'Workouts',
                        data: counts,
                        backgroundColor: 'rgba(79, 70, 229, 0.8)',
                        borderColor: 'rgba(79, 70, 229, 1)',
                        borderWidth: 1,
                        yAxisID: 'y'
                    },
                    {
                        label: 'Total Calories',
                        data: calories,
                        type: 'line',
                        borderColor: 'rgba(236, 72, 153, 1)',
                        backgroundColor: 'rgba(236, 72, 153, 0.1)',
                        tension: 0.4,
                        fill: true,
                        yAxisID: 'y1'
                    }
                ]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                interaction: {
                    mode: 'index',
                    intersect: false,
                },
                plugins: {
                    legend: {
                        display: true,
                        position: 'top',
                    }
                },
                scales: {
                    y: {
                        type: 'linear',
                        display: true,
                        position: 'left',
                        title: { display: true, text: 'Workouts' }
                    },
                    y1: {
                        type: 'linear',
                        display: true,
                        position: 'right',
                        title: { display: true, text: 'Calories' },
                        grid: { drawOnChartArea: false }
                    }
                }
            }
        });
    } else {
        charts.workoutTrend.data.labels = labels;
        charts.workoutTrend.data.datasets[0].data = counts;
        charts.workoutTrend.data.datasets[1].data = calories;
        charts.workoutTrend.update();
    }
}

function formatUptime(seconds) {
    const days = Math.floor(seconds / 86400);
    const hours = Math.floor((seconds % 86400) / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    
    if (days > 0) return `${days}d ${hours}h ${minutes}m`;
    if (hours > 0) return `${hours}h ${minutes}m`;
    return `${minutes}m`;
}

function logout() {
    localStorage.removeItem('token');
    window.location.href = '/pages/login.html';
}
