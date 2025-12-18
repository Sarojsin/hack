// frontend/js/auth.js
document.addEventListener('DOMContentLoaded', function() {
    // Check authentication on all pages
    const publicPages = ['login.html', 'signup.html'];
    const currentPage = window.location.pathname.split('/').pop();
    
    const token = localStorage.getItem('token');
    const user = localStorage.getItem('user');
    
    // Redirect logic
    if (token && publicPages.includes(currentPage)) {
        window.location.href = 'index.html';
    }
    
    if (!token && !publicPages.includes(currentPage)) {
        window.location.href = 'login.html';
    }
    
    // Logout button
    const logoutBtn = document.getElementById('logoutBtn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', function() {
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            window.location.href = 'login.html';
        });
    }
    
    // Signup form
    const signupForm = document.getElementById('signupForm');
    if (signupForm) {
        signupForm.addEventListener('submit', async function(e) {
            e.preventDefault();
            
            const userData = {
                username: document.getElementById('username').value,
                phone_number: document.getElementById('phone').value,
                password: document.getElementById('password').value,
                national_id: document.getElementById('nationalId').value
            };
            
            try {
                const result = await API.signup(userData);
                showMessage('Account created successfully! Redirecting to login...', 'success');
                
                setTimeout(() => {
                    window.location.href = 'login.html';
                }, 2000);
            } catch (error) {
                showMessage(error.message, 'error');
            }
        });
        
        // Password strength indicator
        const passwordInput = document.getElementById('password');
        const strengthBars = document.querySelectorAll('.strength-bar');
        
        passwordInput.addEventListener('input', function() {
            const password = this.value;
            let strength = 0;
            
            if (password.length >= 8) strength++;
            if (/[A-Z]/.test(password)) strength++;
            if (/[0-9]/.test(password)) strength++;
            if (/[^A-Za-z0-9]/.test(password)) strength++;
            
            strengthBars.forEach((bar, index) => {
                if (index < strength) {
                    bar.style.background = getStrengthColor(strength);
                } else {
                    bar.style.background = 'var(--border-color)';
                }
            });
        });
    }
    
    // Login form
    const loginForm = document.getElementById('loginForm');
    if (loginForm) {
        loginForm.addEventListener('submit', async function(e) {
            e.preventDefault();
            
            const credentials = {
                phone_number: document.getElementById('phone').value,
                password: document.getElementById('password').value
            };
            
            try {
                const result = await API.login(credentials);
                localStorage.setItem('token', result.access_token);
                
                // Get user info
                const user = await API.getCurrentUser();
                localStorage.setItem('user', JSON.stringify(user));
                
                showMessage('Login successful! Redirecting...', 'success');
                
                setTimeout(() => {
                    window.location.href = 'index.html';
                }, 1000);
            } catch (error) {
                showMessage('Invalid phone number or password', 'error');
            }
        });
    }
    
    // Helper functions
    function showMessage(text, type) {
        const messageDiv = document.getElementById('message');
        messageDiv.textContent = text;
        messageDiv.className = `message ${type}`;
        
        setTimeout(() => {
            messageDiv.style.display = 'none';
        }, 5000);
    }
    
    function getStrengthColor(strength) {
        switch(strength) {
            case 1: return '#ff6b6b';
            case 2: return '#ffd93d';
            case 3: return '#4cc9f0';
            case 4: return '#6bcf7f';
            default: return 'var(--border-color)';
        }
    }
});