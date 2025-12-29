/**
 * Mobile-specific optimizations and interactions
 * Meta-level mobile experience enhancements
 */

// Detect mobile device
const isMobile = () => {
  return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)
    || window.innerWidth <= 768;
};

// Detect touch device
const isTouchDevice = () => {
  return 'ontouchstart' in window || navigator.maxTouchPoints > 0;
};

// Get device type for analytics/debugging
const getDeviceType = () => {
  const width = window.innerWidth;
  if (width < 480) return 'small-mobile';
  if (width < 768) return 'mobile';
  if (width < 1024) return 'tablet';
  return 'desktop';
};

// Initialize mobile optimizations
export function initMobileOptimizations() {
  // Add device class to body
  document.body.classList.add(getDeviceType());
  if (isTouchDevice()) {
    document.body.classList.add('touch-device');
  }

  // Optimize viewport height for mobile browsers (handles URL bar)
  handleViewportHeight();

  // Add touch event handlers
  if (isTouchDevice()) {
    addTouchOptimizations();
  }

  // Optimize chart rendering for mobile
  if (isMobile()) {
    optimizeChartsForMobile();
  }

  // Handle orientation changes
  window.addEventListener('orientationchange', handleOrientationChange);

  // Handle resize with debouncing
  let resizeTimer;
  window.addEventListener('resize', () => {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(() => {
      handleViewportHeight();
      updateDeviceClass();
    }, 250);
  });

  // Prevent double-tap zoom on buttons
  preventDoubleTapZoom();

  // Optimize scroll performance
  optimizeScrollPerformance();

  console.log('📱 Mobile optimizations initialized:', getDeviceType());
}

// Handle viewport height for mobile browsers (100vh issue)
function handleViewportHeight() {
  const vh = window.innerHeight * 0.01;
  document.documentElement.style.setProperty('--vh', `${vh}px`);
}

// Update device class on resize
function updateDeviceClass() {
  document.body.className = document.body.className.replace(
    /(small-mobile|mobile|tablet|desktop)/g,
    ''
  );
  document.body.classList.add(getDeviceType());
}

// Handle orientation changes
function handleOrientationChange() {
  handleViewportHeight();

  // Wait for orientation change to complete
  setTimeout(() => {
    // Recalculate chart dimensions if needed
    window.dispatchEvent(new Event('resize'));
  }, 300);
}

// Add touch-specific optimizations
function addTouchOptimizations() {
  // Improve button feedback
  document.querySelectorAll('button, .nav-btn, .option-button').forEach(button => {
    button.addEventListener('touchstart', function() {
      this.style.transform = 'scale(0.98)';
    }, { passive: true });

    button.addEventListener('touchend', function() {
      this.style.transform = '';
    }, { passive: true });
  });

  // Optimize select dropdowns for touch
  document.querySelectorAll('select').forEach(select => {
    select.style.fontSize = Math.max(16, parseFloat(getComputedStyle(select).fontSize)) + 'px';
  });

  // Add visual feedback for option buttons
  document.querySelectorAll('.option-button').forEach(button => {
    let touchTimeout;

    button.addEventListener('touchstart', function(e) {
      clearTimeout(touchTimeout);
      this.classList.add('touch-active');
    }, { passive: true });

    button.addEventListener('touchend', function() {
      touchTimeout = setTimeout(() => {
        this.classList.remove('touch-active');
      }, 150);
    }, { passive: true });
  });
}

// Prevent double-tap zoom on specific elements
function preventDoubleTapZoom() {
  let lastTouchEnd = 0;

  document.addEventListener('touchend', function(e) {
    const now = Date.now();
    if (now - lastTouchEnd <= 300) {
      const target = e.target;
      // Prevent zoom on interactive elements
      if (target.matches('button, .nav-btn, .option-button, select, input')) {
        e.preventDefault();
      }
    }
    lastTouchEnd = now;
  }, { passive: false });
}

// Optimize scroll performance
function optimizeScrollPerformance() {
  // Use passive event listeners for scroll
  let ticking = false;

  window.addEventListener('scroll', () => {
    if (!ticking) {
      window.requestAnimationFrame(() => {
        // Any scroll-based updates go here
        ticking = false;
      });
      ticking = true;
    }
  }, { passive: true });
}

// Optimize charts for mobile
function optimizeChartsForMobile() {
  // Reduce chart complexity on mobile if needed
  const charts = document.querySelectorAll('.chart-wrapper');

  charts.forEach(chart => {
    // Add mobile-optimized class
    chart.classList.add('mobile-chart');

    // Adjust SVG viewBox for better mobile rendering
    const svgs = chart.querySelectorAll('svg');
    svgs.forEach(svg => {
      svg.style.maxWidth = '100%';
      svg.style.height = 'auto';

      // Make SVG text larger on mobile
      const texts = svg.querySelectorAll('text');
      texts.forEach(text => {
        const currentSize = parseFloat(text.getAttribute('font-size') || getComputedStyle(text).fontSize);
        if (currentSize && currentSize < 11) {
          text.setAttribute('font-size', '11');
        }
      });

      // Increase touch target size for interactive elements
      const circles = svg.querySelectorAll('circle');
      circles.forEach(circle => {
        const currentRadius = parseFloat(circle.getAttribute('r'));
        if (currentRadius && currentRadius < 5) {
          circle.setAttribute('r', Math.max(currentRadius, 5));
        }
      });
    });
  });

  // Make iframes responsive
  const iframes = document.querySelectorAll('iframe');
  iframes.forEach(iframe => {
    iframe.style.maxWidth = '100%';

    // Adjust iframe height for mobile
    if (window.innerWidth < 480) {
      const currentHeight = iframe.getAttribute('height');
      if (currentHeight) {
        iframe.setAttribute('height', Math.min(parseInt(currentHeight), 400));
      }
    }
  });

  // Optimize D3 tooltips for touch
  const tooltips = document.querySelectorAll('.chart-tooltip, .map-tooltip');
  tooltips.forEach(tooltip => {
    tooltip.style.pointerEvents = 'none';
    tooltip.style.zIndex = '9999';
  });

  // Add pinch-to-zoom support for dense charts
  enablePinchZoomForCharts();
}

// Enable pinch-to-zoom for dense charts on mobile
function enablePinchZoomForCharts() {
  if (!isTouchDevice()) return;

  const charts = document.querySelectorAll('#inactivity-chart, #glp1-decline-chart');

  charts.forEach(chart => {
    let initialDistance = 0;
    let currentScale = 1;

    chart.addEventListener('touchstart', (e) => {
      if (e.touches.length === 2) {
        initialDistance = getDistance(e.touches[0], e.touches[1]);
      }
    }, { passive: true });

    chart.addEventListener('touchmove', (e) => {
      if (e.touches.length === 2) {
        const currentDistance = getDistance(e.touches[0], e.touches[1]);
        const scale = currentDistance / initialDistance;
        currentScale = Math.min(Math.max(scale, 0.5), 3);

        const svg = chart.querySelector('svg');
        if (svg) {
          svg.style.transform = `scale(${currentScale})`;
          svg.style.transformOrigin = 'center';
        }
      }
    }, { passive: true });
  });
}

// Calculate distance between two touch points
function getDistance(touch1, touch2) {
  const dx = touch1.clientX - touch2.clientX;
  const dy = touch1.clientY - touch2.clientY;
  return Math.sqrt(dx * dx + dy * dy);
}

// Add haptic feedback for supported devices
export function triggerHapticFeedback(type = 'light') {
  if (navigator.vibrate) {
    const patterns = {
      light: 10,
      medium: 20,
      heavy: 30
    };
    navigator.vibrate(patterns[type] || 10);
  }
}

// Check if element is in viewport (for lazy loading)
export function isInViewport(element) {
  const rect = element.getBoundingClientRect();
  return (
    rect.top >= 0 &&
    rect.left >= 0 &&
    rect.bottom <= (window.innerHeight || document.documentElement.clientHeight) &&
    rect.right <= (window.innerWidth || document.documentElement.clientWidth)
  );
}

// Smooth scroll to element (mobile-optimized)
export function smoothScrollTo(element, offset = 0) {
  if (!element) return;

  const targetPosition = element.getBoundingClientRect().top + window.pageYOffset - offset;
  const startPosition = window.pageYOffset;
  const distance = targetPosition - startPosition;
  const duration = isMobile() ? 300 : 500; // Faster on mobile
  let start = null;

  function animation(currentTime) {
    if (start === null) start = currentTime;
    const timeElapsed = currentTime - start;
    const progress = Math.min(timeElapsed / duration, 1);

    // Easing function
    const easeInOutCubic = progress < 0.5
      ? 4 * progress * progress * progress
      : 1 - Math.pow(-2 * progress + 2, 3) / 2;

    window.scrollTo(0, startPosition + distance * easeInOutCubic);

    if (timeElapsed < duration) {
      requestAnimationFrame(animation);
    }
  }

  requestAnimationFrame(animation);
}

// Mobile-optimized debounce
export function debounce(func, wait = 250) {
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

// Mobile-optimized throttle
export function throttle(func, limit = 100) {
  let inThrottle;
  return function(...args) {
    if (!inThrottle) {
      func.apply(this, args);
      inThrottle = true;
      setTimeout(() => inThrottle = false, limit);
    }
  };
}

// Add CSS for touch-active state
const style = document.createElement('style');
style.textContent = `
  .touch-active {
    opacity: 0.8;
    transform: scale(0.98);
  }

  /* Fix for mobile viewport height */
  .hero-section.mobile-vh {
    height: calc(var(--vh, 1vh) * 100);
    min-height: calc(var(--vh, 1vh) * 100);
  }

  /* Optimize scrolling on mobile */
  .app-container {
    -webkit-overflow-scrolling: touch;
    overscroll-behavior-y: none;
  }

  /* Prevent text selection during swipes */
  .touch-device .chart-wrapper,
  .touch-device .graph-side {
    -webkit-touch-callout: none;
    -webkit-user-select: none;
    user-select: none;
  }

  /* But allow text selection in content cards */
  .touch-device .card-text {
    -webkit-user-select: text;
    user-select: text;
  }
`;
document.head.appendChild(style);

// Export device detection functions
export { isMobile, isTouchDevice, getDeviceType };
