// frontend/create-post.js (for create-post.html)
document.addEventListener('DOMContentLoaded', function() {
    const postForm = document.getElementById('createPostForm');
    const mediaInput = document.getElementById('media');
    const mediaPreview = document.getElementById('mediaPreview');
    
    if (mediaInput) {
        mediaInput.addEventListener('change', function(e) {
            const file = e.target.files[0];
            if (!file) return;
            
            // Clear previous preview
            mediaPreview.innerHTML = '';
            
            // Create preview
            if (file.type.startsWith('image/')) {
                const img = document.createElement('img');
                img.src = URL.createObjectURL(file);
                img.onload = () => URL.revokeObjectURL(img.src);
                mediaPreview.appendChild(img);
            } else if (file.type.startsWith('video/')) {
                const video = document.createElement('video');
                video.src = URL.createObjectURL(file);
                video.controls = true;
                video.onload = () => URL.revokeObjectURL(video.src);
                mediaPreview.appendChild(video);
            }
        });
    }
    
    if (postForm) {
        postForm.addEventListener('submit', async function(e) {
            e.preventDefault();
            
            const text = document.getElementById('postText').value;
            const mediaFile = mediaInput.files[0];
            
            if (!text.trim()) {
                alert('Please enter a description');
                return;
            }
            
            const formData = new FormData();
            formData.append('text', text);
            if (mediaFile) {
                formData.append('media_file', mediaFile);
            }
            
            try {
                const result = await API.createPost(formData);
                showMessage('Post created successfully!', 'success');
                
                setTimeout(() => {
                    window.location.href = 'index.html';
                }, 1500);
            } catch (error) {
                showMessage('Error creating post: ' + error.message, 'error');
            }
        });
    }
    
    // Character counter
    const textArea = document.getElementById('postText');
    const charCount = document.getElementById('charCount');
    
    if (textArea && charCount) {
        textArea.addEventListener('input', function() {
            const length = this.value.length;
            charCount.textContent = `${length}/500`;
            
            if (length > 500) {
                charCount.style.color = 'var(--danger-color)';
            } else if (length > 400) {
                charCount.style.color = 'var(--warning-color)';
            } else {
                charCount.style.color = 'var(--gray-color)';
            }
        });
    }
});