// frontend/js/posts.js
let currentPostId = null;

document.addEventListener('DOMContentLoaded', function() {
    loadPosts();
    setupEventListeners();
});

async function loadPosts() {
    try {
        const posts = await API.getAllPosts();
        displayPosts(posts);
    } catch (error) {
        console.error('Error loading posts:', error);
        document.getElementById('postsContainer').innerHTML = `
            <div class="error">
                <i class="fas fa-exclamation-triangle"></i>
                <p>Failed to load posts. Please try again.</p>
            </div>
        `;
    }
}

function displayPosts(posts) {
    const container = document.getElementById('postsContainer');
    
    if (posts.length === 0) {
        container.innerHTML = `
            <div class="empty-state">
                <i class="fas fa-inbox"></i>
                <h3>No problems reported yet</h3>
                <p>Be the first to report a community issue!</p>
                <a href="create-post.html" class="btn-primary">
                    <i class="fas fa-plus"></i> Report Problem
                </a>
            </div>
        `;
        return;
    }
    
    container.innerHTML = posts.map(post => createPostCard(post)).join('');
    
    // Add event listeners to rank buttons
    document.querySelectorAll('.rank-post-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            currentPostId = parseInt(this.dataset.postId);
            showRankingModal();
        });
    });
}

function createPostCard(post) {
    const mediaHtml = post.media_url ? `
        <div class="post-media">
            ${post.media_type === 'image' 
                ? `<img src="${post.media_url}" alt="Post image" loading="lazy">`
                : `<video controls>
                    <source src="${post.media_url}" type="video/mp4">
                    Your browser does not support the video tag.
                </video>`
            }
        </div>
    ` : '';
    
    const priorityClass = getPriorityClass(post.average_rank);
    const priorityText = getPriorityText(post.average_rank);
    
    return `
        <div class="post-card">
            ${mediaHtml}
            <div class="post-content">
                <span class="priority-badge ${priorityClass}">
                    ${priorityText}
                </span>
                <div class="post-text">${escapeHtml(post.text)}</div>
                
                <div class="post-stats">
                    <div class="stat-item">
                        <i class="fas fa-chart-line"></i>
                        <span>Priority Score: <strong>${post.average_rank || 0}</strong></span>
                    </div>
                    <div class="stat-item">
                        <i class="fas fa-users"></i>
                        <span>Votes: <strong>${post.total_rankings || 0}</strong></span>
                    </div>
                </div>
                
                <div class="post-meta">
                    <div class="post-author">
                        <i class="fas fa-user-circle"></i>
                        <span>${escapeHtml(post.owner_username)}</span>
                    </div>
                    <div class="post-date">
                        ${formatDate(post.created_at)}
                    </div>
                </div>
                
                <div class="ranking-actions">
                    <button class="rank-btn-small rank-1 rank-post-btn" data-post-id="${post.id}">
                        <i class="fas fa-flag"></i>
                        <span>Low (1)</span>
                    </button>
                    <button class="rank-btn-small rank-2 rank-post-btn" data-post-id="${post.id}">
                        <i class="fas fa-exclamation-circle"></i>
                        <span>Medium (2)</span>
                    </button>
                    <button class="rank-btn-small rank-3 rank-post-btn" data-post-id="${post.id}">
                        <i class="fas fa-fire"></i>
                        <span>High (3)</span>
                    </button>
                </div>
            </div>
        </div>
    `;
}

function setupEventListeners() {
    // Filter buttons
    document.querySelectorAll('.filter-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
            this.classList.add('active');
            applyFilter(this.dataset.filter);
        });
    });
    
    // Sort select
    const sortSelect = document.getElementById('sortSelect');
    if (sortSelect) {
        sortSelect.addEventListener('change', applySorting);
    }
    
    // Modal close
    const modal = document.getElementById('rankingModal');
    const closeBtn = document.querySelector('.close-modal');
    
    if (closeBtn) {
        closeBtn.addEventListener('click', () => {
            modal.classList.remove('show');
        });
    }
    
    window.addEventListener('click', (e) => {
        if (e.target === modal) {
            modal.classList.remove('show');
        }
    });
    
    // Submit ranking
    const submitBtn = document.getElementById('submitRanking');
    if (submitBtn) {
        submitBtn.addEventListener('click', submitRanking);
    }
    
    // Rank buttons in modal
    document.querySelectorAll('.rank-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            document.querySelectorAll('.rank-btn').forEach(b => b.classList.remove('selected'));
            this.classList.add('selected');
            this.dataset.rank = this.dataset.rank;
        });
    });
}

function showRankingModal() {
    const modal = document.getElementById('rankingModal');
    modal.classList.add('show');
}

async function submitRanking() {
    const selectedRank = document.querySelector('.rank-btn.selected');
    if (!selectedRank) {
        alert('Please select a priority level');
        return;
    }
    
    const rankValue = parseInt(selectedRank.dataset.rank);
    
    try {
        await API.addRanking({
            post_id: currentPostId,
            rank_value: rankValue
        });
        
        // Close modal and refresh posts
        document.getElementById('rankingModal').classList.remove('show');
        showMessage('Thank you for ranking this problem!', 'success');
        loadPosts(); // Refresh to show updated stats
    } catch (error) {
        showMessage(error.message, 'error');
    }
}

function applyFilter(filter) {
    const posts = document.querySelectorAll('.post-card');
    posts.forEach(post => {
        const priorityText = post.querySelector('.priority-badge').textContent.toLowerCase();
        
        switch(filter) {
            case 'urgent':
                post.style.display = priorityText.includes('high') ? 'block' : 'none';
                break;
            case 'medium':
                post.style.display = priorityText.includes('medium') ? 'block' : 'none';
                break;
            case 'low':
                post.style.display = priorityText.includes('low') ? 'block' : 'none';
                break;
            default:
                post.style.display = 'block';
        }
    });
}

function applySorting() {
    // This would require more complex implementation with actual data sorting
    // For MVP, we can reload posts with different ordering from API
    console.log('Sorting would be implemented with API parameters');
}

function getPriorityClass(averageRank) {
    if (averageRank >= 2.5) return 'priority-high';
    if (averageRank >= 1.5) return 'priority-medium';
    return 'priority-low';
}

function getPriorityText(averageRank) {
    if (averageRank >= 2.5) return 'High Priority';
    if (averageRank >= 1.5) return 'Medium Priority';
    return 'Low Priority';
}

function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });
}

function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

function showMessage(text, type) {
    // Create or show message element
    let messageDiv = document.querySelector('.message');
    if (!messageDiv) {
        messageDiv = document.createElement('div');
        messageDiv.className = 'message';
        document.body.appendChild(messageDiv);
    }
    
    messageDiv.textContent = text;
    messageDiv.className = `message ${type}`;
    messageDiv.style.display = 'block';
    
    setTimeout(() => {
        messageDiv.style.display = 'none';
    }, 3000);
}