document.addEventListener('DOMContentLoaded', () => {
    // Utility function for selecting elements
    const $ = (selector, context = document) => context.querySelector(selector);
    const $$ = (selector, context = document) => context.querySelectorAll(selector);

    // Mobile Navigation
    const hamburger = $('.hamburger');
    const navLinks = $('.nav-links');

    if (hamburger && navLinks) {
        hamburger.addEventListener('click', () => {
            hamburger.classList.toggle('active');
            navLinks.classList.toggle('active');
            document.body.style.overflow = navLinks.classList.contains('active') ? 'hidden' : ''; // Prevent scrolling when menu is open
        });

        // Close mobile menu on link click
        $$('.nav-links a').forEach(link => {
            link.addEventListener('click', () => {
                hamburger.classList.remove('active');
                navLinks.classList.remove('active');
                document.body.style.overflow = '';
            });
        });

        // Close mobile menu on outside click
        document.addEventListener('click', e => {
            if (!navLinks.contains(e.target) && !hamburger.contains(e.target) && navLinks.classList.contains('active')) {
                hamburger.classList.remove('active');
                navLinks.classList.remove('active');
                document.body.style.overflow = '';
            }
        });
    }

    // Sticky Navigation with Debounce
    const navbar = $('.navbar');
    let lastScrollTop = 0;

    const debounce = (func, wait) => {
        let timeout;
        return (...args) => {
            clearTimeout(timeout);
            timeout = setTimeout(() => func.apply(this, args), wait);
        };
    };

    const handleScroll = debounce(() => {
        const scrollTop = window.scrollY;
        if (scrollTop > 100) {
            navbar.classList.add('scrolled');
        } else {
            navbar.classList.remove('scrolled');
        }

        // Hide navbar on scroll down, show on scroll up
        if (scrollTop > lastScrollTop && scrollTop > 100) {
            navbar.style.transform = 'translateY(-100%)';
        } else {
            navbar.style.transform = 'translateY(0)';
        }
        lastScrollTop = scrollTop;
    }, 10);

    window.addEventListener('scroll', handleScroll);

    // Smooth Scrolling for Anchor Links
    $$('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', e => {
            e.preventDefault();
            const targetId = anchor.getAttribute('href');
            const targetElement = $(targetId);

            if (targetElement) {
                const offset = targetElement.getBoundingClientRect().top + window.scrollY - 80;
                window.scrollTo({
                    top: offset,
                    behavior: 'smooth'
                });
            }
        });
    });

    // Contact Form Submission
    const contactForm = $('#contact-form');
    if (contactForm) {
        contactForm.addEventListener('submit', async e => {
            e.preventDefault();
            const submitButton = contactForm.querySelector('button[type="submit"]');
            submitButton.disabled = true;
            submitButton.textContent = 'Sending...';

            try {
                const formData = new FormData(contactForm);
                const response = await fetch(contactForm.action, {
                    method: 'POST',
                    body: formData,
                    headers: { 'Accept': 'application/json' }
                });

                if (response.ok) {
                    contactForm.reset();
                    showNotification('Message sent successfully!', 'success');
                } else {
                    throw new Error('Failed to send message');
                }
            } catch (error) {
                showNotification('Failed to send message. Please try again.', 'error');
                console.error('Form submission error:', error);
            } finally {
                submitButton.disabled = false;
                submitButton.textContent = 'Send Message';
            }
        });
    }

    // Newsletter Form Submission
    const newsletterForm = $('#newsletter-form');
    if (newsletterForm) {
        newsletterForm.addEventListener('submit', async e => {
            e.preventDefault();
            const submitButton = newsletterForm.querySelector('button[type="submit"]');
            submitButton.disabled = true;
            submitButton.textContent = 'Subscribing...';

            try {
                const formData = new FormData(newsletterForm);
                const response = await fetch(newsletterForm.action, {
                    method: 'POST',
                    body: formData,
                    headers: { 'Accept': 'application/json' }
                });

                if (response.ok) {
                    newsletterForm.reset();
                    showNotification('Subscribed successfully!', 'success');
                } else {
                    throw new Error('Failed to subscribe');
                }
            } catch (error) {
                showNotification('Failed to subscribe. Please try again.', 'error');
                console.error('Newsletter subscription error:', error);
            } finally {
                submitButton.disabled = false;
                submitButton.textContent = 'Subscribe';
            }
        });
    }

    // Donation Section
    const donateAmounts = $$('.donate-amount');
    const razorpayForm = $('#razorpay-form');

    donateAmounts.forEach(button => {
        button.addEventListener('click', () => {
            const amount = button.getAttribute('data-amount');
            let donationAmount;

            if (amount === 'custom') {
                donationAmount = prompt('Enter your donation amount (USD):');
                if (!donationAmount || isNaN(donationAmount) || donationAmount <= 0) {
                    showNotification('Please enter a valid donation amount.', 'error');
                    return;
                }
            } else {
                donationAmount = parseFloat(amount);
            }

            initializeRazorpay(donationAmount);
        });
    });

    // Razorpay Initialization
    function initializeRazorpay(amount) {
        const conversionRate = 83; // USD to INR (update dynamically in production)
        const amountInr = Math.round(amount * conversionRate * 100); // Convert to paise

        const options = {
            key: 'rzp_live_Apno0aW38JljQW', // Replace with your Razorpay API Key
            amount: amountInr,
            currency: 'INR',
            name: 'Daksh Foundation',
            description: 'Donation for Education & Environment Initiatives',
            image: 'https://i.imgur.com/B6IZRA3.jpeg',
            handler: response => {
                showNotification(`Payment successful! Payment ID: ${response.razorpay_payment_id}`, 'success');
                // Optionally send payment details to server
                logPayment(response);
            },
            prefill: {
                name: '',
                email: '',
                contact: ''
            },
            notes: {
                purpose: 'Donation for Daksh Foundation',
                date: new Date().toISOString()
            },
            theme: {
                color: '#00aaff'
            },
            modal: {
                ondismiss: () => {
                    showNotification('Payment cancelled.', 'info');
                }
            }
        };

        try {
            const rzp = new Razorpay(options);
            rzp.open();
            razorpayForm.innerHTML = ''; // Clear previous buttons
        } catch (error) {
            showNotification('Failed to initialize payment. Please try again.', 'error');
            console.error('Razorpay error:', error);
        }
    }

    // Log Payment to Server (Placeholder)
    async function logPayment(response) {
        try {
            await fetch('/api/log-payment', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(response)
            });
        } catch (error) {
            console.error('Payment logging error:', error);
        }
    }

    // Notification System
    function showNotification(message, type) {
        const notification = document.createElement('div');
        notification.className = `notification ${type}`;
        notification.textContent = message;
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            padding: 16px 24px;
            border-radius: 8px;
            color: #fff;
            z-index: 2000;
            opacity: 0;
            transition: opacity 0.3s ease, transform 0.3s ease;
            transform: translateY(-20px);
        `;

        const colors = {
            success: '#22c55e',
            error: '#ef4444',
            info: '#3b82f6'
        };
        notification.style.backgroundColor = colors[type] || '#3b82f6';

        document.body.appendChild(notification);
        setTimeout(() => {
            notification.style.opacity = '1';
            notification.style.transform = 'translateY(0)';
        }, 10);

        setTimeout(() => {
            notification.style.opacity = '0';
            notification.style.transform = 'translateY(-20px)';
            setTimeout(() => notification.remove(), 300);
        }, 3000);
    }

    // Scroll Animations with Intersection Observer
    const animateElements = $$('.about-img, .about-text, .skill-card, .timeline-item, .philanthropy-text, .philanthropy-img, .gallery-item, .testimonial-card, .blog-card, .contact-info, #contact-form');
    const observerOptions = {
        threshold: 0.2,
        rootMargin: '0px 0px -50px 0px'
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('animate-in');
                observer.unobserve(entry.target);
            }
        });
    }, observerOptions);

    animateElements.forEach(element => {
        element.style.opacity = '0';
        element.style.transform = 'translateY(40px)';
        element.style.transition = 'opacity 0.8s ease-out, transform 08s ease-out';
        element.classList.add('animate-element');
        observer.observe(element);
    });

    // Add CSS for animation
    const style = document.createElement('style');
    style.textContent = `
        .animate-in {
            opacity: 1 !important;
            transform: translateY(0) !important;
        }
    `;
    document.head.appendChild(style);

    // Lazy Load Images
    const lazyImages = $$('img[data-src]');
    const imageObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const img = entry.target;
                img.src = img.dataset.src;
                img.removeAttribute('data-src');
                imageObserver.unobserve(img);
            }
        });
    }, { threshold: 0.1 });

    lazyImages.forEach(img => imageObserver.observe(img));

    // Back to Top Button
    const backToTop = document.createElement('button');
    backToTop.innerHTML = '<i class="fas fa-arrow-up"></i>';
    backToTop.className = 'back-to-top';
    backToTop.style.cssText = `
        position: fixed;
        bottom: 40px;
        right: 40px;
        background: var(--secondary-color);
        color: #fff;
        border: none;
        border-radius: 50%;
        width: 48px;
        height: 48px;
        display: flex;
        align-items: center;
        justify-content: center;
        cursor: pointer;
        opacity: 0;
        visibility: hidden;
        transition: opacity 0.3s ease, transform 0.3s ease;
        z-index: 1000;
    `;
    document.body.appendChild(backToTop);

    backToTop.addEventListener('click', () => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    });

    window.addEventListener('scroll', () => {
        if (window.scrollY > 300) {
            backToTop.style.opacity = '1';
            backToTop.style.visibility = 'visible';
            backToTop.style.transform = 'translateY(0)';
        } else {
            backToTop.style.opacity = '0';
            backToTop.style.visibility = 'hidden';
            backToTop.style.transform = 'translateY(20px)';
        }
    });

    // Accessibility: Keyboard Navigation for Hamburger
    hamburger.addEventListener('keydown', e => {
        if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            hamburger.click();
        }
    });

    // Error Boundary for Razorpay
    window.addEventListener('error', e => {
        if (e.message.includes('Razorpay')) {
            showNotification('Payment service unavailable. Please try again later.', 'error');
        }
    });
});
