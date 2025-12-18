// frontend/js/api.js
const API_BASE_URL = 'http://localhost:8000';

class API {
    static async request(endpoint, options = {}) {
        const token = localStorage.getItem('token');
        const headers = {
            'Content-Type': 'application/json',
            ...options.headers
        };

        if (token) {
            headers['Authorization'] = `Bearer ${token}`;
        }

        const config = {
            ...options,
            headers
        };

        try {
            const response = await fetch(`${API_BASE_URL}${endpoint}`, config);
            
            if (response.status === 401) {
                // Token expired or invalid
                localStorage.removeItem('token');
                localStorage.removeItem('user');
                window.location.href = 'login.html';
                return;
            }

            const data = await response.json();
            
            if (!response.ok) {
                throw new Error(data.detail || 'Request failed');
            }

            return data;
        } catch (error) {
            console.error('API Error:', error);
            throw error;
        }
    }

    // Auth endpoints
    static async signup(userData) {
        return this.request('/auth/signup', {
            method: 'POST',
            body: JSON.stringify(userData)
        });
    }

    static async login(credentials) {
        return this.request('/auth/login', {
            method: 'POST',
            body: JSON.stringify(credentials)
        });
    }

    static async getCurrentUser() {
        return this.request('/auth/me');
    }

    // Post endpoints
    static async createPost(formData) {
        const token = localStorage.getItem('token');
        const response = await fetch(`${API_BASE_URL}/posts/`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`
            },
            body: formData
        });
        return response.json();
    }

    static async getAllPosts() {
        return this.request('/posts/');
    }

    static async getMyPosts() {
        return this.request('/posts/my-posts');
    }

    static async getPost(id) {
        return this.request(`/posts/${id}`);
    }

    static async updatePost(id, data) {
        return this.request(`/posts/${id}`, {
            method: 'PUT',
            body: JSON.stringify(data)
        });
    }

    static async deletePost(id) {
        return this.request(`/posts/${id}`, {
            method: 'DELETE'
        });
    }

    // Ranking endpoints
    static async addRanking(data) {
        return this.request('/rankings/', {
            method: 'POST',
            body: JSON.stringify(data)
        });
    }

    static async getPostRankingStats(postId) {
        return this.request(`/rankings/post/${postId}/stats`);
    }

    static async getMyRanking(postId) {
        return this.request(`/rankings/post/${postId}/my-ranking`);
    }
}