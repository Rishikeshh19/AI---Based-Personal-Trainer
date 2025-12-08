// Clear old JWT tokens that were signed with previous JWT_SECRET
// This file should be loaded on all pages to ensure clean authentication state

(function() {
    // Check if we need to clear old tokens
    const tokenClearVersion = localStorage.getItem('tokenClearVersion');
    const CURRENT_VERSION = '2.0'; // Increment this when JWT_SECRET changes
    
    if (tokenClearVersion !== CURRENT_VERSION) {
        console.log('🔄 Clearing old authentication tokens...');
        
        // Clear authentication-related items
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        localStorage.removeItem('userId');
        localStorage.removeItem('userRole');
        
        // Mark this version as cleared
        localStorage.setItem('tokenClearVersion', CURRENT_VERSION);
        
        console.log('✅ Old tokens cleared. Please log in again.');
        
        // If user is on a protected page and not on login page, redirect to login
        const protectedPages = ['dashboard', 'workout', 'progress', 'messages', 'diet', 'trainer', 'member', 'admin'];
        const currentPath = window.location.pathname;
        const isProtectedPage = protectedPages.some(page => currentPath.includes(page));
        const isLoginPage = currentPath.includes('login') || currentPath.includes('index.html') || currentPath === '/';
        
        if (isProtectedPage && !isLoginPage) {
            console.log('🔐 Redirecting to login page...');
            window.location.href = '/index.html';
        }
    }
})();
