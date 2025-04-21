// Razorpay Donation Checkout Script
document.getElementById('donate-form').addEventListener('submit', function (event) {
    event.preventDefault();

    // Get donation amount
    const selectedAmount = document.querySelector('input[name="amount"]:checked');
    const customAmount = document.getElementById('custom-amount').value;
    let amount = 0;

    if (customAmount && !isNaN(customAmount) && customAmount > 0) {
        amount = parseFloat(customAmount) * 100; // Convert to paise
    } else if (selectedAmount) {
        amount = parseFloat(selectedAmount.value) * 100; // Convert to paise
    } else {
        alert('Please select or enter a valid donation amount.');
        return;
    }

    // Razorpay checkout options
    const options = {
        key: 'rzp_test_Apno0aW38JljQW', // Provided Razorpay test key
        amount: amount, // Amount in paise
        currency: 'USD', // Currency as specified in donate.html
        name: 'Daksh Hande Philanthropy',
        description: 'Donation for Education and Environmental Initiatives',
        image: 'https://source.unsplash.com/random/100x100?charity', // Placeholder logo
        handler: function (response) {
            // Handle successful payment
            alert('Thank you for your donation! Payment ID: ' + response.razorpay_payment_id);
            // Optionally, redirect or update UI
            window.location.href = '/thank-you.html'; // Placeholder for thank-you page
        },
        prefill: {
            name: '',
            email: '',
            contact: ''
        },
        theme: {
            color: '#0055cc' // Matches primary color from style.css
        },
        modal: {
            ondismiss: function () {
                alert('Payment modal closed. Please try again if you wish to donate.');
            }
        }
    };

    // Initialize Razorpay checkout
    try {
        const rzp = new Razorpay(options);
        rzp.open();
    } catch (error) {
        console.error('Error initializing Razorpay:', error);
        alert('An error occurred while processing your donation. Please try again.');
    }
});

// Load Razorpay SDK dynamically
(function () {
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.async = true;
    document.body.appendChild(script);
})();
