document.addEventListener('DOMContentLoaded', function() {
    // Mobile Navigation
    const hamburger = document.querySelector('.hamburger');
    const navLinks = document.querySelector('.nav-links');
    
    hamburger.addEventListener('click', function() {
        this.classList.toggle('active');
        navLinks.classList.toggle('active');
    });
    
    // Close mobile menu when clicking a link
    document.querySelectorAll('.nav-links a').forEach(link => {
        link.addEventListener('click', () => {
            hamburger.classList.remove('active');
            navLinks.classList.remove('active');
        });
    });
    
    // Sticky Navigation
    const navbar = document.querySelector('.navbar');
    window.addEventListener('scroll', function() {
        if (window.scrollY > 100) {
            navbar.classList.add('scrolled');
        } else {
            navbar.classList.remove('scrolled');
        }
    });
    
    // Smooth scrolling for anchor links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            e.preventDefault();
            
            const targetId = this.getAttribute('href');
            const targetElement = document.querySelector(targetId);
            
            if (targetElement) {
                window.scrollTo({
                    top: targetElement.offsetTop - 80,
                    behavior: 'smooth'
                });
            }
        });
    });
    
    // Contact Form Submission
    const contactForm = document.getElementById('contact-form');
    if (contactForm) {
        contactForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            const formData = new FormData(this);
            const submitButton = this.querySelector('button[type="submit"]');
            
            // Change button text and disable it
            submitButton.textContent = 'Sending...';
            submitButton.disabled = true;
            
            fetch(this.action, {
                method: 'POST',
                body: formData,
                headers: {
                    'Accept': 'application/json'
                }
            })
            .then(response => {
                if (response.ok) {
                    alert('Message sent successfully!');
                    this.reset();
                } else {
                    throw new Error('Network response was not ok');
                }
            })
            .catch(error => {
                alert('There was a problem sending your message. Please try again later.');
                console.error('Error:', error);
            })
            .finally(() => {
                submitButton.textContent = 'Send Message';
                submitButton.disabled = false;
            });
        });
    }
    
    // Donation Section
    const donateAmounts = document.querySelectorAll('.donate-amount');
    const razorpayForm = document.getElementById('razorpay-form');
    
    donateAmounts.forEach(button => {
        button.addEventListener('click', function() {
            const amount = this.getAttribute('data-amount');
            
            if (amount === 'custom') {
                const customAmount = prompt('Enter your donation amount (USD):');
                if (customAmount && !isNaN(customAmount) && customAmount > 0) {
                    initializeRazorpay(parseFloat(customAmount));
                }
            } else {
                initializeRazorpay(parseFloat(amount));
            }
        });
    });
    
    // Initialize Razorpay
    function initializeRazorpay(amount) {
        // Convert USD to INR (assuming 1 USD = 75 INR for example)
        // Note: Razorpay works with INR, so you'll need to handle currency conversion
        const amountInr = amount * 75;
        
        const options = {
            key: 'rzp_live_Apno0aW38JljQW', // Replace with your Razorpay API Key
            amount: amountInr * 100, // Razorpay expects amount in paise (1 INR = 100 paise)
            currency: 'INR',
            name: 'Daksh Foundation',
            description: 'Donation for future initiatives',
            image: 'https://i.imgur.com/B6IZRA3.jpeg', // Replace with your logo
            handler: function(response) {
                alert('Payment successful! Payment ID: ' + response.razorpay_payment_id);
                // Here you can send the payment details to your server for verification
            },
            prefill: {
                name: '',
                email: '',
                contact: ''
            },
            notes: {
                address: 'Future Daksh Foundation donation'
            },
            theme: {
                color: '#3399cc'
            }
        };
        
        const rzp = new Razorpay(options);
        rzp.open();
        
        // Clear previous payment button if any
        razorpayForm.innerHTML = '';
    }
    
    // Animation on scroll
    const animateOnScroll = function() {
        const elements = document.querySelectorAll('.about-img, .about-text, .timeline-item, .philanthropy-text, .philanthropy-img, .gallery-item, .contact-info, #contact-form');
        
        elements.forEach(element => {
            const elementPosition = element.getBoundingClientRect().top;
            const screenPosition = window.innerHeight / 1.3;
            
            if (elementPosition < screenPosition) {
                element.style.opacity = '1';
                element.style.transform = 'translateY(0)';
            }
        });
    };
    
    // Set initial state for animated elements
    document.querySelectorAll('.about-img, .about-text, .timeline-item, .philanthropy-text, .philanthropy-img, .gallery-item, .contact-info, #contact-form').forEach(element => {
        element.style.opacity = '0';
        element.style.transform = 'translateY(30px)';
        element.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
    });
    
    window.addEventListener('scroll', animateOnScroll);
    animateOnScroll(); // Run once on page load
});

// Inspectlet Analytics Code
(function() {
    window.__insp = window.__insp || [];
    __insp.push(['wid', 2018834270]);
    var ldinsp = function(){
        if(typeof window.__inspld != "undefined") return; 
        window.__inspld = 1; 
        var insp = document.createElement('script'); 
        insp.type = 'text/javascript'; 
        insp.async = true; 
        insp.id = "inspsync"; 
        insp.src = ('https:' == document.location.protocol ? 'https' : 'http') + '://cdn.inspectlet.com/inspectlet.js?wid=2018834270&r=' + Math.floor(new Date().getTime()/3600000); 
        var x = document.getElementsByTagName('script')[0]; 
        x.parentNode.insertBefore(insp, x); 
    };
    setTimeout(ldinsp, 0);
})();
