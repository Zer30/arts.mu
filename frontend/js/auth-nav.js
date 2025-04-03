document.addEventListener('DOMContentLoaded', async () => {
  const API_BASE_URL = 'http://localhost:5000/api';
  const signInBtn = document.getElementById('signInBtn');
  const signUpBtn = document.getElementById('signUpBtn');
  const signOutBtn = document.getElementById('signOutBtn');
  const dashboardLink = document.getElementById('dashboardLink');
  const cartCountElement = document.querySelector('.cart-count');

  // Get auth headers
  const getAuthHeaders = () => ({
      'Authorization': `Bearer ${localStorage.getItem('token')}`,
      'Content-Type': 'application/json'
  });

  // Function to fetch and update cart count
  async function updateCartCount() {
      try {
          const response = await fetch(`${API_BASE_URL}/cart`, {
              headers: getAuthHeaders()
          });
          const cart = await response.json();
          const count = cart.cartItems?.length || 0;
          cartCountElement.textContent = count;
      } catch (error) {
          console.error('Error fetching cart count:', error);
          cartCountElement.textContent = '0';
      }
  }

  function updateNavigation() {
      const userData = JSON.parse(localStorage.getItem('userData'));
      const token = localStorage.getItem('token');
      
      if (token && userData) {
          // User is logged in
          signInBtn.style.display = 'none';
          signUpBtn.style.display = 'none';
          signOutBtn.style.display = 'block';
          dashboardLink.style.display = 'block';
          
          // Set dashboard link based on user type
          if (userData.type === 'artist') {
              dashboardLink.href = '/frontend/pages/artist-dashboard.html';
              dashboardLink.textContent = 'Artist Dashboard';
          } else if (userData.type === 'collector') {
              dashboardLink.href = '/frontend/pages/collector-dashboard.html';
              dashboardLink.textContent = 'Collector Dashboard';
          }

          // Update cart count
          updateCartCount();
      } else {
          // User is not logged in
          signInBtn.style.display = 'block';
          signUpBtn.style.display = 'block';
          signOutBtn.style.display = 'none';
          dashboardLink.style.display = 'none';
          cartCountElement.textContent = '0'; // Reset cart count
      }
  }

  // Handle sign out
  signOutBtn.addEventListener('click', () => {
      localStorage.removeItem('token');
      localStorage.removeItem('userData');
      updateNavigation();
      window.location.href = '/frontend/pages/index.html';
  });

  // Initial navigation update
  updateNavigation();

  // Update navigation when coming back to the page
  window.addEventListener('pageshow', updateNavigation);
});