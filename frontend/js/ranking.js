// frontend/js/ranking.js
document.addEventListener('DOMContentLoaded', function() {
    // Additional ranking-specific functionality
    initializeRankingHandlers();
});

function initializeRankingHandlers() {
    // Real-time ranking updates
    const rankButtons = document.querySelectorAll('.rank-post-btn');
    
    rankButtons.forEach(btn => {
        btn.addEventListener('mouseenter', function() {
            const rank = this.dataset.rank || this.querySelector('.rank-number')?.textContent;
            if (rank) {
                showRankTooltip(this, rank);
            }
        });
        
        btn.addEventListener('mouseleave', hideRankTooltip);
    });
}

function showRankTooltip(element, rank) {
    const tooltip = document.createElement('div');
    tooltip.className = 'rank-tooltip';
    
    const messages = {
        1: 'Minor issue - Can be addressed later',
        2: 'Needs attention - Schedule for review',
        3: 'Urgent action required - Immediate attention needed'
    };
    
    tooltip.textContent = messages[rank] || 'Rank this problem';
    
    const rect = element.getBoundingClientRect();
    tooltip.style.position = 'fixed';
    tooltip.style.left = `${rect.left + rect.width / 2}px`;
    tooltip.style.top = `${rect.top - 10}px`;
    tooltip.style.transform = 'translate(-50%, -100%)';
    
    document.body.appendChild(tooltip);
    
    element._tooltip = tooltip;
}

function hideRankTooltip(event) {
    const tooltip = event.currentTarget._tooltip;
    if (tooltip) {
        tooltip.remove();
        event.currentTarget._tooltip = null;
    }
}

// Real-time ranking updates
async function updatePostRankings(postId) {
    try {
        const stats = await API.getPostRankingStats(postId);
        const myRanking = await API.getMyRanking(postId);
        
        // Update UI elements
        const postElement = document.querySelector(`[data-post-id="${postId}"]`)?.closest('.post-card');
        if (postElement) {
            // Update stats display
            const statsElement = postElement.querySelector('.post-stats');
            if (statsElement) {
                statsElement.innerHTML = `
                    <div class="stat-item">
                        <i class="fas fa-chart-line"></i>
                        <span>Priority: <strong>${stats.average_rank}</strong></span>
                    </div>
                    <div class="stat-item">
                        <i class="fas fa-users"></i>
                        <span>Votes: <strong>${stats.total_rankings}</strong></span>
                    </div>
                    <div class="stat-item">
                        <i class="fas fa-fire"></i>
                        <span>High: ${stats.rank_3_count}</span>
                    </div>
                `;
            }
            
            // Update priority badge
            const badge = postElement.querySelector('.priority-badge');
            if (badge) {
                badge.className = `priority-badge ${getPriorityClass(stats.average_rank)}`;
                badge.textContent = getPriorityText(stats.average_rank);
            }
            
            // Highlight user's current ranking
            if (myRanking.rank_value) {
                postElement.querySelectorAll('.rank-btn-small').forEach(btn => {
                    btn.classList.remove('user-ranked');
                    if (parseInt(btn.dataset.rank) === myRanking.rank_value) {
                        btn.classList.add('user-ranked');
                        btn.innerHTML = `
                            <i class="fas fa-check"></i>
                            <span>Your Rank: ${myRanking.rank_value}</span>
                        `;
                    }
                });
            }
        }
    } catch (error) {
        console.error('Error updating rankings:', error);
    }
}