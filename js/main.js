import { setupNavigation } from './scroll.js';
import { setupInteractions } from './interactions.js';
import { setupTimeline } from './timeline.js';
import { setupTrendFilters } from './trendFilters.js';
import { initMobileOptimizations } from './mobile.js';

function init() {
  console.log('Initializing app...');

  // Initialize mobile optimizations first
  initMobileOptimizations();

  setupNavigation();
  setupInteractions();
  setupTimeline();
  setupTrendFilters();
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}
