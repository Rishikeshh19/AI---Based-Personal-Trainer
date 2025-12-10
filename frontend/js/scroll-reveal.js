/* =====================================================
   SCROLL REVEAL ANIMATION SYSTEM
   Animate elements as they enter viewport
   ===================================================== */

class ScrollReveal {
    constructor(options = {}) {
        this.options = {
            threshold: options.threshold || 0.15,
            rootMargin: options.rootMargin || '0px 0px -50px 0px',
            animationClass: options.animationClass || 'revealed',
            once: options.once !== undefined ? options.once : true,
            delay: options.delay || 0,
            distance: options.distance || '50px',
            duration: options.duration || 600,
            easing: options.easing || 'cubic-bezier(0.4, 0, 0.2, 1)'
        };

        this.observer = null;
        this.elements = new Set();
        this.init();
    }

    init() {
        // Add global styles
        this.injectStyles();

        // Create Intersection Observer
        this.observer = new IntersectionObserver(
            this.handleIntersection.bind(this),
            {
                threshold: this.options.threshold,
                rootMargin: this.options.rootMargin
            }
        );

        // Auto-observe elements with data-scroll-reveal attribute
        this.observeElements();

        // Re-observe on DOM changes
        this.watchForNewElements();
    }

    injectStyles() {
        if (document.getElementById('scroll-reveal-styles')) return;

        const style = document.createElement('style');
        style.id = 'scroll-reveal-styles';
        style.textContent = `
            [data-scroll-reveal] {
                opacity: 0;
                transition: 
                    opacity ${this.options.duration}ms ${this.options.easing},
                    transform ${this.options.duration}ms ${this.options.easing};
            }

            [data-scroll-reveal="fade"] {
                opacity: 0;
            }

            [data-scroll-reveal="fade"].revealed {
                opacity: 1;
            }

            [data-scroll-reveal="fade-up"] {
                opacity: 0;
                transform: translateY(${this.options.distance});
            }

            [data-scroll-reveal="fade-up"].revealed {
                opacity: 1;
                transform: translateY(0);
            }

            [data-scroll-reveal="fade-down"] {
                opacity: 0;
                transform: translateY(-${this.options.distance});
            }

            [data-scroll-reveal="fade-down"].revealed {
                opacity: 1;
                transform: translateY(0);
            }

            [data-scroll-reveal="fade-left"] {
                opacity: 0;
                transform: translateX(${this.options.distance});
            }

            [data-scroll-reveal="fade-left"].revealed {
                opacity: 1;
                transform: translateX(0);
            }

            [data-scroll-reveal="fade-right"] {
                opacity: 0;
                transform: translateX(-${this.options.distance});
            }

            [data-scroll-reveal="fade-right"].revealed {
                opacity: 1;
                transform: translateX(0);
            }

            [data-scroll-reveal="scale"] {
                opacity: 0;
                transform: scale(0.9);
            }

            [data-scroll-reveal="scale"].revealed {
                opacity: 1;
                transform: scale(1);
            }

            [data-scroll-reveal="flip"] {
                opacity: 0;
                transform: perspective(1000px) rotateX(-10deg);
            }

            [data-scroll-reveal="flip"].revealed {
                opacity: 1;
                transform: perspective(1000px) rotateX(0deg);
            }

            [data-scroll-reveal="zoom"] {
                opacity: 0;
                transform: scale(0.5);
            }

            [data-scroll-reveal="zoom"].revealed {
                opacity: 1;
                transform: scale(1);
            }

            /* Staggered children */
            [data-scroll-reveal-stagger] > * {
                opacity: 0;
                transform: translateY(30px);
                transition: 
                    opacity ${this.options.duration}ms ${this.options.easing},
                    transform ${this.options.duration}ms ${this.options.easing};
            }

            [data-scroll-reveal-stagger].revealed > *:nth-child(1) { transition-delay: 0ms; }
            [data-scroll-reveal-stagger].revealed > *:nth-child(2) { transition-delay: 100ms; }
            [data-scroll-reveal-stagger].revealed > *:nth-child(3) { transition-delay: 200ms; }
            [data-scroll-reveal-stagger].revealed > *:nth-child(4) { transition-delay: 300ms; }
            [data-scroll-reveal-stagger].revealed > *:nth-child(5) { transition-delay: 400ms; }
            [data-scroll-reveal-stagger].revealed > *:nth-child(6) { transition-delay: 500ms; }
            [data-scroll-reveal-stagger].revealed > *:nth-child(7) { transition-delay: 600ms; }
            [data-scroll-reveal-stagger].revealed > *:nth-child(8) { transition-delay: 700ms; }
            [data-scroll-reveal-stagger].revealed > *:nth-child(9) { transition-delay: 800ms; }
            [data-scroll-reveal-stagger].revealed > *:nth-child(10) { transition-delay: 900ms; }

            [data-scroll-reveal-stagger].revealed > * {
                opacity: 1;
                transform: translateY(0);
            }

            /* Respect reduced motion preference */
            @media (prefers-reduced-motion: reduce) {
                [data-scroll-reveal],
                [data-scroll-reveal-stagger] > * {
                    opacity: 1 !important;
                    transform: none !important;
                    transition: none !important;
                }
            }
        `;
        document.head.appendChild(style);
    }

    observeElements() {
        const elements = document.querySelectorAll('[data-scroll-reveal], [data-scroll-reveal-stagger]');
        elements.forEach(el => {
            this.observe(el);
        });
    }

    observe(element) {
        if (this.elements.has(element)) return;
        
        this.elements.add(element);
        this.observer.observe(element);
    }

    unobserve(element) {
        this.elements.delete(element);
        this.observer.unobserve(element);
    }

    handleIntersection(entries) {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const element = entry.target;
                const delay = element.dataset.scrollRevealDelay || this.options.delay;

                // Apply delay if specified
                setTimeout(() => {
                    element.classList.add(this.options.animationClass);
                }, delay);

                // Unobserve if once is true
                if (this.options.once) {
                    this.unobserve(element);
                }
            } else if (!this.options.once) {
                // Remove class when element leaves viewport
                entry.target.classList.remove(this.options.animationClass);
            }
        });
    }

    watchForNewElements() {
        // Watch for dynamically added elements
        const observer = new MutationObserver(() => {
            this.observeElements();
        });

        observer.observe(document.body, {
            childList: true,
            subtree: true
        });
    }

    // Public API methods
    reveal(selector) {
        const elements = typeof selector === 'string' 
            ? document.querySelectorAll(selector)
            : [selector];

        elements.forEach(el => {
            if (el) {
                this.observe(el);
                // Immediately reveal if in viewport
                const rect = el.getBoundingClientRect();
                const inViewport = (
                    rect.top >= 0 &&
                    rect.bottom <= window.innerHeight
                );
                if (inViewport) {
                    el.classList.add(this.options.animationClass);
                }
            }
        });
    }

    reset(selector) {
        const elements = typeof selector === 'string'
            ? document.querySelectorAll(selector)
            : [selector];

        elements.forEach(el => {
            if (el) {
                el.classList.remove(this.options.animationClass);
                this.observe(el);
            }
        });
    }

    destroy() {
        this.observer.disconnect();
        this.elements.clear();
    }
}

// Initialize global instance with default options
window.scrollReveal = new ScrollReveal();

// Export for module usage
if (typeof module !== 'undefined' && module.exports) {
    module.exports = ScrollReveal;
}

// Auto-initialize on DOM ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        window.scrollReveal.observeElements();
    });
} else {
    window.scrollReveal.observeElements();
}
