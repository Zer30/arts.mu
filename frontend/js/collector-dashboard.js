const API_BASE_URL = 'http://localhost:5000/api';

document.addEventListener('DOMContentLoaded', () => {
    // Get user data from localStorage
    const getAuthHeaders = () => ({
        'Authorization': `Bearer ${localStorage.getItem('token')}`,
        'Content-Type': 'application/json'
    });

    // Add authentication check at start
    if (!localStorage.getItem('token')) {
        window.location.href = '/frontend/pages/signin.html';
    }

    // Set up navigation
    const navItems = document.querySelectorAll('.dashboard-nav li a');
    const sections = document.querySelectorAll('.dashboard-section');

    // Hide all sections initially
    sections.forEach(section => {
        section.style.display = 'none';
    });

    // Add active class to current section
    const urlParams = new URLSearchParams(window.location.search);
    const activeSection = urlParams.get('section') || 'profile';

    // Update active section in URL
    function updateUrl(section) {
        history.replaceState({}, '', `?section=${section}`);
    }

    // Handle navigation clicks
    navItems.forEach(item => {
        item.addEventListener('click', (e) => {
            e.preventDefault();
            const section = item.getAttribute('href').substring(1);

            // Remove active class from all nav items and sections
            navItems.forEach(nav => nav.parentElement.classList.remove('active'));
            sections.forEach(sec => sec.style.display = 'none');

            // Add active class to clicked nav item and corresponding section
            item.parentElement.classList.add('active');
            document.getElementById(section).style.display = 'block';

            // Update URL
            updateUrl(section);
        });
    });

    // Load the active section
    function loadActiveSection() {
        navItems.forEach(item => {
            const section = item.getAttribute('href').substring(1);
            if (section === activeSection) {
                item.parentElement.classList.add('active');
                document.getElementById(section).style.display = 'block';
            }
        });
    }

    // Load user profile
    async function loadUserProfile() {
        try {
            const response = await fetch(`${API_BASE_URL}/users/me`, {
                headers: getAuthHeaders()
            });
            const userData = await response.json();

            const profileContent = document.querySelector('#profile .profile-content');
            profileContent.innerHTML = `
                <div class="profile-info">
                    <div class="profile-avatar">
                        <img src="${userData.profile?.avatarUrl || '/frontend/assets/images/default-avatar.png'}" 
                             alt="${userData.name}">
                    </div>
                    <div class="profile-details">
                        <h2>${userData.name}</h2>
                        <p>${userData.email}</p>
                        <p>Member since: ${new Date(userData.createdAt).toLocaleDateString()}</p>
                        ${userData.website ? `<a href="${userData.website}" target="_blank">Website</a>` : ''}
                    </div>
                </div>
            `;
        } catch (error) {
            console.error('Error loading profile:', error);
        }
    }

    // Load wishlist items
    async function loadWishlist() {
        try {
            const response = await fetch(`${API_BASE_URL}/wishlist`, {
                headers: getAuthHeaders()
            });
            const wishlistItems = await response.json();

            const wishlistGrid = document.querySelector('#wishlist .artwork-grid');

            if (wishlistItems.length === 0) {
                wishlistGrid.innerHTML = '<p>Your wishlist is empty.</p>';
                return;
            }

            wishlistGrid.innerHTML = wishlistItems.map(item => `
                <div class="artwork-card">
                    <div class="artwork-image">
                        <img src="${item.artwork.image}" alt="${item.artwork.title}">
                    </div>
                    <div class="artwork-info">
                        <h3 class="artwork-title">${item.artwork.title}</h3>
                        <p class="artist-name">${item.artwork.artist.name}</p>
                        <p class="artwork-price">$${item.artwork.price.toFixed(2)}</p>
                        <button class="btn-remove-wishlist" data-id="${item._id}">Remove</button>
                    </div>
                </div>
            `).join('');

            // Add remove functionality
            document.querySelectorAll('.btn-remove-wishlist').forEach(button => {
                button.addEventListener('click', async () => {
                    try {
                        await fetch(`${API_BASE_URL}/wishlist/${button.dataset.id}`, {
                            method: 'DELETE',
                            headers: getAuthHeaders()
                        });
                        loadWishlist();
                    } catch (error) {
                        console.error('Error removing item:', error);
                    }
                });
            });
        } catch (error) {
            console.error('Error loading wishlist:', error);
        }
    }

    // Load following artists
    async function loadFollowingArtists() {
        try {
            const response = await fetch(`${API_BASE_URL}/users/me/following`, {
                headers: getAuthHeaders()
            });
            const following = await response.json();

            const followingGrid = document.querySelector('#following .artist-grid');

            if (following.length === 0) {
                followingGrid.innerHTML = '<p>You are not following any artists.</p>';
                return;
            }

            followingGrid.innerHTML = following.map(artist => `
                <div class="artist-card">
                    <div class="artist-image">
                        <img src="${artist.profile.avatarUrl || '/frontend/assets/images/default-avatar.png'}" 
                             alt="${artist.name}">
                    </div>
                    <div class="artist-info">
                        <h3 class="artist-name">${artist.name}</h3>
                        <p class="artist-bio">${artist.profile.bio || 'No bio available'}</p>
                        <a href="/frontend/pages/artist.html?id=${artist._id}" class="artist-website">View Profile</a>
                    </div>
                </div>
            `).join('');
        } catch (error) {
            console.error('Error loading following artists:', error);
        }
    }

    // Load orders
    async function loadOrders() {
        try {
            const response = await fetch(`${API_BASE_URL}/orders`, {
                headers: getAuthHeaders()
            });
            const orders = await response.json();

            const ordersTable = document.querySelector('#orders .orders-table');

            if (orders.length === 0) {
                ordersTable.innerHTML = '<p>You have no orders.</p>';
                return;
            }

            ordersTable.innerHTML = `
                <table>
                    <thead>
                        <tr>
                            <th>Order ID</th>
                            <th>Date</th>
                            <th>Amount</th>
                            <th>Status</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${orders.map(order => `
                            <tr>
                                <td>${order._id}</td>
                                <td>${new Date(order.createdAt).toLocaleDateString()}</td>
                                <td>$${order.totalAmount.toFixed(2)}</td>
                                <td>${order.status}</td>
                                <td>
                                    <button class="btn-view-details" data-id="${order._id}">Details</button>
                                </td>
                            </tr>
                        `).join('')}
                    </tbody>
                </table>
            `;

            // Add order details handlers
            document.querySelectorAll('.btn-view-details').forEach(button => {
                button.addEventListener('click', () => {
                    window.location.href = `/frontend/pages/order.html?id=${button.dataset.id}`;
                });
            });
        } catch (error) {
            console.error('Error loading orders:', error);
        }
    }

    // Load collection
    async function loadCollection() {
        try {
            const response = await fetch(`${API_BASE_URL}/collection`, {
                headers: getAuthHeaders()
            });
            const collection = await response.json();

            const collectionGrid = document.querySelector('#collection .artwork-grid');

            if (collection.length === 0) {
                collectionGrid.innerHTML = '<p>Your collection is empty.</p>';
                return;
            }

            collectionGrid.innerHTML = collection.map(item => `
                <div class="artwork-card">
                    <div class="artwork-image">
                        <img src="${item.artwork.image}" alt="${item.artwork.title}">
                    </div>
                    <div class="artwork-info">
                        <h3 class="artwork-title">${item.artwork.title}</h3>
                        <p class="artist-name">${item.artwork.artist.name}</p>
                        <p class="artwork-price">$${item.artwork.price.toFixed(2)}</p>
                    </div>
                </div>
            `).join('');
        } catch (error) {
            console.error('Error loading collection:', error);
        }
    }

    // Load settings
    async function loadSettings() {
        try {
            // Load payment methods
            const paymentResponse = await fetch(`${API_BASE_URL}/payment-methods`, {
                headers: getAuthHeaders()
            });
            const paymentMethods = await paymentResponse.json();

            // Load addresses
            const addressResponse = await fetch(`${API_BASE_URL}/addresses`, {
                headers: getAuthHeaders()
            });
            const addresses = await addressResponse.json();

            const settingsGrid = document.querySelector('#settings .settings-grid');

            settingsGrid.innerHTML = `
                <!-- Update with real data from API responses -->
                ${renderPaymentMethods(paymentMethods)}
                ${renderAddresses(addresses)}
            `;

            // Add event listeners for forms
            document.getElementById('paymentForm')?.addEventListener('submit', handlePaymentSubmit);
            document.getElementById('addressForm')?.addEventListener('submit', handleAddressSubmit);
        } catch (error) {
            console.error('Error loading settings:', error);
        }
    }

    // Initialize the dashboard
    function initializeDashboard() {
        loadActiveSection();
        loadUserProfile();
        loadWishlist();
        loadFollowingArtists();
        loadOrders();
        loadCollection();
        loadSettings();
    }

    // Handle logout
    const logoutButton = document.querySelector('.btn-logout');
    if (logoutButton) {
        logoutButton.addEventListener('click', () => {
            // Remove user data from localStorage
            localStorage.removeItem('userData');
            localStorage.removeItem('token');
            // Redirect to home page
            window.location.href = '/frontend/pages/index.html';
        });
    }

    // Call the initialization function
    initializeDashboard();
});