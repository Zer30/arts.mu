import { API_BASE_URL, getHeaders } from './config.js';

document.addEventListener('DOMContentLoaded', async () => {
    const artistsGrid = document.querySelector('.artists-grid');
    const loadingSpinner = document.querySelector('.loading-spinner');
    const searchInput = document.querySelector('.search-bar input');
    const specialtiesFilters = document.querySelectorAll('.filter-options input[type="checkbox"]');
    const locationFilter = document.querySelector('.location-filter');
    const sortSelect = document.querySelector('.sort-by');
    
    let artists = [];
    let filters = {
        specialties: [],
        location: null,
        search: '',
        sort: 'newest'
    };
    
    // Load artists from API
    async function loadArtists() {
        try {
            showLoading();
            
            const response = await fetch(`${API_BASE_URL}/users?type=artist`, {
                headers: getHeaders(),
                credentials: 'include'
            });

            if (!response.ok) {
                throw new Error('Failed to fetch artists');
            }
            
            const data = await response.json();
            artists = data.users || [];
            
            applyFilters();
        } catch (error) {
            console.error('Error loading artists:', error);
            artistsGrid.innerHTML = `
                <div class="error-state">
                    <h2>Error Loading Artists</h2>
                    <p>Please try again later</p>
                </div>
            `;
        } finally {
            hideLoading();
        }
    }
    
    // Apply filters to artists
    function applyFilters() {
        showLoading();
        
        let filteredArtists = [...artists];
        
        // Apply specialties filters
        if (filters.specialties.length > 0) {
            filteredArtists = filteredArtists.filter(artist => 
                artist.profile?.specialties?.some(specialty => 
                    filters.specialties.includes(specialty)
                )
            );
        }
        
        // Apply location filter
        if (filters.location) {
            filteredArtists = filteredArtists.filter(artist => 
                artist.profile?.location === filters.location
            );
        }
        
        // Apply search filter
        if (filters.search.trim() !== '') {
            const searchTerm = filters.search.toLowerCase();
            filteredArtists = filteredArtists.filter(artist => 
                artist.name.toLowerCase().includes(searchTerm) || 
                artist.profile?.bio?.toLowerCase().includes(searchTerm)
            );
        }
        
        // Apply sort
        if (filters.sort === 'name-az') {
            filteredArtists.sort((a, b) => a.name.localeCompare(b.name));
        } else if (filters.sort === 'name-za') {
            filteredArtists.sort((a, b) => b.name.localeCompare(a.name));
        } else if (filters.sort === 'newest') {
            filteredArtists.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        } else if (filters.sort === 'popular') {
            filteredArtists.sort((a, b) => (b.followers?.length || 0) - (a.followers?.length || 0));
        }
        
        displayArtists(filteredArtists);
    }
    
    // Display artists in the grid
    function displayArtists(artists) {
        artistsGrid.innerHTML = artists.map(artist => {
            // Use absolute path for default avatar
            const defaultAvatar = '/frontend/assets/images/default-avatar.svg';
            
            // Check for avatarURL first, then avatar field, then default
            const avatarToUse = artist.avatarURL || artist.avatar || defaultAvatar;
            const avatarUrl = avatarToUse.startsWith('/uploads/')
              ? `${API_BASE_URL.replace('/api', '')}${avatarToUse}?t=${Date.now()}`
              : avatarToUse;
      
          return `
          <div class="artist-card">
            <div class="artist-image">
              <img src="${avatarUrl}" 
                   alt="${artist.name}"
                   onerror="this.src='${defaultAvatar}'">
            </div>
            <div class="artist-info">
              <h3 class="artist-name">${artist.name}</h3>
              <p class="artist-bio">${artist.bio || 'No bio provided'}</p>
              <div class="artist-stats">
                <span>${artist.followers?.length || 0} Followers</span>
                <span>${artist.artworks?.length || 0} Artworks</span>
                </div>
                    <button class="btn-follow">Follow</button>
                </div>
              </div>
            </div>
          </div>`;
        }).join('');

        // Add event listeners for follow buttons
        document.querySelectorAll('.follow-artist').forEach(button => {
            button.addEventListener('click', handleFollowArtist);
        });
    }

    // Handle following/unfollowing artists
    async function handleFollowArtist(e) {
        const button = e.target;
        const artistId = button.dataset.id;
        const isFollowing = button.textContent.trim() === 'Unfollow';

        try {
            const response = await fetch(`${API_BASE_URL}/artists/${artistId}/${isFollowing ? 'unfollow' : 'follow'}`, {
                method: 'POST',
                headers: getHeaders(),
                credentials: 'include'
            });

            if (!response.ok) {
                throw new Error('Failed to update follow status');
            }

            button.textContent = isFollowing ? 'Follow' : 'Unfollow';
            showNotification(`Successfully ${isFollowing ? 'unfollowed' : 'followed'} artist`, 'success');

        } catch (error) {
            console.error('Error updating follow status:', error);
            showNotification('Failed to update follow status', 'error');
        }
    }

    // Handle filter changes
    function handleFilterChange() {
        // Get selected specialties
        filters.specialties = [];
        specialtiesFilters.forEach(filter => {
            if (filter.checked) {
                filters.specialties.push(filter.value);
            }
        });
        
        // Get location filter
        filters.location = locationFilter.value;
        
        applyFilters();
    }
    
    // Handle search
    function handleSearch() {
        filters.search = searchInput.value;
        applyFilters();
    }
    
    // Handle sort change
    function handleSortChange() {
        filters.sort = sortSelect.value;
        applyFilters();
    }
    
    // Show loading spinner
    function showLoading() {
        loadingSpinner.style.display = 'block';
        artistsGrid.style.opacity = '0.5';
    }
    
    // Hide loading spinner
    function hideLoading() {
        loadingSpinner.style.display = 'none';
        artistsGrid.style.opacity = '1';
    }
    
    // Event listeners
    specialtiesFilters.forEach(filter => {
        filter.addEventListener('change', handleFilterChange);
    });
    
    locationFilter.addEventListener('change', handleFilterChange);
    
    searchInput.addEventListener('input', debounce(handleSearch, 300));
    
    sortSelect.addEventListener('change', handleSortChange);


    

    // Initialize
    loadArtists();
    
    // Debounce function for search
    function debounce(func, wait) {
        let timeout;
        return function(...args) {
            clearTimeout(timeout);
            timeout = setTimeout(() => func.apply(this, args), wait);
        };
    }
});