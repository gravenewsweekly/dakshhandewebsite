// Utility function for debouncing
const debounce = (func, wait) => {
  let timeout;
  return (...args) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func.apply(this, args), wait);
  };
};

// Main initialization
document.addEventListener('DOMContentLoaded', () => {
  // Cached DOM elements
  const hamburger = document.querySelector('.hamburger');
  const navLinks = document.querySelector('.nav-links');
  const navbar = document.querySelector('.navbar');
  const contactForm = document.getElementById('contact-form');
  const newsletterForm = document.getElementById('newsletter-form');
  const donateAmounts = document.querySelectorAll('.donate-amount');
  const razorpayForm = document.getElementById('razorpay-form');
  const backToTopButton = document.getElementById('back-to-top');
  const cookieConsent = document.getElementById('cookie-consent');
  const animatedElements = document.querySelectorAll(
    '.about-img, .about-text, .timeline-item, .philanthropy-text, .philanthropy-img, .gallery-item, .contact-info, #contact-form, .testimonial-item, .blog-content'
  );

  // Mobile Navigation
  const initMobileNav = () => {
    if (hamburger && navLinks) {
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
    }
  };

  // Sticky Navigation
  const initStickyNav = () => {
    const stickyNav = debounce(() => {
      if (window.scrollY > 100) {
        navbar.classList.add('scrolled');
      } else {
        navbar.classList.remove('scrolled');
      }
    }, 10);

    window.addEventListener('scroll', stickyNav);
  };

  // Smooth Scrolling for Anchor Links
  const initSmoothScroll = () => {
    document.body.addEventListener('click', (e) => {
      if (e.target.matches('a[href^="#"]')) {
        e.preventDefault();
        const targetId = e.target.getAttribute('href');
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
      form.addEventListener('submit', async (e) => {
        e.preventDefault();
        const formData = new FormData(form);
        const submitButton = form.querySelector('button[type="submit"]');

        submitButton.textContent = 'Submitting...';
        submitButton.disabled = true;

        try {
          const response = await fetch(form.action, {
            method: 'POST',
            body: formData,
            headers: { Accept: 'application/json' },
          });

          if (response.ok) {
            showModal(successMessage);
            form.reset();
          } else {
            throw new Error('Network response was not ok');
          }
        } catch (error) {
          showModal(errorMessage);
          console.error('Form submission error:', error);
        } finally {
          submitButton.textContent = 'Submit';
          submitButton.disabled = false;
        }
      });
    };

    if (contactForm) {
      handleFormSubmit(
        contactForm,
        'Your message has been sent successfully!',
        'Failed to send message. Please try again later.'
      );
    }

    if (newsletterForm) {
      handleFormSubmit(
        newsletterForm,
        'Thank you for subscribing to our newsletter!',
        'Failed to subscribe. Please try again later.'
      );
    }
  };

  // Donation Section
  const initDonations = () => {
    if (donateAmounts && razorpayForm) {
      donateAmounts.forEach((button) => {
        button.addEventListener('click', () => {
          const amount = button.getAttribute('data-amount');
          if (amount === 'custom') {
            const customAmount = prompt('Enter your donation amount (USD):');
            const parsedAmount = parseFloat(customAmount);
            if (customAmount && !isNaN(parsedAmount) && parsedAmount >= 1) {
              initializeRazorpay(parsedAmount);
            } else {
              showModal('Please enter a valid donation amount (minimum $1).');
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
    }
  };

  // Razorpay Payment
  const initializeRazorpay = (amount) => {
    if (!window.Razorpay) {
      showModal('Payment system is currently unavailable. Please try again later.');
      return;
    }

    const amountInr = amount * 75; // Convert USD to INR (example rate)
    const options = {
      key: 'rzp_live_Apno0aW38JljQW', // Replace with your Razorpay API Key
      amount: Math.round(amountInr * 100), // Amount in paise
      currency: 'INR',
      name: 'Daksh Foundation',
      description: 'Donation for future initiatives',
      image: 'https://i.imgur.com/B6IZRA3.jpeg',
      handler: (response) => {
        showModal(`Payment successful! Payment ID: ${response.razorpay_payment_id}`);
        // Optionally send payment details to your server
      },
      prefill: {
        name: '',
        email: '',
        contact: '',
      },
      notes: {
        address: 'Future Daksh Foundation donation',
      },
      theme: {
        color: '#3399cc',
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

  // Scroll Animations
  const initAnimations = () => {
    const animateOnScroll = debounce(() => {
      animatedElements.forEach((element) => {
        const elementPosition = element.getBoundingClientRect().top;
        const screenPosition = window.innerHeight * 0.8;

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
    if (backToTopButton) {
      const toggleBackToTop = debounce(() => {
        if (window.scrollY > 300) {
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
    }
  };

  // Cookie Consent
  const initCookieConsent = () => {
    if (cookieConsent) {
      const hasConsented = localStorage.getItem('cookieConsent');
      if (hasConsented) {
        cookieConsent.style.display = 'none';
        return;
      }

      cookieConsent.querySelector('button').addEventListener('click', () => {
        localStorage.setItem('cookieConsent', 'true');
        cookieConsent.style.display = 'none';
      });
    }
  };

  // Custom Modal (Placeholder)
  const showModal = (message) => {
    // Replace alerts with a custom modal for better UX
    const modal = document.createElement('div');
    modal.className = 'custom-modal';
    modal.setAttribute('role', 'dialog');
    modal.setAttribute('aria-live', 'polite');
    modal.innerHTML = `
      <div class="modal-content">
        <p>${message}</p>
        <button class="modal-close" aria-label="Close modal">OK</button>
      </div>
    `;
    document.body.appendChild(modal);

    const closeButton = modal.querySelector('.modal-close');
    closeButton.focus();
    closeButton.addEventListener('click', () => {
      modal.remove();
    });

    // Close on Escape key
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        modal.remove();
      }
    }, { once: true });
  };

  // Initialize all features
  initMobileNav();
  initStickyNav();
  initSmoothScroll();
  initForms();
  initDonations();
  initAnimations();
  initBackToTop();
  initCookieConsent();

  // Replace Inspectlet with modern analytics (e.g., Google Analytics)
  // Example Google Analytics (uncomment and add your tracking ID)
  /*
  (function() {
    const script = document.createElement('script');
    script.async = true;
    script.src = 'https://www.googletagmanager.com/gtag/js?id=G-XXXXXXXXXX';
    document.head.appendChild(script);

    window.dataLayer = window.dataLayer || [];
    function gtag(){dataLayer.push(arguments);}
    gtag('js', new Date());
    gtag('config', 'G-XXXXXXXXXX');
  })();
  */
});
