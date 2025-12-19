// frontend/js/posts.js
let currentPostId = null;

document.addEventListener('DOMContentLoaded', function () {
    loadPosts();
    setupEventListeners();
});

async function loadPosts() {
    const container = document.getElementById('postsContainer');
    const currentPage = window.location.pathname.split('/').pop();
    const isMyPostsPage = currentPage === 'my-posts.html';

    try {
        let posts;
        if (isMyPostsPage) {
            posts = await API.getMyPosts();
        } else {
            posts = await API.getAllPosts();
        }

        // Store posts globally for sorting/filtering
        window.allLoadedPosts = posts;
        displayPosts(posts);
    } catch (error) {
        console.error('Error loading posts:', error);
        container.innerHTML = `
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
        btn.addEventListener('click', function () {
            currentPostId = parseInt(this.dataset.postId);
            showRankingModal();
        });
    });

    // Add event listeners for edit buttons
    document.querySelectorAll('.edit-btn').forEach(btn => {
        btn.addEventListener('click', function () {
            const postId = this.dataset.postId;
            const postText = this.dataset.text;
            showEditModal(postId, postText);
        });
    });

    // Add event listeners for delete buttons
    document.querySelectorAll('.delete-btn').forEach(btn => {
        btn.addEventListener('click', function () {
            const postId = this.dataset.postId;
            if (confirm('Are you sure you want to delete this post?')) {
                handleDeletePost(postId);
            }
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

    const currentUser = JSON.parse(localStorage.getItem('user'));
    const isOwnPost = currentUser && currentUser.id === post.user_id;

    let actionsHtml = '';
    if (isOwnPost) {
        actionsHtml = `
            <div class="post-actions">
                <button class="btn-action edit-btn" data-post-id="${post.id}" data-text="${escapeHtml(post.text)}">
                    <i class="fas fa-edit"></i> Edit
                </button>
                <button class="btn-action delete-btn" data-post-id="${post.id}">
                    <i class="fas fa-trash"></i> Delete
                </button>
            </div>
        `;
    } else {
        actionsHtml = `
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
        `;
    }

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
                
                ${actionsHtml}
            </div>
        </div>
    `;
}

function setupEventListeners() {
    // Filter buttons
    document.querySelectorAll('.filter-btn').forEach(btn => {
        btn.addEventListener('click', function () {
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
        btn.addEventListener('click', function () {
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

function showEditModal(postId, text) {
    const modal = document.getElementById('editPostModal');
    const textarea = document.getElementById('editPostText');
    const charCount = document.getElementById('editCharCount');

    if (!modal || !textarea) return;

    currentPostId = postId;
    textarea.value = text;
    charCount.textContent = `${text.length}/500`;

    modal.classList.add('show');

    // Setup form submission for this specific edit
    const form = document.getElementById('editPostForm');
    form.onsubmit = async (e) => {
        e.preventDefault();
        const newText = textarea.value.trim();
        if (!newText) return;

        try {
            await API.updatePost(currentPostId, { text: newText });
            modal.classList.remove('show');
            showMessage('Post updated successfully!', 'success');
            loadPosts();
        } catch (error) {
            showMessage(error.message, 'error');
        }
    };

    // Update character count on input
    textarea.oninput = () => {
        charCount.textContent = `${textarea.value.length}/500`;
    };
}

async function handleDeletePost(postId) {
    try {
        await API.deletePost(postId);
        showMessage('Post deleted successfully!', 'success');
        loadPosts();
    } catch (error) {
        showMessage(error.message, 'error');
    }
}

function applyFilter(filter) {
    if (!window.allLoadedPosts) return;

    let filteredPosts = [...window.allLoadedPosts];

    if (filter !== 'all') {
        filteredPosts = filteredPosts.filter(post => {
            const avgRank = post.average_rank || 0;
            if (filter === 'urgent') return avgRank >= 2.5;
            if (filter === 'medium') return avgRank >= 1.5 && avgRank < 2.5;
            if (filter === 'low') return avgRank < 1.5;
            return true;
        });
    }

    // Also apply current sorting
    const sortValue = document.getElementById('sortSelect')?.value || 'newest';
    sortPosts(filteredPosts, sortValue);

    displayPosts(filteredPosts);
}

function applySorting() {
    if (!window.allLoadedPosts) return;

    const sortValue = this.value;
    const currentFilter = document.querySelector('.filter-btn.active')?.dataset.filter || 'all';

    // We filter first then sort
    let filteredPosts = [...window.allLoadedPosts];
    if (currentFilter !== 'all') {
        filteredPosts = filteredPosts.filter(post => {
            const avgRank = post.average_rank || 0;
            if (currentFilter === 'urgent') return avgRank >= 2.5;
            if (currentFilter === 'medium') return avgRank >= 1.5 && avgRank < 2.5;
            if (currentFilter === 'low') return avgRank < 1.5;
            return true;
        });
    }

    sortPosts(filteredPosts, sortValue);
    displayPosts(filteredPosts);
}

function sortPosts(posts, criteria) {
    switch (criteria) {
        case 'newest':
            posts.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
            break;
        case 'oldest':
            posts.sort((a, b) => new Date(a.created_at) - new Date(b.created_at));
            break;
        case 'priority':
            posts.sort((a, b) => (b.average_rank || 0) - (a.average_rank || 0));
            break;
        case 'votes':
            posts.sort((a, b) => (b.total_rankings || 0) - (a.total_rankings || 0));
            break;
    }
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