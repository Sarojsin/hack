# How the Frontend and Backend are Connected

This document provides a detailed explanation of how the frontend and backend of this application communicate with each other.

## 1. Introduction

This application follows a **client-server architecture**.

*   **Frontend (Client):** The user interface of the application, built with HTML, CSS, and JavaScript. It runs in the user's web browser.
*   **Backend (Server):** The "brains" of the application, built with Python and the FastAPI framework. It handles business logic, database interactions, and authentication.

The frontend and backend are two separate applications that communicate over the network using **HTTP requests**. The frontend sends requests to the backend to fetch data, create new data, update existing data, or delete data. The backend processes these requests and sends back responses, usually in the **JSON** (JavaScript Object Notation) format.

## 2. Frontend (Client-Side)

The primary file responsible for communication with the backend is `frontend/js/api.js`. This file contains an `API` class with static methods for making requests to the different backend endpoints.

### Making API Requests

The `API.request()` method is the core of the frontend's communication with the backend. It uses the browser's built-in `fetch` API to send HTTP requests.

Here's a breakdown of how it works:

1.  **`API_BASE_URL`:** The `API_BASE_URL` constant is defined at the top of the file:
    ```javascript
    const API_BASE_URL = 'http://localhost:8000';
    ```
    This tells the frontend that the backend server is running on `http://localhost:8000`. All API requests will be sent to this address.

2.  **`API.request(endpoint, options = {})`:** This is a generic method for making API calls.
    *   `endpoint`: The specific path of the API endpoint to call (e.g., `/auth/login`).
    *   `options`: An object that can contain the HTTP method (`GET`, `POST`, `PUT`, `DELETE`), headers, and the request body.

3.  **Authentication:** The application uses **JSON Web Tokens (JWT)** for authentication.
    *   When a user logs in, the backend sends a JWT to the frontend.
    *   The frontend stores this token in the browser's `localStorage`.
    *   For every subsequent request to a protected endpoint, the `API.request()` method retrieves the token from `localStorage` and adds it to the `Authorization` header of the request:
        ```javascript
        if (token) {
            headers['Authorization'] = `Bearer ${token}`;
        }
        ```
    *   The backend then verifies this token to authenticate the user.

## 3. Backend (Server-Side)

The backend is a FastAPI application. The `backend/app/routes/` directory contains the definitions of the API endpoints. Each file in this directory (`auth.py`, `posts.py`, `rankings.py`) defines a set of related routes.

### API Endpoints

The backend uses FastAPI's `APIRouter` to organize the endpoints. Here's how the frontend API calls map to the backend routes:

| Frontend `API` Method              | HTTP Method | Backend Route                              | Backend Function                   |
| ---------------------------------- | ----------- | ------------------------------------------ | ---------------------------------- |
| `API.signup(userData)`             | `POST`      | `/auth/signup`                             | `signup()` in `auth.py`            |
| `API.login(credentials)`           | `POST`      | `/auth/login`                              | `login()` in `auth.py`             |
| `API.getCurrentUser()`             | `GET`       | `/auth/me`                                 | `get_current_user_info()` in `auth.py` |
| `API.createPost(formData)`         | `POST`      | `/posts/`                                  | `create_post()` in `posts.py`      |
| `API.getAllPosts()`                | `GET`       | `/posts/`                                  | `get_all_posts()` in `posts.py`    |
| `API.getMyPosts()`                 | `GET`       | `/posts/my-posts`                          | `get_my_posts()` in `posts.py`     |
| `API.getPost(id)`                  | `GET`       | `/posts/{post_id}`                         | `get_post()` in `posts.py`         |
| `API.updatePost(id, data)`         | `PUT`       | `/posts/{post_id}`                         | `update_post()` in `posts.py`      |
| `API.deletePost(id)`               | `DELETE`    | `/posts/{post_id}`                         | `delete_post()` in `posts.py`      |
| `API.addRanking(data)`             | `POST`      | `/rankings/`                               | `create_or_update_ranking()` in `rankings.py` |
| `API.getPostRankingStats(postId)`  | `GET`       | `/rankings/post/{post_id}/stats`           | `get_post_ranking_stats()` in `rankings.py` |
| `API.getMyRanking(postId)`         | `GET`       | `/rankings/post/{post_id}/my-ranking`      | `get_my_ranking_for_post()` in `rankings.py` |

## 4. Data Flow Example: Creating a Post

Here's the step-by-step data flow when a user creates a new post:

1.  **User Interaction:** The user fills out the "create post" form in the browser and clicks "Submit".
2.  **Frontend:**
    *   The JavaScript code in `create-post.js` captures the form data.
    *   It calls the `API.createPost(formData)` method from `api.js`.
    *   The `createPost` method creates a `FormData` object and sends a `POST` request to `http://localhost:8000/posts/` with the form data in the request body. The JWT token is included in the `Authorization` header.
3.  **Backend:**
    *   The FastAPI backend receives the `POST` request.
    *   It matches the `/posts/` endpoint to the `create_post()` function in `backend/app/routes/posts.py`.
    *   The `get_current_user` dependency is executed, which verifies the JWT token and retrieves the current user's information from the database.
    *   The `create_post()` function processes the request:
        *   If a media file was uploaded, it's uploaded to Cloudinary.
        *   A new `Post` record is created in the database with the provided text, media URL, and the user's ID.
    *   The backend sends a JSON response back to the frontend, containing the data of the newly created post.
4.  **Frontend:**
    *   The frontend receives the successful response from the backend.
    *   The `create-post.js` file might then redirect the user to the "My Posts" page or display a success message.

## 5. Conclusion

The connection between the frontend and backend is a classic example of a RESTful API architecture. The frontend is responsible for the user interface and user experience, while the backend handles the heavy lifting of data processing and storage. This separation of concerns makes the application more modular, scalable, and easier to maintain.
