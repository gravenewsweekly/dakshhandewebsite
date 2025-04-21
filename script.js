// Utility function for debouncing
const debounce = (func, wait) => {
  let timeout;
  return (...args) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func.apply(this, args), wait);
  };
};

// Utility function for sanitizing inputs to prevent XSS
const sanitizeInput = (input) => {
  const div = document.createElement('div');
  div.textContent = input;
  return div.innerHTML;
};

// Utility function for generating CSRF token
const generateCsrfToken = () => {
  const array = new Uint8Array(32);
  crypto.getRandomValues(array);
  return Array.from(array, (byte) => byte.toString(16).padStart(2, '0')).join('');
};

// Store CSRF token in session storage
const csrfToken = generateCsrfToken();
sessionStorage.setItem('csrfToken', csrfToken);

// Main initialization
document.addEventListener('DOMContentLoaded', () => {
  // Cached DOM elements with null checks
  const hamburger = document.querySelector('.hamburger');
  const navLinks = document.querySelector('.nav-links');
  const contactForm = document.getElementById('contact-form');
  const newsletterForm = document.getElementById('newsletter-form');
  const donateAmounts = document.querySelectorAll('.donate-amount');
  const razorpayForm = document.getElementById('razorpay-form');
  const backToTopButton = document.getElementById('back-to-top');
  const cookieConsent = document.getElementById('cookie-consent');
  const animatedElements = document.querySelectorAll(
    '.about-img, .about-text, .timeline-item, .philanthropy-text, .philanthropy-img, .gallery-item, .contact-info, #contact-form, .testimonial-item, .blog-content'
  );

  // Prevent clickjacking by enforcing same-origin framing
  if (window.top !== window.self) {
    document.body.style.display = 'none';
    throw new Error('This page cannot be displayed in an iframe.');
  }

  // Mobile Navigation
  const initMobileNav = () => {
    if (!hamburger || !navLinks) return;

    hamburger.addEventListener('click', () => {
      const isExpanded = hamburger.getAttribute('aria-expanded') === 'true';
      hamburger.setAttribute('aria-expanded', !isExpanded);
      hamburger.classList.toggle('active');
      navLinks.classList.toggle('active');
    });

    // Close menu on link click with event delegation
    navLinks.addEventListener('click', (e) => {
      if (e.target.tagName === 'A') {
        hamburger.setAttribute('aria-expanded', 'false');
        hamburger.classList.remove('active');
        navLinks.classList.remove('active');
      }
    });

    // Keyboard accessibility
    hamburger.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        hamburger.click();
      }
    });
  };

  // Smooth Scrolling for Anchor Links
  const initSmoothScroll = () => {
    document.body.addEventListener('click', (e) => {
      if (e.target.matches('a[href^="#"]')) {
        e.preventDefault();
        const targetId = sanitizeInput(e.target.getAttribute('href'));
        const targetElement = document.querySelector(targetId);

        if (targetElement) {
          window.scrollTo({
            top: targetElement.offsetTop - 80,
            behavior: 'smooth',
          });
        }
      }
    });
  };

  // Form Submission (Contact & Newsletter)
  const initForms = () => {
    const handleFormSubmit = (form, successMessage, errorMessage) => {
      if (!form) return;

      form.addEventListener('submit', async (e) => {
        e.preventDefault();
        const formData = new FormData(form);
        const submitButton = form.querySelector('button[type="submit"]');

        // Validate inputs to prevent malicious content
        const name = formData.get('name')?.trim();
        const email = formData.get('email')?.trim();
        const subject = formData.get('subject')?.trim();
        const message = formData.get('message')?.trim();

        if (name && !/^[a-zA-Z\s]{1,50}$/.test(name)) {
          showModal('Please enter a valid name (letters and spaces only, max 50 characters).');
          return;
        }
        if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
          showModal('Please enter a valid email address.');
          return;
        }
        if (subject && subject.length > 100) {
          showModal('Subject must be 100 characters or less.');
          return;
        }
        if (message && message.length > 1000) {
          showModal('Message must be 1000 characters or less.');
          return;
        }

        submitButton.textContent = 'Submitting...';
        submitButton.disabled = true;

        try {
          const response = await fetch(form.action, {
            method: 'POST',
            body: formData,
            headers: {
              'Accept': 'application/json',
              'X-CSRF-Token': csrfToken,
              'X-Requested-With': 'XMLHttpRequest',
            },
          });

          if (response.ok) {
            showModal(sanitizeInput(successMessage));
            form.reset();
          } else {
            throw new Error('Network response was not ok');
          }
        } catch (error) {
          showModal(sanitizeInput(errorMessage));
          console.error('Form submission error:', error);
        } finally {
          submitButton.textContent = 'Submit';
          submitButton.disabled = false;
        }
      });
    };

    handleFormSubmit(
      contactForm,
      'Your message has been sent successfully!',
      'Failed to send message. Please try again later.'
    );

    handleFormSubmit(
      newsletterForm,
      'Thank you for subscribing to our newsletter!',
      'Failed to subscribe. Please try again later.'
    );
  };

  // Donation Section
  const initDonations = () => {
    if (!donateAmounts || !razorpayForm) return;

    donateAmounts.forEach((button) => {
      button.addEventListener('click', () => {
        const amount = button.getAttribute('data-amount');
        if (amount === 'custom') {
          const customAmount = prompt('Enter your donation amount (USD):');
          const parsedAmount = parseFloat(customAmount);
          if (customAmount && !isNaN(parsedAmount) && parsedAmount >= 1 && parsedAmount <= 10000) {
            initializeRazorpay(parsedAmount);
          } else {
            showModal('Please enter a valid donation amount (between $1 and $10,000).');
          }
        } else {
          initializeRazorpay(parseFloat(amount));
        }
      });

      // Keyboard accessibility
      button.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          button.click();
        }
      });
    });
  };

  // Razorpay Payment
  const initializeRazorpay = (amount) => {
    if (!window.Razorpay) {
      showModal('Payment system is currently unavailable. Please try again later.');
      return;
    }

    const amountInr = amount * 83; // Updated USD to INR rate (2025 estimate)
    const options = {
      key: 'rzp_test_Apno0aW38JljQW', // Use test key for development; replace with live key in production
      amount: Math.round(amountInr * 100), // Amount in paise
      currency: 'INR',
      name: 'Daksh Foundation',
      description: 'Donation for Education & Sustainability Initiatives',
      image: 'https://i.imgur.com/B6IZRA3.jpeg',
      handler: (response) => {
        showModal(`Payment successful! Payment ID: ${sanitizeInput(response.razorpay_payment_id)}`);
        // Securely send payment details to server
        sendPaymentDetails(response);
      },
      prefill: {
        name: '',
        email: '',
        contact: '',
      },
      notes: {
        address: 'Daksh Foundation Donation',
      },
      theme: {
        color: '#2b6cb0',
      },
      modal: {
        ondismiss: () => {
          showModal('Payment cancelled. You can try again anytime.');
        },
      },
    };

    try {
      const rzp = new Razorpay(options);
      rzp.open();
      razorpayForm.innerHTML = ''; // Clear previous payment button
    } catch (error) {
      showModal('Failed to initialize payment. Please try again.');
      console.error('Razorpay error:', error);
    }
  };

  // Securely send payment details to server
  const sendPaymentDetails = async (response) => {
    try {
      await fetch('/api/payments', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-CSRF-Token': csrfToken,
          'X-Requested-With': 'XMLHttpRequest',
        },
        body: JSON.stringify({
          payment_id: sanitizeInput(response.razorpay_payment_id),
          amount: response.amount,
          currency: response.currency,
        }),
      });
    } catch (error) {
      console.error('Error sending payment details:', error);
    }
  };

  // Scroll Animations
  const initAnimations = () => {
    const animateOnScroll = debounce(() => {
      animatedElements.forEach((element) => {
        const elementPosition = element.getBoundingClientRect().top;
        const screenPosition = window.innerHeight * 0.85;

        if (elementPosition < screenPosition) {
          element.classList.add('animate-in');
        }
      });
    }, 10);

    // Set initial state
    animatedElements.forEach((element) => {
      element.classList.add('animate-initial');
    });

    window.addEventListener('scroll', animateOnScroll);
    animateOnScroll(); // Run on load
  };

  // Back to Top Button
  const initBackToTop = () => {
    if (!backToTopButton) return;

    const toggleBackToTop = debounce(() => {
      if (window.scrollY > 400) {
        backToTopButton.classList.add('visible');
      } else {
        backToTopButton.classList.remove('visible');
      }
    }, 10);

    window.addEventListener('scroll', toggleBackToTop);

    backToTopButton.addEventListener('click', () => {
      window.scrollTo({
        top: 0,
        behavior: 'smooth',
      });
    });

    // Keyboard accessibility
    backToTopButton.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        backToTopButton.click();
      }
    });
  };

  // Cookie Consent with Secure Storage
  const initCookieConsent = () => {
    if (!cookieConsent) return;

    const hasConsented = localStorage.getItem('cookieConsent') === 'true';
    if (hasConsented) {
      cookieConsent.style.display = 'none';
      return;
    }

    cookieConsent.querySelector('button').addEventListener('click', () => {
      localStorage.setItem('cookieConsent', 'true');
      cookieConsent.style.display = 'none';
      // Initialize analytics only after consent
      initGoogleAnalytics();
    });
  };

  // Google Analytics Initialization (Consent-Based)
  const initGoogleAnalytics = () => {
    if (window.gtag) {
      gtag('consent', 'update', {
        analytics_storage: 'granted',
      });
    }
  };

  // Custom Modal with Security Features
  const showModal = (message) => {
    const modal = document.createElement('div');
    modal.className = 'custom-modal';
    modal.setAttribute('role', 'dialog');
    modal.setAttribute('aria-live', 'polite');
    modal.innerHTML = `
      <div class="modal-content">
        <p>${sanitizeInput(message)}</p>
        <button class="modal-close" aria-label="Close modal">OK</button>
      </div>
    `;
    document.body.appendChild(modal);

    const closeButton = modal.querySelector('.modal-close');
    closeButton.focus();

    const closeModal = () => {
      modal.remove();
      document.removeEventListener('keydown', handleEscape);
    };

    closeButton.addEventListener('click', closeModal);

    // Close on Escape key
    const handleEscape = (e) => {
      if (e.key === 'Escape') {
        closeModal();
      }
    };
    document.addEventListener('keydown', handleEscape);

    // Prevent modal from being manipulated
    modal.addEventListener('DOMNodeInserted', (e) => {
      if (e.target !== modal && !modal.contains(e.target)) {
        e.target.remove();
      }
    });
  };

  // Prevent Right-Click (Optional Security Measure)
  const preventContextMenu = () => {
    document.addEventListener('contextmenu', (e) => {
      e.preventDefault();
    });
  };

  // Initialize all features
  try {
    initMobileNav();
    initSmoothScroll();
    initForms();
    initDonations();
    initAnimations();
    initBackToTop();
    initCookieConsent();
    preventContextMenu();
  } catch (error) {
    console.error('Initialization error:', error);
    showModal('An error occurred while loading the page. Please try again.');
  }
});

// Prevent script injection via URL parameters
window.addEventListener('load', () => {
  const params = new URLSearchParams(window.location.search);
  params.forEach((value) => {
    if (/[<>{}]/g.test(value)) {
      window.location.href = window.location.pathname;
    }
  });
});

// Secure headers (handled server-side, but noted here for completeness)
// Ensure server sets:
// - Content-Security-Policy: default-src 'self'; script-src 'self' https://www.googletagmanager.com https://checkout.razorpay.com;
// - X-Content-Type-Options: nosniff
// - X-Frame-Options: DENY
// - Strict-Transport-Security: max-age=31536000; includeSubDomains
// - Referrer-Policy: strict-origin-when-cross-origin
