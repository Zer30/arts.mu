document.addEventListener('DOMContentLoaded', () => {
    const signInForm = document.querySelector('.auth-form');
    const emailInput = document.getElementById('email');
    const passwordInput = document.getElementById('password');
    const rememberMeCheckbox = document.querySelector('.remember-me input');
    const errorMessageContainer = document.createElement('div');
    errorMessageContainer.className = 'error-message';
    signInForm.parentNode.insertBefore(errorMessageContainer, signInForm.nextSibling);

    signInForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        errorMessageContainer.textContent = '';

        const email = emailInput.value.trim();
        const password = passwordInput.value.trim();

        // Basic validation
        if (!email || !password) {
            errorMessageContainer.textContent = 'Please fill in all fields';
            return;
        }

        if (!isValidEmail(email)) {
            errorMessageContainer.textContent = 'Please enter a valid email address';
            return;
        }

        try {
            // In a real application, you would make an API call to your backend
            // For demonstration purposes, we'll simulate a successful login
            const response = await fetch('http://localhost:5000/api/auth/signin', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ email, password }),
            });

            if (!response.ok) {
                const errorData = await response.json();
                errorMessageContainer.textContent = errorData.message || 'Login failed. Please check your credentials.';
                return;
            }

            const userData = await response.json();
            handleSuccessfulLogin(userData);
        } catch (error) {
            console.error('Login error:', error);
            errorMessageContainer.textContent = 'An error occurred. Please try again later.';
        }
    });

    function isValidEmail(email) {
        return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
    }

    function handleSuccessfulLogin(serverResponse) {
        // Store token and user data in localStorage
        localStorage.setItem('token', serverResponse.token);
        localStorage.setItem('userData', JSON.stringify(serverResponse));
        
        // Update navigation
        const authNavScript = document.createElement('script');
        authNavScript.src = '/frontend/js/auth-nav.js';
        document.head.appendChild(authNavScript);
        
        // Redirect to home page
        window.location.href = '/frontend/pages/index.html';
      }

    function updateCartCount() {
        // In a real application, you would fetch the cart count from your backend
        // For demonstration, we'll use a random number
        const cartCount = Math.floor(Math.random() * 10);
        const cartCountElement = document.querySelector('.cart-count');
        if (cartCountElement) {
            cartCountElement.textContent = cartCount;
        }
    }
});