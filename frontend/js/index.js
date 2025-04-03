const API_BASE_URL = 'http://localhost:5000/api';

function getAuthHeaders() {
    const token = localStorage.getItem('token');
    return {
        'Authorization': token ? `Bearer ${token}` : '',
        'Content-Type': 'application/json'
    };
}

document.addEventListener('DOMContentLoaded', async () => {
    // Load and display random artists
    await loadRandomArtists();
    
    // Load and display random artworks
    await loadRandomArtworks();
});

async function loadRandomArtists() {
    try {
        const response = await fetch(`${API_BASE_URL}/users?type=artist&fields=name,avatarURL,bio,location,followers,artworks`);
        const data = await response.json();
        const randomArtists = getRandomItems(data.users || [], 4);
        renderArtists(randomArtists);
    } catch (error) {
        console.error('Error loading artists:', error);
    }
}

async function loadRandomArtworks() {
    try {
        const response = await fetch(`${API_BASE_URL}/artworks`);
        const data = await response.json();
        const randomArtworks = getRandomItems(data.data || [], 6);
        renderArtworks(randomArtworks);
    } catch (error) {
        console.error('Error loading artworks:', error);
    }
}

function getRandomItems(array, count) {
    const shuffled = [...array].sort(() => 0.5 - Math.random());
    return shuffled.slice(0, count);
}

function renderArtists(artists) {
    const artistsGrid = document.querySelector('.artist-grid');
    const defaultAvatar = '/frontend/assets/images/default-avatar.svg';
    
    artistsGrid.innerHTML = artists.map(artist => {
        // Use avatarURL first, then fall back to default
        const avatarUrl = artist.avatarURL 
            ? `${API_BASE_URL.replace('/api', '')}${artist.avatarURL}`
            : defaultAvatar;

        return `
        <div class="artist-card">
            <div class="artist-avatar">
                <img src="${avatarUrl}" 
                     alt="${artist.name}"
                     onerror="this.src='${defaultAvatar}'">
            </div>
            <h3 class="artist-name">${artist.name}</h3>
            <p class="artist-location">${artist.location || 'Location not specified'}</p>
            <p class="artist-bio">${artist.bio || 'No bio available'}</p>
            <div class="artist-stats">
                <span>${artist.followers?.length?.toLocaleString() || 0} Followers</span>
                <span>•</span>
                <span>${artist.artworks?.length || 0} Artworks</span>
            </div>
            <button class="btn-follow">Follow</button>
        </div>
        `;
    }).join('');
}
// Mobile menu toggle
document.querySelector('.mobile-menu-toggle').addEventListener('click', function() {
    document.querySelector('.nav-links').classList.toggle('active');
});

// Filters toggle for mobile
document.querySelector('.filters-toggle').addEventListener('click', function() {
    document.querySelector('.filters-sidebar').classList.add('active');
});

document.querySelector('.close-filters').addEventListener('click', function() {
    document.querySelector('.filters-sidebar').classList.remove('active');
});

function renderArtworks(artworks) {
    const artworkGrid = document.querySelector('.artwork-grid');
    
    artworkGrid.innerHTML = artworks.map(artwork => {
        const priceElement = artwork.sold ? '<p class="artwork-sold">Sold</p>' : `<p class="artwork-price">$${artwork.price}</p>`;
        
        return `
            <div class="artwork-card">
                <div class="artwork-image">
                    <img src="${artwork.image}" alt="${artwork.title}">
                </div>
                <div class="artwork-info">
                    <h3 class="artwork-title">${artwork.title}</h3>
                    <p class="artist-name">${artwork.artist?.name || 'Unknown Artist'}</p>
                    <p class="artwork-description">${artwork.description}</p>
                    <p class="artwork-medium">${artwork.medium}</p>
                    ${priceElement}
                </div>
            </div>
        `;
    }).join('');
}