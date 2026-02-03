# How to Create a Post from the Frontend

This document provides a detailed explanation of how the "Create Post" feature works, from the user's interaction with the HTML form to the data being sent to the backend.

## 1. Introduction

The "Create Post" feature allows users to create a new post with a description and an optional image or video. This is a core feature of the application and involves a combination of an HTML form for user input and JavaScript to handle the form submission and communication with the backend.

The two main files involved in this process are:

*   `frontend/create-post.html`: Contains the structure of the form that the user interacts with.
*   `frontend/create-post.js`: Contains the logic to handle the form submission, media previews, and sending the data to the backend API.

## 2. The HTML Form (`create-post.html`)

The `create-post.html` file provides the user interface for creating a new post. It's a standard HTML form with a few key elements:

```html
<form id="createPostForm" class="auth-form">
    <div class="form-group">
        <label for="postText">
            <i class="fas fa-comment-alt"></i> Problem Description
        </label>
        <textarea id="postText" required maxlength="500"
            placeholder="Describe the issue in detail..."></textarea>
        <div id="charCount" class="char-count">0/500</div>
    </div>

    <div class="form-group">
        <label for="media">
            <i class="fas fa-camera"></i> Media (Image or Video)
        </label>
        <div class="file-upload-wrapper">
            <input type="file" id="media" accept="image/*,video/*">
            <div class="upload-placeholder">
                <i class="fas fa-cloud-upload-alt"></i>
                <p>Click or drag to upload media</p>
            </div>
        </div>
        <div id="mediaPreview" class="media-preview"></div>
    </div>

    <button type="submit" class="btn-primary btn-block">
        <i class="fas fa-paper-plane"></i> Publish Post
    </button>
</form>
```

### Key Elements:

*   **`<form id="createPostForm">`:** This is the main form element. It has the ID `createPostForm`, which is used by the JavaScript code to identify and handle the form's submission.
*   **`<textarea id="postText">`:** A text area where the user can enter the description of the post. It has an `id` of `postText` for easy access from JavaScript.
*   **`<input type="file" id="media">`:** An input field that allows the user to select a file from their device. The `accept="image/*,video/*"` attribute restricts the file selection to images and videos.
*   **`<div id="mediaPreview">`:** An empty `div` that will be used to display a preview of the selected image or video.
*   **`<button type="submit">`:** The button that the user clicks to submit the form and create the post.

At the end of the `<body>`, the necessary JavaScript files are included:

```html
<script src="js/api.js"></script>
<script src="js/auth.js"></script>
<script src="create-post.js"></script>
```

*   `api.js`: Contains the `API` class for making requests to the backend.
*   `auth.js`: Handles authentication-related logic.
*   `create-post.js`: The specific JavaScript file for the create post page.

## 3. The JavaScript Logic (`create-post.js`)

The `create-post.js` file contains the client-side logic that brings the "Create Post" page to life.

### `DOMContentLoaded` Event Listener

The entire script is wrapped in a `DOMContentLoaded` event listener. This ensures that the JavaScript code only runs after the entire HTML document has been loaded and parsed.

```javascript
document.addEventListener('DOMContentLoaded', function() {
    // ... all the code ...
});
```

### Media Preview

The script includes an event listener for the media input field. When the user selects a file, this code generates a preview of the image or video.

```javascript
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
```

### Form Submission

This is the most critical part of the script. It listens for the `submit` event on the `createPostForm`.

```javascript
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
```

Here's a breakdown of the form submission logic:

1.  **`e.preventDefault()`:** This prevents the browser's default behavior of reloading the page when a form is submitted.
2.  **Get Form Data:** It retrieves the values from the `postText` textarea and the `media` file input.
3.  **`FormData` Object:** It creates a `FormData` object. This is a special object that is designed to handle form data, especially file uploads.
    *   `formData.append('text', text)`: Adds the post description to the `FormData` object with the key `text`.
    *   `formData.append('media_file', mediaFile)`: If a media file was selected, it adds the file to the `FormData` object with the key `media_file`.
4.  **API Call:** It calls the `API.createPost(formData)` method from `api.js`. This method sends a `POST` request to the backend `/posts/` endpoint with the `FormData` object as the request body.
5.  **Handle Response:**
    *   **Success:** If the API call is successful, it displays a success message and redirects the user to the `index.html` page after a short delay.
    *   **Error:** If the API call fails, it displays an error message to the user.

## 4. Data Flow: From Frontend to Backend

Here is the complete data flow for creating a post:

1.  The user opens `create-post.html` in their browser.
2.  The user enters a description in the `textarea` and selects an image or video using the file `input`.
3.  The user clicks the "Publish Post" button.
4.  The `submit` event is triggered on the form.
5.  `create-post.js` prevents the default form submission.
6.  The script creates a `FormData` object and appends the post text and media file to it.
7.  The `API.createPost(formData)` method is called.
8.  `api.js` sends a `POST` request to `http://localhost:8000/posts/`. The `Authorization` header with the user's JWT token is included in the request, and the `FormData` object is sent as the request body.
9.  The backend (FastAPI) receives the request at the `/posts/` endpoint.
10. The backend processes the request, uploads the media file to Cloudinary (if present), creates a new post in the database, and returns a JSON response.
11. The frontend receives the response. If it's a success, it shows a success message and redirects the user. If it's an error, it displays an error message.

## 5. Conclusion

The `create-post.html` and `create-post.js` files work together to provide a seamless user experience for creating a new post. The HTML provides the structure, and the JavaScript provides the interactivity, data handling, and communication with the backend. This separation of concerns is a fundamental principle of modern web development.
