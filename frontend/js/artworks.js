import { API_BASE_URL, getHeaders } from './config.js';

document.addEventListener('DOMContentLoaded', async () => {
    const artworkGrid = document.getElementById('artworkGrid');
    const loadingSpinner = document.querySelector('.loading-spinner');
    const searchInput = document.getElementById('searchArtworks');
    const sortSelect = document.getElementById('sortArtworks');
    const categoryFilters = document.querySelectorAll('.filter-options label');
    const minPriceInput = document.getElementById('minPrice');
    const maxPriceInput = document.getElementById('maxPrice');
    
    let artworks = [];
    let filters = {
        categories: [],
        minPrice: null,
        maxPrice: null,
        search: '',
        sort: 'newest'
    };
    
    // Load artworks from API
    async function loadArtworks() {
        let response;
        try {
          showLoading();
          
          const queryParams = new URLSearchParams({
            sort: filters.sort,
            search: filters.search,
            minPrice: filters.minPrice,
            maxPrice: filters.maxPrice,
            categories: filters.categories.join(',')
          }).toString();
          
          response = await fetch(`${API_BASE_URL}/artworks?${queryParams}`, {
            headers: getHeaders(),
            credentials: 'include'
          });
      
          const responseData = await response.json();
      
          if (!response.ok || !responseData.success) {
            throw new Error(responseData.error || 'Failed to fetch artworks');
          }
      
          artworks = responseData.data || [];
          displayArtworks(artworks);
      
        } catch (error) {
          console.error('Error loading artworks:', error);
          artworkGrid.innerHTML = `
            <div class="error-state">
              <h2>${error.message}</h2>
              <p>Status: ${response?.status || 'Unknown'}</p>
            </div>
          `;
        } finally {
          hideLoading();
        }
    }
    
    // Display artworks in the grid
    function displayArtworks(artworks) {
      artworkGrid.innerHTML = artworks.map(artwork => {
          const priceElement = artwork.sold 
              ? '<p class="artwork-sold">Sold</p>' 
              : `<p class="artwork-price">$${artwork.price?.toFixed(2) || '0.00'}</p>`;
  
          return `
              <div class="artwork-card">
                  <div class="artwork-image">
                      <img src="${artwork.image}" alt="${artwork.title}"
                           onerror="this.src='../assets/images/default-artwork.svg'"
                           data-full-image="${artwork.image}"
                           class="clickable-image">
                  </div>
                  <div class="artwork-info">
                      <h3 class="artwork-title">${artwork.title}</h3>
                      <p class="artist-name">${artwork.artist?.name || 'Unknown Artist'}</p>
                      <p class="artwork-description">${artwork.description || 'No description available'}</p>
                      <p class="artwork-medium">${artwork.medium || 'Medium not specified'}</p>
                      ${priceElement}
                      <button class="add-to-cart" data-id="${artwork._id}">
                          ${artwork.sold ? 'View Details' : 'Add to Cart'}
                      </button>
                  </div>
              </div>
          `;
      }).join('');
      
      // Reattach event listeners to dynamically generated buttons
      document.querySelectorAll('.add-to-cart').forEach(button => {
          button.addEventListener('click', addToCart);
      });

      // Add click event to images for full-size view
      document.querySelectorAll('.clickable-image').forEach(img => {
        img.addEventListener('click', showFullSizeImage);
        });
    }

    // Show full size image in modal
    function showFullSizeImage(e) {
        const imageUrl = e.target.dataset.fullImage;
        const altText = e.target.alt;
        
        // Create modal elements
        const modalOverlay = document.createElement('div');
        modalOverlay.className = 'image-modal-overlay';
        
        const modalContent = document.createElement('div');
        modalContent.className = 'image-modal-content';
        
        const closeButton = document.createElement('span');
        closeButton.className = 'image-modal-close';
        closeButton.innerHTML = '&times;';
        closeButton.addEventListener('click', () => {
            document.body.removeChild(modalOverlay);
        });
        
        const modalImage = document.createElement('img');
        modalImage.src = imageUrl;
        modalImage.alt = altText;
        modalImage.onerror = function() {
            this.src = '../assets/images/default-artwork.svg';
        };
        
        // Assemble modal
        modalContent.appendChild(closeButton);
        modalContent.appendChild(modalImage);
        modalOverlay.appendChild(modalContent);
        
        // Close when clicking outside the image
        modalOverlay.addEventListener('click', (e) => {
            if (e.target === modalOverlay) {
                document.body.removeChild(modalOverlay);
            }
        });
        
        // Add to DOM
        document.body.appendChild(modalOverlay);
    }

    // Add artwork to cart
    async function addToCart(e) {
        const artworkId = e.target.dataset.id;
        
        try {
            const response = await fetch(`${API_BASE_URL}/cart/add`, {
                method: 'POST',
                headers: {
                    ...getHeaders(),
                    'Content-Type': 'application/json'
                },
                credentials: 'include',
                body: JSON.stringify({ artworkId, quantity: 1 })
            });

            if (!response.ok) {
                throw new Error('Failed to add to cart');
            }

            const data = await response.json();
            updateCartCount(data.totalItems);
            showNotification('Artwork added to cart!', 'success');

        } catch (error) {
            console.error('Error adding to cart:', error);
            showNotification('Failed to add to cart', 'error');
        }
    }
    
    // Update cart count
    function updateCartCount(count) {
        const cartCountElement = document.querySelector('.cart-count');
        if (cartCountElement) {
            cartCountElement.textContent = count;
        }
    }
    
    // Show notification
    function showNotification(message, type) {
        const notification = document.createElement('div');
        notification.className = `notification ${type}`;
        notification.textContent = message;
        document.body.appendChild(notification);
        
        setTimeout(() => {
            notification.style.opacity = '0';
            setTimeout(() => {
                document.body.removeChild(notification);
            }, 500);
        }, 3000);
    }

    // Handle filters
    function handleFilterChange() {
        filters.categories = Array.from(categoryFilters)
        .filter(checkbox => checkbox.checked)
        .map(checkbox => checkbox.value);
        
        filters.minPrice = minPriceInput.value ? parseFloat(minPriceInput.value) : null;
        filters.maxPrice = maxPriceInput.value ? parseFloat(maxPriceInput.value) : null;
        
        loadArtworks();
    }
    
    // Event listeners
    categoryFilters.forEach(filter => {
        filter.addEventListener('change', handleFilterChange);
    });
    
    minPriceInput.addEventListener('change', handleFilterChange);
    maxPriceInput.addEventListener('change', handleFilterChange);
    
    searchInput.addEventListener('input', debounce(() => {
        filters.search = searchInput.value;
        loadArtworks();
    }, 300));
    
    sortSelect.addEventListener('change', () => {
        filters.sort = sortSelect.value;
        loadArtworks();
    });
    
    // Show/Hide loading spinner
    function showLoading() {
        loadingSpinner.style.display = 'block';
        artworkGrid.style.opacity = '0.5';
    }
    
    function hideLoading() {
        loadingSpinner.style.display = 'none';
        artworkGrid.style.opacity = '1';
    }
    
    // Debounce function
    function debounce(func, wait) {
        let timeout;
        return function(...args) {
            clearTimeout(timeout);
            timeout = setTimeout(() => func.apply(this, args), wait);
        };
    }

    // Initialize
    loadArtworks();
});