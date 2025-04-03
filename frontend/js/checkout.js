document.addEventListener('DOMContentLoaded', async () => {
    const API_BASE_URL = 'http://localhost:5000/api';
    const checkoutItems = document.getElementById('checkoutItems');
    const subtotalElement = document.getElementById('subtotal');
    const shippingElement = document.getElementById('shipping');
    const totalElement = document.getElementById('total');

    // Get auth headers
    const getAuthHeaders = () => ({
        'Authorization': `Bearer ${localStorage.getItem('token')}`,
        'Content-Type': 'application/json'
    });

    // Load cart data
    async function loadCart() {
        try {
            const response = await fetch(`${API_BASE_URL}/cart`, {
                headers: getAuthHeaders()
            });
            const cart = await response.json();
            
            if (cart.cartItems?.length > 0) {
                renderCartItems(cart);
                calculateTotals(cart);
            } else {
                window.location.href = '/frontend/pages/cart.html';
            }
        } catch (error) {
            console.error('Error loading cart:', error);
        }
    }

    // Render cart items
    function renderCartItems(cart) {
        checkoutItems.innerHTML = cart.cartItems.map(item => `
            <div class="checkout-item">
                <img src="${item.artwork.image}" alt="${item.artwork.title}">
                <div class="item-info">
                    <h3>${item.artwork.title}</h3>
                    <p>${item.artwork.artist?.name}</p>
                    <p>Quantity: ${item.quantity}</p>
                    <p>$${(item.artwork.price * item.quantity).toFixed(2)}</p>
                </div>
            </div>
        `).join('');
    }

    // Calculate totals
    function calculateTotals(cart) {
        const subtotal = cart.totalPrice || 0;
        const shipping = 0.00; // Flat rate shipping
        const total = subtotal + shipping;

        subtotalElement.textContent = `$${subtotal.toFixed(2)}`;
        shippingElement.textContent = `$${shipping.toFixed(2)}`;
        totalElement.textContent = `$${total.toFixed(2)}`;
    }

    // Initial load
    loadCart();
});