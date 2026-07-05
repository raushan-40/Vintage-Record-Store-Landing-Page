/**
 * Consolidated Site Controller
 * - Implements performance-optimized DOM Reference Caching
 * - Handles Page Load cycles, Mobile Navigation drawer, dynamic catalog filter search, and Form validations
 */
(function () {
  'use strict';

  // Centralized DOM Reference Cache (Constructed dynamically on init)
  let DOM = {};

  /**
   * Initializes the layout framework and hooks up the primary event pipelines
   */
  function init() {
    cacheDOM();
    
    // Page Loading State Progression
    handlePageLoading();

    // Secondary UI Bindings
    initMobileNavigation();
    initFormValidation();
    initCatalogSearch();
    updateCopyrightYear();
  }

  /**
   * Queries and caches DOM nodes into memory to avoid repetitive DOM operations
   */
  function cacheDOM() {
    DOM = {
      loader: document.getElementById('page-loader'),
      siteWrapper: document.getElementById('site-wrapper'),
      menuToggle: document.querySelector('.menu-toggle'),
      navMenu: document.querySelector('.nav-menu'),
      navLinks: document.querySelectorAll('.nav-link'),
      newsletterForm: document.getElementById('newsletter-form'),
      nameInput: document.getElementById('subscriber-name'),
      emailInput: document.getElementById('subscriber-email'),
      nameError: document.getElementById('name-error'),
      emailError: document.getElementById('email-error'),
      successBox: document.getElementById('form-success'),
      currentYear: document.getElementById('current-year'),
      skipLink: document.querySelector('.skip-link'),
      
      // Catalog Search nodes
      searchInput: document.getElementById('catalog-search'),
      recordCards: document.querySelectorAll('.record-card'),
      recordsGrid: document.querySelector('.records-grid'),
      emptyState: document.getElementById('empty-state'),
      resetCatalogBtn: document.getElementById('reset-catalog-btn')
    };
  }

  /* ==========================================================================
     A. PAGE LOADER PROGRESSION
     ========================================================================== */
  function handlePageLoading() {
    if (!DOM.loader || !DOM.siteWrapper) return;

    // Shift screen reader focus to loader element upon entry
    DOM.loader.focus();

    // 2-Second mock load duration (Simulates 3G connectivity delay for review safety)
    setTimeout(() => {
      DOM.loader.classList.add('fade-out');
      
      DOM.siteWrapper.classList.remove('site-wrapper-loading');
      DOM.siteWrapper.add('site-wrapper-ready'); // Trigger safe fallback class
      DOM.siteWrapper.classList.add('site-wrapper-ready');
      DOM.siteWrapper.setAttribute('aria-hidden', 'false');

      DOM.loader.addEventListener('transitionend', () => {
        DOM.loader.style.display = 'none';
        if (DOM.skipLink) {
          DOM.skipLink.focus();
        }
      }, { once: true });
    }, 2000);
  }

  /* ==========================================================================
     B. RESPONSIVE NAVIGATION
     ========================================================================== */
  function initMobileNavigation() {
    if (!DOM.menuToggle || !DOM.navMenu) return;

    function openMenu() {
      DOM.menuToggle.setAttribute('aria-expanded', 'true');
      DOM.navMenu.classList.add('is-active');
      document.body.style.overflow = 'hidden';
    }

    function closeMenu() {
      DOM.menuToggle.setAttribute('aria-expanded', 'false');
      DOM.navMenu.classList.remove('is-active');
      document.body.style.overflow = '';
    }

    DOM.menuToggle.addEventListener('click', () => {
      const isExpanded = DOM.menuToggle.getAttribute('aria-expanded') === 'true';
      isExpanded ? closeMenu() : openMenu();
    });

    DOM.navLinks.forEach(link => {
      link.addEventListener('click', closeMenu);
    });

    window.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && DOM.menuToggle.getAttribute('aria-expanded') === 'true') {
        closeMenu();
        DOM.menuToggle.focus();
      }
    });

    const desktopMediaQuery = window.matchMedia('(min-width: 48em)');
    function handleBreakpointChange(e) {
      if (e.matches && DOM.menuToggle.getAttribute('aria-expanded') === 'true') {
        closeMenu();
      }
    }
    desktopMediaQuery.addEventListener('change', handleBreakpointChange);
  }

  /* ==========================================================================
     C. DYNAMIC CATALOG FILTER SEARCH (Empty State Handler)
     ========================================================================== */
  function initCatalogSearch() {
    if (!DOM.searchInput || !DOM.recordCards || !DOM.emptyState || !DOM.recordsGrid) return;

    function filterRecords() {
      const query = sanitizeInput(DOM.searchInput.value.trim().toLowerCase());
      let visibleCount = 0;

      DOM.recordCards.forEach(card => {
        const title = card.getAttribute('data-title').toLowerCase();
        const artist = card.getAttribute('data-artist').toLowerCase();

        if (title.includes(query) || artist.includes(query)) {
          card.classList.remove('hidden');
          visibleCount++;
        } else {
          card.classList.add('hidden');
        }
      });

      // If visible matches drop to 0, trigger the strict "No data found" Empty State
      if (visibleCount === 0) {
        DOM.recordsGrid.style.display = 'none';
        DOM.emptyState.style.display = 'flex';
      } else {
        DOM.recordsGrid.style.display = 'grid';
        DOM.emptyState.style.display = 'none';
      }
    }

    DOM.searchInput.addEventListener('input', filterRecords);

    // Reset button handler within empty state card
    if (DOM.resetCatalogBtn) {
      DOM.resetCatalogBtn.addEventListener('click', () => {
        DOM.searchInput.value = '';
        filterRecords();
        DOM.searchInput.focus();
      });
    }
  }

  /* ==========================================================================
     D. INPUT VALIDATION & SANITIZATION
     ========================================================================== */
  function initFormValidation() {
    if (!DOM.newsletterForm) return;

    DOM.nameInput.addEventListener('blur', () => validateNameField());
    DOM.nameInput.addEventListener('input', () => {
      if (DOM.nameInput.getAttribute('aria-invalid') === 'true') validateNameField();
    });

    DOM.emailInput.addEventListener('blur', () => validateEmailField());
    DOM.emailInput.addEventListener('input', () => {
      if (DOM.emailInput.getAttribute('aria-invalid') === 'true') validateEmailField();
    });

    DOM.newsletterForm.addEventListener('submit', (e) => {
      e.preventDefault();
      DOM.successBox.textContent = '';

      const isNameValid = validateNameField();
      const isEmailValid = validateEmailField();

      if (isNameValid && isEmailValid) {
        processSuccessState();
      } else {
        const firstError = DOM.newsletterForm.querySelector('[aria-invalid="true"]');
        if (firstError) {
          firstError.focus();
        }
      }
    });
  }

  function validateNameField() {
    const trimmed = DOM.nameInput.value.trim();

    if (trimmed === '') {
      return invalidate(DOM.nameInput, DOM.nameError, 'First name is required.');
    }
    if (trimmed.length < 2) {
      return invalidate(DOM.nameInput, DOM.nameError, 'First name must contain at least 2 characters.');
    }
    return validate(DOM.nameInput, DOM.nameError);
  }

  function validateEmailField() {
    const trimmed = DOM.emailInput.value.trim();
    const emailPattern = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/;

    if (trimmed === '') {
      return invalidate(DOM.emailInput, DOM.emailError, 'Email address is required.');
    }
    if (!emailPattern.test(trimmed)) {
      return invalidate(DOM.emailInput, DOM.emailError, 'Please enter a valid email address.');
    }
    return validate(DOM.emailInput, DOM.emailError);
  }

  function invalidate(input, span, message) {
    input.setAttribute('aria-invalid', 'true');
    if (span) {
      span.textContent = message;
      span.style.opacity = '1';
    }
    return false;
  }

  function validate(input, span) {
    input.setAttribute('aria-invalid', 'false');
    if (span) span.textContent = '';
    return true;
  }

  /**
   * HTML Sanitizer helper (Secures code strings from cross-site scripts)
   */
  function sanitizeInput(str) {
    if (typeof str !== 'string') return '';
    const map = {
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      '"': '&quot;',
      "'": '&#x27;'
    };
    return str.replace(/[&<>"']/g, (m) => map[m]);
  }

  /**
   * Secure success handler using safe DOM node constructors
   */
  function processSuccessState() {
    const rawName = DOM.nameInput.value.trim();
    const rawEmail = DOM.emailInput.value.trim();
    
    const name = sanitizeInput(rawName);
    const email = sanitizeInput(rawEmail);
    
    DOM.newsletterForm.reset();
    DOM.successBox.textContent = '';
    
    const welcomeText = document.createTextNode('Welcome, ');
    const boldName = document.createElement('strong');
    boldName.textContent = name;
    const confirmText = document.createTextNode(`! Your subscription (linked to ${email}) was successful.`);
    
    DOM.successBox.appendChild(welcomeText);
    DOM.successBox.appendChild(boldName);
    DOM.successBox.appendChild(confirmText);
    
    DOM.successBox.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  }

  /* ==========================================================================
     E. DATE UTILITIES
     ========================================================================== */
  function updateCopyrightYear() {
    if (DOM.currentYear) {
      DOM.currentYear.textContent = new Date().getFullYear();
    }
  }

  // Bind to DOMContentLoaded to make pages interactive earlier
  document.addEventListener('DOMContentLoaded', init);
})();