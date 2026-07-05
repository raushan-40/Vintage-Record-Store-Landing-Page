/**
 * Mock Analytics Tracker Module
 * Listens for primary CTA interactions and logs outputs without initiating network requests.
 * Uses event delegation for robust dynamic binding.
 */
(function () {
  'use strict';

  // Strict telemetry console string specified in Page 3 NFR Guidelines
  const TRACKING_MESSAGE = 'User interacted with Vintage Record Store Landing Page';

  /**
   * Outputs tracking message to the console.
   * 
   * @param {string} eventText - Text describing the user interaction
   */
  function logEvent(eventText) {
    console.log(`[Analytics] ${eventText}`);
  }

  /**
   * Event handler for primary CTA clicks.
   */
  function handlePrimaryCtaClick(event) {
    logEvent(TRACKING_MESSAGE);
  }

  /**
   * Registers click listeners on primary Call-to-Action components.
   */
  function initAnalytics() {
    const primaryCtaSelectors = [
      '.btn-primary',       // Hero action CTA
      '.btn-buy',           // Grid album CTAs
      '.btn-submit',        // Newsletter signup CTA
      '.btn-reset-catalog'  // Catalog recovery CTA
    ];

    // Event delegation registers interactions dynamically on elements
    document.body.addEventListener('click', (event) => {
      const targetButton = event.target.closest(primaryCtaSelectors.join(', '));
      if (targetButton) {
        handlePrimaryCtaClick(event);
      }
    });

    // Also trigger on successful form submissions (primary newsletter action completed)
    const newsletterForm = document.getElementById('newsletter-form');
    if (newsletterForm) {
      newsletterForm.addEventListener('submit', (e) => {
        const nameInput = document.getElementById('subscriber-name');
        const emailInput = document.getElementById('subscriber-email');
        if (nameInput && emailInput && nameInput.value.trim() !== '' && emailInput.value.trim().includes('@')) {
          logEvent(TRACKING_MESSAGE);
        }
      });
    }
  }

  document.addEventListener('DOMContentLoaded', initAnalytics);

  // Expose global tracker for extensibility
  window.VintageStoreAnalytics = {
    trackCustomInteraction: function(customMessage) {
      logEvent(customMessage || TRACKING_MESSAGE);
    }
  };
})();