document.addEventListener('DOMContentLoaded', () => {
    const signUpForm = document.querySelector('.auth-form');
    const accountTypeButtons = document.querySelectorAll('.account-type');
    const artistFields = document.querySelectorAll('.artist-fields');
    const errorMessageContainer = document.createElement('div');
    errorMessageContainer.className = 'error-message';
    signUpForm.parentNode.insertBefore(errorMessageContainer, signUpForm.nextSibling);

    // Handle account type selection
    accountTypeButtons.forEach(button => {
        button.addEventListener('click', () => {
            accountTypeButtons.forEach(btn => btn.classList.remove('active'));
            button.classList.add('active');
            
            const isArtist = button.dataset.type === 'artist';
            artistFields.forEach(field => {
                field.style.display = isArtist ? 'block' : 'none';
            });
        });
    });

    signUpForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        errorMessageContainer.textContent = '';

        const fullName = document.getElementById('fullname').value.trim();
        const email = document.getElementById('email').value.trim();
        const password = document.getElementById('password').value.trim();
        const confirmPassword = document.getElementById('confirm-password').value.trim();
        const artistBio = document.getElementById('artistBio')?.value.trim() || '';
        const website = document.getElementById('website')?.value.trim() || '';
        const termsCheckbox = document.querySelector('.terms input').checked;

        // Determine account type
        const activeButtonType = document.querySelector('.account-type.active');
        if (!activeButtonType) {
            errorMessageContainer.textContent = 'Please select an account type';
            return;
        }
        const accountType = activeButtonType.dataset.type;

        // Basic validation
        if (!fullName || !email || !password || !confirmPassword) {
            errorMessageContainer.textContent = 'Please fill in all required fields';
            return;
        }

        if (!isValidEmail(email)) {
            errorMessageContainer.textContent = 'Please enter a valid email address';
            return;
        }

        if (password.length < 6) {
            errorMessageContainer.textContent = 'Password must be at least 6 characters long';
            return;
        }

        if (password !== confirmPassword) {
            errorMessageContainer.textContent = 'Passwords do not match';
            return;
        }

        if (!termsCheckbox) {
            errorMessageContainer.textContent = 'Please agree to the Terms of Service and Privacy Policy';
            return;
        }

        try {
            // Prepare user data
            const userData = {
                name: fullName,
                email,
                password,
                type: accountType,
                bio: accountType === 'artist' ? artistBio : '',
                website: accountType === 'artist' ? website : '',
            };

            // Make API call to backend
            const response = await fetch('http://localhost:5000/api/auth/signup', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(userData),
            });

            if (!response.ok) {
                let errorMessage = 'Signup failed. Please try again.';
                try {
                    const errorData = await response.json();
                    errorMessage = errorData.message || errorMessage;
                } catch (e) {
                    // If response isn't JSON, check if it's HTML
                    const text = await response.text();
                    if (text.includes('<!DOCTYPE html>')) {
                        errorMessage = 'Server returned HTML response instead of JSON. Check backend configuration.';
                    }
                }
                errorMessageContainer.textContent = errorMessage;
                return;
            }

            const serverResponse = await response.json();
            handleSuccessfulSignup(serverResponse);
        } catch (error) {
            console.error('Signup error:', error);
            errorMessageContainer.textContent = 'An error occurred. Please try again later.';
        }
    });

    function isValidEmail(email) {
        return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
    }

    function handleSuccessfulSignup(serverResponse) {
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
});