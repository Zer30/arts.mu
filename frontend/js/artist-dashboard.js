document.addEventListener('DOMContentLoaded', () => {
    const API_BASE_URL = 'http://localhost:5000';
    const DEFAULT_HEADERS = {
        'Authorization': `Bearer ${localStorage.getItem('token')}`,
    };

    // Set up navigation
    const navButtons = document.querySelectorAll('.dashboard-nav li button');
    const sections = document.querySelectorAll('.dashboard-content .section');
    
    // Add active class to current section
    const urlParams = new URLSearchParams(window.location.search);
    const activeSection = urlParams.get('section') || 'dashboard';
    
    // Update active section in URL
    function updateUrl(section) {
        history.replaceState({}, '', `?section=${section}`);
    }
    
    // Handle navigation clicks
    navButtons.forEach(button => {
        button.addEventListener('click', (e) => {
            e.preventDefault();
            const section = button.dataset.section;
            
            // Remove active class from all nav items and hide all sections
            navButtons.forEach(btn => btn.parentElement.classList.remove('active'));
            sections.forEach(sec => sec.style.display = 'none');
            
            // Add active class to clicked nav item and show corresponding section
            button.parentElement.classList.add('active');
            document.getElementById(section).style.display = 'block';
            
            // Update URL
            updateUrl(section);
        });
    });
    
    // Load the active section
    function loadActiveSection() {
        navButtons.forEach(button => {
            const section = button.dataset.section;
            if (section === activeSection) {
                button.parentElement.classList.add('active');
                document.getElementById(section).style.display = 'block';
            } else {
                document.getElementById(section).style.display = 'none';
            }
        });
    }
    
    // Fetch user data from MongoDB
    async function fetchUserData() {
        try {
            const response = await fetch(`${API_BASE_URL}/api/users/me`, {
                method: 'GET',
                headers: DEFAULT_HEADERS,
                credentials: 'include' // Important for CORS with authentication
            });
            if (!response.ok) {
                throw new Error('Failed to fetch user data');
            }
            return await response.json();
        } catch (error) {
            console.error('Error fetching user data:', error);
            alert('Failed to load user data. Please try again later.');
            return null;
        }
    }
    
    // Load dashboard content
    async function loadDashboard() {
        try {
            // Get dashboard elements with error logging
            const elements = {
                section: document.getElementById('dashboard'),
                name: document.getElementById('artistName'),
                bio: document.getElementById('artistBio'),
                followers: document.getElementById('followersCount'),
                avatarURL: document.getElementById('artistAvatar')
            };

            // Check which elements are missing
            const missingElements = Object.entries(elements)
                .filter(([key, element]) => !element)
                .map(([key]) => key);

            if (missingElements.length > 0) {
                console.error('Missing dashboard elements:', missingElements.join(', '));
                return;
            }

            // Fetch user data
            const userData = await fetchUserData();
            if (!userData) {
                console.error('Failed to load user data');
                return;
            }

            // Update dashboard elements
            elements.name.textContent = userData.name || 'Unknown Artist';
            elements.bio.textContent = userData.bio || 'No bio available';
            elements.followers.textContent = userData.followers?.length || 0;
            elements.avatarURL.src = userData.avatarURL ? `${API_BASE_URL}${userData.avatarURL}`: '/frontend/assets/images/default-avatar.svg';

        } catch (error) {
            console.error('Error loading dashboard:', error);
            showNotification('Failed to load dashboard data', 'error');
        }
    }
    
    // Load my artworks
    async function loadMyArtworks() {
        const artworksSection = document.getElementById('artworks');
        const artworksGrid = artworksSection.querySelector('.artworks-grid');
        
        try {
            const response = await fetch(`${API_BASE_URL}/api/artworks`, {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                }
            });
            if (!response.ok) throw new Error('Failed to load artworks');

            const responseData = await response.json();

            const artworks = responseData.data || responseData.artworks || [];

            if (!Array.isArray(artworks)) {
                throw new Error('Invalid artworks data format');
            }

            if (artworks.length === 0) {
                artworksGrid.innerHTML = `
                    <div class="empty-state">
                        <img src="/frontend/assets/images/empty-artworks.svg" alt="No artworks">
                        <h2>No Artworks Available</h2>
                        <p>Upload your first artwork to get started.</p>
                        <button id="uploadFirstArtwork" class="btn-primary">Upload Artwork</button>
                    </div>
                `;
                return;
            }
            
            artworksGrid.innerHTML = artworks.map(artwork => `
                <div class="artwork-card">
                    <div class="artwork-image">
                        <img src="${artwork.image}" alt="${artwork.title}">
                    </div>
                    <div class="artwork-info">
                        <h3 class="artwork-title">${artwork.title}</h3>
                        <p class="artwork-description">${artwork.description}</p>
                        <p class="artwork-price">$${artwork.price}</p>
                        <p class="artwork-views">${artwork.views} views</p>
                        <div class="artwork-actions">
                            <button class="btn-edit" data-id="${artwork._id}">Edit</button>
                            <button class="btn-remove" data-id="${artwork._id}">Remove</button>
                        </div>
                    </div>
                </div>
                
            `).join('');
            
            // Add event listeners to edit and remove buttons
            document.querySelectorAll('.btn-edit, .btn-remove').forEach(button => {
                button.addEventListener('click', () => {
                    const artworkId = button.dataset.id;
                    if (button.classList.contains('btn-edit')) {
                        editArtwork(artworkId);
                    } else {
                        removeArtwork(artworkId);
                    }
                });
            });
            
            // Add event listener to upload button if empty state
            document.getElementById('uploadFirstArtwork')?.addEventListener('click', () => {
                document.getElementById('uploadArtwork').click();
            });
        } catch (error) {
            console.error('Error loading artworks:', error);
            artworksGrid.innerHTML = `
                <div class="error-state">
                    <h2>Failed to load artworks</h2>
                    <p>Please try again later</p>
                </div>
            `;
        }
    }
    
    // Edit artwork
    function editArtwork(id) {
        // This would typically fetch artwork data and open an edit modal
        alert(`Edit functionality for artwork ${id} would be implemented here`);
    }
    
    // Remove artwork
    async function removeArtwork(id) {
        if (confirm('Are you sure you want to remove this artwork?')) {
            try {
                const response = await fetch(`${API_BASE_URL}/api/artworks/${id}`, {
                    method: 'DELETE',
                    headers: {
                        'Authorization': `Bearer ${localStorage.getItem('token')}`
                    }
                });
                
                if (!response.ok) {
                    throw new Error('Failed to remove artwork');
                }
                
                loadMyArtworks();
                showNotification('Artwork removed successfully!', 'success');
            } catch (error) {
                console.error('Error removing artwork:', error);
                showNotification('Failed to remove artwork', 'error');
            }
        }
    }
    
    // Load orders
    async function loadOrders() {
        try {
            const response = await fetch(`${API_BASE_URL}/api/orders`, {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                }
            });
            if (!response.ok) throw new Error('Failed to load orders');
            return await response.json();
        } catch (error) {
            console.error('Error loading orders:', error);
            return null;
        }
    }

    async function updateUser(userData, file, userId) {
        console.log('Updating user with data:', userData);
      
        const { name, email, bio, website } = userData;
        let avatarURL;
      
        if (file) {
          avatarURL = `/uploads/profile/${file.filename}`;
          console.log('New avatar URL:', avatarURL);
        }
      
        const updatedFields = { name, email, bio, website, avatarURL };
      
        try {
          const updatedUser = await User.findByIdAndUpdate(
            { _id: req.user._id },
            { $set: updatedFields },
            { new: true }
          );
      
          console.log('Updated user:', updatedUser);
          return updatedUser;
        } catch (error) {
          console.error('Error updating user profile:', error);
          throw error;
        }
      }
    
    // Load settings
    async function loadSettings() {
        const settingsSection = document.getElementById('settings');
        const nameInput = document.getElementById('name');
        const emailInput = document.getElementById('email');
        const bioInput = document.getElementById('bio');
        const websiteInput = document.getElementById('website');
        const profileImageInput = document.getElementById('profileImage');
        
        try {
            const userData = await fetchUserData();
            
            if (userData) {
                nameInput.value = userData.name || '';
                emailInput.value = userData.email || '';
                bioInput.value = userData.bio || '';
                websiteInput.value = userData.website || '';
            }
            
            // Handle profile form submission
            document.getElementById('settingsForm').addEventListener('submit', async (e) => { 
                e.preventDefault();
                
                const formData = new FormData();
                formData.append('name', document.getElementById('name').value);
                formData.append('email', document.getElementById('email').value);
                formData.append('bio', document.getElementById('bio').value);
                formData.append('website', document.getElementById('website').value);
                
                const profileImage = document.getElementById('profileImage').files[0];
                if (profileImage) {
                    formData.append('avatar', profileImage);
                }
                
                try {
                    const response = await fetch('http://localhost:5000/api/users/profile', {
                        method: 'PUT',
                        headers: {
                            'Authorization': `Bearer ${localStorage.getItem('token')}`,
                        },
                        body: formData,
                    });
                    
                    if (!response.ok) {
                        throw new Error('Failed to update profile');
                    }

                    const updatedUserData = await response.json();
                    alert('Profile updated successfully!');

                    document.getElementById('artistAvatar').src = `${API_BASE_URL}${updatedUserData.avatarURL}?t=${Date.now()}`;

                    loadDashboard();
                    } catch (error) {
                     console.error('Error updating profile with new image:', error);
                     alert('Failed to update profile');
                    }
                });
            } catch (error) {
            console.error('Error loading settings:', error);
        }
    }
    
    // Handle artwork upload modal
    const modal = document.getElementById('artworkModal');
    const uploadBtn = document.getElementById('uploadArtwork');
    const closeBtn = document.querySelector('.close');
    
    uploadBtn.addEventListener('click', () => {
        modal.style.display = 'block';
    });
    
    closeBtn.addEventListener('click', () => {
        modal.style.display = 'none';
    });
    
    window.addEventListener('click', (e) => {
        if (e.target === modal) {
            modal.style.display = 'none';
        }
    });
    
    // Handle artwork form submission
    document.getElementById('artworkUploadForm').addEventListener('submit', async (e) => {e.preventDefault();
        
        const formData = new FormData(e.target);
        const imageInput = document.getElementById('artworkImage'); // Match your HTML input ID
        const imageFile = imageInput.files[0]; 
                
        // Log form data to verify
        for (let [key, value] of formData.entries()) {
            console.log(key, value);
        }
        
        try {
            const response = await fetch(`${API_BASE_URL}/api/artworks`, {
                method: 'POST',
                headers: DEFAULT_HEADERS,
                body: formData
            });
            
            if (!response.ok) {
                throw new Error('Failed to upload artwork');
            }
            
            modal.style.display = 'none';
            e.target.reset();
            
            // Reload artworks
            loadMyArtworks();
            
            // Show notification
            showNotification('Artwork uploaded successfully!', 'success');
        } catch (error) {
            console.error('Error uploading artwork:', error);
            showNotification('Failed to upload artwork', 'error');
        }
    });
    
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
    
    // Initialize the dashboard
    async function initializeDashboard() {
        loadActiveSection();
        await loadDashboard();
        await loadMyArtworks();
        await loadOrders();
        await loadSettings();
    }

    // Call the initialization function
    initializeDashboard();
    
    async function updateProfile(profileData) {
        try {
            const response = await fetch(`${API_BASE_URL}/api/users/profile`, {
                method: 'PUT',
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(profileData)
            });
            if (!response.ok) throw new Error('Failed to update profile');
            return await response.json();
        } catch (error) {
            console.error('Error updating profile:', error);
            return null;
        }
    }
});