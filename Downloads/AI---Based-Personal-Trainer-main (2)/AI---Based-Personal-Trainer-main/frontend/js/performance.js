/**
 * Performance Optimization Module
 * Handles lazy loading, image optimization, and caching
 */

// Lazy Load Images
function initLazyLoading() {
    if ('IntersectionObserver' in window) {
        const imageObserver = new IntersectionObserver((entries, observer) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const img = entry.target;
                    if (img.dataset.src) {
                        img.src = img.dataset.src;
                        img.removeAttribute('data-src');
                        imageObserver.unobserve(img);
                    }
                }
            });
        }, {
            rootMargin: '50px'
        });

        document.querySelectorAll('img[data-src]').forEach(img => {
            imageObserver.observe(img);
        });
    }
}

// Debounce Function for Event Handlers
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

// Throttle Function for Scroll Events
function throttle(func, limit) {
    let inThrottle;
    return function(...args) {
        if (!inThrottle) {
            func.apply(this, args);
            inThrottle = true;
            setTimeout(() => inThrottle = false, limit);
        }
    };
}

// Cache API Responses
class ResponseCache {
    constructor(maxAge = 5 * 60 * 1000) {
        this.cache = new Map();
        this.maxAge = maxAge;
    }

    set(key, value) {
        const expiry = Date.now() + this.maxAge;
        this.cache.set(key, { value, expiry });
    }

    get(key) {
        const item = this.cache.get(key);
        if (!item) return null;
        
        if (Date.now() > item.expiry) {
            this.cache.delete(key);
            return null;
        }
        
        return item.value;
    }

    clear() {
        this.cache.clear();
    }
}

// Global Cache Instance
const apiCache = new ResponseCache();

// Enhanced Fetch with Caching
async function cachedFetch(url, options = {}) {
    // Check cache for GET requests
    if (!options.method || options.method === 'GET') {
        const cached = apiCache.get(url);
        if (cached) {
            return cached;
        }
    }

    const response = await fetch(url, {
        ...options,
        headers: {
            'Accept-Encoding': 'gzip, deflate, br',
            ...options.headers
        }
    });

    const data = await response.json();

    // Cache successful responses
    if (response.ok && (!options.method || options.method === 'GET')) {
        apiCache.set(url, data);
    }

    return data;
}

// Optimize DOM Updates - Batch Rendering
function batchDOMUpdates(updates) {
    requestAnimationFrame(() => {
        updates.forEach(update => update());
    });
}

// Reduce Reflows - Cache DOM Queries
class DOMCache {
    constructor() {
        this.cache = new Map();
    }

    get(selector) {
        if (!this.cache.has(selector)) {
            this.cache.set(selector, document.querySelector(selector));
        }
        return this.cache.get(selector);
    }

    getAll(selector) {
        if (!this.cache.has(selector)) {
            this.cache.set(selector, document.querySelectorAll(selector));
        }
        return this.cache.get(selector);
    }

    invalidate(selector) {
        this.cache.delete(selector);
    }

    clear() {
        this.cache.clear();
    }
}

// Global DOM Cache Instance
const domCache = new DOMCache();

// Connection Speed Detection
function getConnectionSpeed() {
    const connection = navigator.connection || navigator.mozConnection || navigator.webkitConnection;
    if (!connection) return 'unknown';
    
    const effectiveType = connection.effectiveType;
    return effectiveType; // '4g', '3g', '2g', 'slow-2g'
}

// Optimize Based on Connection
function optimizeForConnection() {
    const speed = getConnectionSpeed();
    
    if (speed === '2g' || speed === 'slow-2g') {
        // Disable heavy animations
        document.documentElement.style.setProperty('--transition-duration', '0s');
        // Reduce image quality
        document.querySelectorAll('img').forEach(img => {
            if (img.dataset.quality) {
                img.loading = 'lazy';
            }
        });
    }
}

// Memory Leak Prevention - Event Listener Management
class EventManager {
    constructor() {
        this.listeners = [];
    }

    addEventListener(element, event, handler, options = false) {
        element.addEventListener(event, handler, options);
        this.listeners.push({ element, event, handler, options });
    }

    removeEventListener(element, event, handler) {
        element.removeEventListener(event, handler);
        this.listeners = this.listeners.filter(
            l => !(l.element === element && l.event === event && l.handler === handler)
        );
    }

    removeAllListeners() {
        this.listeners.forEach(({ element, event, handler, options }) => {
            element.removeEventListener(event, handler, options);
        });
        this.listeners = [];
    }
}

// Global Event Manager
const eventManager = new EventManager();

// Initialize Performance Optimizations
document.addEventListener('DOMContentLoaded', () => {
    initLazyLoading();
    optimizeForConnection();
});

// Cleanup on page unload
window.addEventListener('beforeunload', () => {
    eventManager.removeAllListeners();
    apiCache.clear();
    domCache.clear();
});

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        debounce,
        throttle,
        ResponseCache,
        apiCache,
        cachedFetch,
        batchDOMUpdates,
        DOMCache,
        domCache,
        getConnectionSpeed,
        optimizeForConnection,
        EventManager,
        eventManager,
        initLazyLoading
    };
}
