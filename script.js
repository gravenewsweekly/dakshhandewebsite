// Razorpay Donation Checkout Script
document.getElementById('donate-form').addEventListener('submit', function (event) {
    event.preventDefault();

    // Get form elements
    const checkoutButton = document.getElementById('checkout-button');
    const selectedAmount = document.querySelector('input[name="amount"]:checked');
    const customAmount = document.getElementById('custom-amount').value;

    // Disable button to prevent multiple submissions
    checkoutButton.disabled = true;
    checkoutButton.textContent = 'Processing...';

    // Validate donation amount
    let amount = 0;
    if (customAmount && !isNaN(customAmount) && customAmount >= 1) {
        amount = parseFloat(customAmount) * 100; // Convert USD to paise
    } else if (selectedAmount) {
        amount = parseFloat(selectedAmount.value) * 100; // Convert USD to paise
    } else {
        alert('Please select or enter a donation amount of at least $1.');
        checkoutButton.disabled = false;
        checkoutButton.textContent = 'Proceed to Checkout';
        return;
    }

    // Razorpay checkout options
    const options = {
        key: 'rzp_test_Apno0aW38JljQW', // Razorpay test key
        amount: Math.round(amount), // Ensure integer amount in paise
        currency: 'USD', // As specified in donate.html
        name: 'Daksh Hande Philanthropy',
        description: 'Donation for Education and Environmental Initiatives',
        image: 'https://source.unsplash.com/random/100x100?charity', // Placeholder logo
        handler: function (response) {
            // Handle successful payment
            alert(`Thank you for your donation! Payment ID: ${response.razorpay_payment_id}`);
            // Reset form
            document.getElementById('donate-form').reset();
            checkoutButton.disabled = false;
            checkoutButton.textContent = 'Proceed to Checkout';
            // Redirect to thank-you page (placeholder)
            window.location.href = '/thank-you.html';
        },
        prefill: {
            name: '',
            email: '',
            contact: ''
        },
        notes: {
            purpose: 'Philanthropy donation for education and environment'
        },
        theme: {
            color: '#0055cc' // Matches primary color from style.css
        },
        modal: {
            ondismiss: function () {
                // Handle modal closure
                alert('Payment modal closed. Please try again to complete your donation.');
                checkoutButton.disabled = false;
                checkoutButton.textContent = 'Proceed to Checkout';
            }
        },
        retry: {
            enabled: true,
            max_count: 3 // Allow up to 3 retry attempts for failed payments
        }
    };

    // Initialize Razorpay checkout
    try {
        const rzp = new Razorpay(options);
        rzp.on('payment.failed', function (response) {
            // Handle payment failure
            alert(`Payment failed: ${response.error.description}. Please try again.`);
            checkoutButton.disabled = false;
            checkoutButton.textContent = 'Proceed to Checkout';
        });
        rzp.open();
    } catch (error) {
        console.error('Error initializing Razorpay:', error);
        alert('An error occurred while processing your donation. Please try again later.');
        checkoutButton.disabled = false;
        checkoutButton.textContent = 'Proceed to Checkout';
    }
});
