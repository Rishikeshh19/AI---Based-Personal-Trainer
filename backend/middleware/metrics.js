const client = require('prom-client');
const responseTime = require('response-time');

// Create a Registry to register the metrics
const register = new client.Registry();

// Add default metrics (CPU, memory, etc.)
client.collectDefaultMetrics({ register });

// Custom metrics
const httpRequestDuration = new client.Histogram({
    name: 'http_request_duration_seconds',
    help: 'Duration of HTTP requests in seconds',
    labelNames: ['method', 'route', 'status_code'],
    buckets: [0.1, 0.5, 1, 2, 5]
});

const httpRequestTotal = new client.Counter({
    name: 'http_requests_total',
    help: 'Total number of HTTP requests',
    labelNames: ['method', 'route', 'status_code']
});

const activeUsers = new client.Gauge({
    name: 'active_users_total',
    help: 'Total number of active users by role',
    labelNames: ['role']
});

const workoutTotal = new client.Counter({
    name: 'workouts_total',
    help: 'Total number of workouts completed',
    labelNames: ['user_role']
});

const apiErrors = new client.Counter({
    name: 'api_errors_total',
    help: 'Total number of API errors',
    labelNames: ['method', 'route', 'status_code']
});

const databaseOperations = new client.Counter({
    name: 'database_operations_total',
    help: 'Total number of database operations',
    labelNames: ['operation', 'collection']
});

const authAttempts = new client.Counter({
    name: 'auth_attempts_total',
    help: 'Total number of authentication attempts',
    labelNames: ['status', 'method']
});

// Register custom metrics
register.registerMetric(httpRequestDuration);
register.registerMetric(httpRequestTotal);
register.registerMetric(activeUsers);
register.registerMetric(workoutTotal);
register.registerMetric(apiErrors);
register.registerMetric(databaseOperations);
register.registerMetric(authAttempts);

// Middleware to track HTTP requests
const metricsMiddleware = responseTime((req, res, time) => {
    const route = req.route ? req.route.path : req.path;
    const statusCode = res.statusCode;
    
    // Record request duration
    httpRequestDuration
        .labels(req.method, route, statusCode)
        .observe(time / 1000);
    
    // Increment request counter
    httpRequestTotal
        .labels(req.method, route, statusCode)
        .inc();
    
    // Track errors (4xx and 5xx)
    if (statusCode >= 400) {
        apiErrors
            .labels(req.method, route, statusCode)
            .inc();
    }
});

// Helper functions to update metrics
const updateActiveUsers = async (User) => {
    try {
        const roles = ['member', 'trainer', 'admin'];
        for (const role of roles) {
            const count = await User.countDocuments({ role, status: 'active' });
            activeUsers.labels(role).set(count);
        }
    } catch (error) {
        console.error('Error updating active users metric:', error);
    }
};

const incrementWorkout = (userRole) => {
    workoutTotal.labels(userRole).inc();
};

const incrementDbOperation = (operation, collection) => {
    databaseOperations.labels(operation, collection).inc();
};

const incrementAuthAttempt = (status, method = 'password') => {
    authAttempts.labels(status, method).inc();
};

module.exports = {
    register,
    metricsMiddleware,
    updateActiveUsers,
    incrementWorkout,
    incrementDbOperation,
    incrementAuthAttempt,
    httpRequestDuration,
    httpRequestTotal,
    activeUsers,
    workoutTotal,
    apiErrors,
    databaseOperations,
    authAttempts
};
