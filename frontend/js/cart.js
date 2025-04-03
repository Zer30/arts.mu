document.addEventListener('DOMContentLoaded', async () => {
    const API_BASE_URL = 'http://localhost:5000/api';
    const cartItemsContainer = document.querySelector('.cart-items');
    const cartTotalElement = document.getElementById('cartTotal');
    const checkoutButton = document.getElementById('checkoutButton');
    const cartCountElement = document.querySelector('.cart-count');

    // Get auth headers
    const getAuthHeaders = () => ({
        'Authorization': `Bearer ${localStorage.getItem('token')}`,
        'Content-Type': 'application/json'
    });

    // Fetch cart from API
    async function fetchCart() {
        try {
            const response = await fetch(`${API_BASE_URL}/cart`, {
                headers: getAuthHeaders()
            });
            return await response.json();
        } catch (error) {
            console.error('Error fetching cart:', error);
            return { cartItems: [], totalPrice: 0, countItems: 0 };
        }
    }

    // Update cart count
    function updateCartCount(count) {
        cartCountElement.textContent = count;
    }

    // Render cart items
    async function renderCart() {
        const cart = await fetchCart();
    
        updateCartCount(cart.countItems || 0);
    
        if (!cart.cartItems || cart.cartItems.length === 0) {
            cartItemsContainer.innerHTML = `
                <div class="empty-cart">
                    <img src="/frontend/assets/images/empty-cart.svg" alt="Empty Cart">
                    <h2>Your cart is empty</h2>
                    <p>Browse our collection and add items to your cart.</p>
                    <a href="/frontend/pages/artworks.html" class="btn-primary">Browse Artworks</a>
                </div>
            `;
            cartTotalElement.textContent = '0.00';
            return;
        }
    
        cartItemsContainer.innerHTML = cart.cartItems.map(item => {
            const artistName = item.artwork.artist ? item.artwork.artist.name : 'Unknown Artist';
            return `
                <div class="cart-item" data-id="${item.artwork._id}">
                    <div class="cart-item-image">
                        <img src="${item.artwork.image}" alt="${item.artwork.title}" class="cart-item-img">
                    </div>
                    <div class="cart-item-info">
                        <h3 class="cart-item-title">${item.artwork.title}</h3>
                        <p class="cart-item-artist">${artistName}</p>
                        <p class="cart-item-price">$${item.artwork.price.toFixed(2)}</p>
                        <div class="cart-item-quantity">
                            <button class="quantity-button" data-action="decrease">-</button>
                            <input type="number" value="${item.quantity}" min="1">
                            <button class="quantity-button" data-action="increase">+</button>
                        </div>
                        <button class="cart-item-remove">Remove</button>
                    </div>
                </div>
            `;
        }).join('');
    
        // Update total price
        cartTotalElement.textContent = cart.totalPrice?.toFixed(2) || '0.00';
    
        // Add event listeners
        document.querySelectorAll('.quantity-button').forEach(button => {
            button.addEventListener('click', handleQuantityChange);
        });
    
        document.querySelectorAll('.cart-item-remove').forEach(button => {
            button.addEventListener('click', handleRemoveItem);
        });
    
        document.querySelectorAll('.cart-item-info input').forEach(input => {
            input.addEventListener('change', handleManualQuantityChange);
        });
    }

    // Quantity change handlers
    async function handleQuantityChange(e) {
        const artworkId = e.target.closest('.cart-item').dataset.id;
        const action = e.target.dataset.action;
        const currentQty = parseInt(e.target.parentElement.querySelector('input').value);
        const newQty = action === 'increase' ? currentQty + 1 : Math.max(1, currentQty - 1);

        await updateCartItem(artworkId, newQty);
        renderCart();
    }

    async function handleManualQuantityChange(e) {
        const artworkId = e.target.closest('.cart-item').dataset.id;
        const newQty = Math.max(1, parseInt(e.target.value));
        
        await updateCartItem(artworkId, newQty);
        renderCart();
    }

    async function handleRemoveItem(e) {
        const artworkId = e.target.closest('.cart-item').dataset.id;
        
        try {
            await fetch(`${API_BASE_URL}/cart/remove/${artworkId}`, {
                method: 'DELETE',
                headers: getAuthHeaders()
            });
            renderCart();
        } catch (error) {
            console.error('Error removing item:', error);
        }
    }

    async function updateCartItem(artworkId, quantity) {
        try {
            await fetch(`${API_BASE_URL}/cart/update/${artworkId}`, {
                method: 'PUT',
                headers: getAuthHeaders(),
                body: JSON.stringify({ quantity })
            });
        } catch (error) {
            console.error('Error updating cart:', error);
        }
    }

    // Checkout handler
    checkoutButton.addEventListener('click', () => {
        window.location.href = '/frontend/pages/checkout.html';
    });

    // Initial render
    renderCart();
});