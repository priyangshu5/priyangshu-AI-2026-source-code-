// Login Page JavaScript

document.addEventListener('DOMContentLoaded', function() {
    // DOM Elements
    const googleLoginBtn = document.getElementById('googleLogin');
    const emailLoginForm = document.getElementById('emailLoginForm');
    const demoLoginBtn = document.getElementById('demoLogin');
    const signupLink = document.getElementById('signupLink');
    const togglePassword = document.getElementById('togglePassword');
    const passwordInput = document.getElementById('password');
    const loadingModal = document.getElementById('loadingModal');
    const signupModal = document.getElementById('signupModal');
    const closeSignupModal = document.getElementById('closeSignupModal');
    const gotoDemo = document.getElementById('gotoDemo');

    // Toggle password visibility
    togglePassword.addEventListener('click', function() {
        const type = passwordInput.getAttribute('type') === 'password' ? 'text' : 'password';
        passwordInput.setAttribute('type', type);
        this.innerHTML = type === 'password' ? '<i class="fas fa-eye"></i>' : '<i class="fas fa-eye-slash"></i>';
    });

    // Google Login Button
    googleLoginBtn.addEventListener('click', function(e) {
        e.preventDefault();
        showLoading('Signing in with Google...');
        
        // Simulate Google login process
        setTimeout(() => {
            // In production, this would redirect to Google OAuth
            // For prototype, we'll simulate successful login
            simulateLogin();
        }, 1500);
    });

    // Email Login Form
    emailLoginForm.addEventListener('submit', function(e) {
        e.preventDefault();
        
        const email = document.getElementById('email').value;
        const password = document.getElementById('password').value;
        
        if (!email || !password) {
            showNotification('Please fill in all fields', 'error');
            return;
        }
        
        if (!validateEmail(email)) {
            showNotification('Please enter a valid email address', 'error');
            return;
        }
        
        showLoading('Signing in...');
        
        // Simulate API call
        setTimeout(() => {
            simulateLogin();
        }, 2000);
    });

    // Demo Login
    demoLoginBtn.addEventListener('click', function() {
        showLoading('Loading demo version...');
        
        // Store demo flag in localStorage
        localStorage.setItem('demoUser', 'true');
        localStorage.setItem('userEmail', 'demo@priyangshuai.com');
        
        setTimeout(() => {
            window.location.href = 'dashboard.html';
        }, 1500);
    });

    // Signup Link
    signupLink.addEventListener('click', function(e) {
        e.preventDefault();
        signupModal.style.display = 'flex';
    });

    // Close Signup Modal
    closeSignupModal.addEventListener('click', function() {
        signupModal.style.display = 'none';
    });

    // Go to Demo from Signup Modal
    gotoDemo.addEventListener('click', function() {
        signupModal.style.display = 'none';
        demoLoginBtn.click();
    });

    // Close modal when clicking outside
    window.addEventListener('click', function(e) {
        if (e.target === signupModal) {
            signupModal.style.display = 'none';
        }
        if (e.target === loadingModal) {
            loadingModal.style.display = 'none';
        }
    });

    // Form input animations
    const inputs = document.querySelectorAll('input');
    inputs.forEach(input => {
        input.addEventListener('focus', function() {
            this.parentElement.style.borderColor = '#10a37f';
            this.parentElement.style.boxShadow = '0 0 0 3px rgba(16, 163, 127, 0.1)';
        });
        
        input.addEventListener('blur', function() {
            this.parentElement.style.borderColor = '#e5e7eb';
            this.parentElement.style.boxShadow = 'none';
        });
    });

    // Helper Functions
    function validateEmail(email) {
        const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return re.test(email);
    }

    function showLoading(message) {
        const loadingContent = loadingModal.querySelector('h3');
        if (message) {
            loadingContent.textContent = message;
        }
        loadingModal.style.display = 'flex';
    }

    function simulateLogin() {
        // Simulate successful login
        const rememberMe = document.getElementById('rememberMe').checked;
        const email = document.getElementById('email').value || 'user@priyangshuai.com';
        
        // Store user data (in prototype, we use localStorage)
        if (rememberMe) {
            localStorage.setItem('rememberUser', 'true');
            localStorage.setItem('userEmail', email);
        }
        
        // Show success message
        const loadingContent = loadingModal.querySelector('h3');
        loadingContent.textContent = 'Login successful!';
        loadingModal.querySelector('p').textContent = 'Redirecting to dashboard...';
        
        // Redirect to dashboard
        setTimeout(() => {
            window.location.href = 'dashboard.html';
        }, 1000);
    }

    function showNotification(message, type = 'success') {
        // Remove existing notification
        const existingNotification = document.querySelector('.notification');
        if (existingNotification) {
            existingNotification.remove();
        }
        
        // Create notification element
        const notification = document.createElement('div');
        notification.className = `notification ${type}`;
        notification.innerHTML = `
            <i class="fas fa-${type === 'success' ? 'check-circle' : 'exclamation-circle'}"></i>
            <span>${message}</span>
            <button class="close-notification">&times;</button>
        `;
        
        // Add to page
        document.body.appendChild(notification);
        
        // Add styles
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: ${type === 'success' ? '#10a37f' : '#ef4444'};
            color: white;
            padding: 16px 20px;
            border-radius: 12px;
            display: flex;
            align-items: center;
            gap: 12px;
            box-shadow: 0 4px 12px rgba(0,0,0,0.15);
            z-index: 9999;
            animation: slideInRight 0.3s ease;
            max-width: 400px;
        `;
        
        // Add close button functionality
        notification.querySelector('.close-notification').addEventListener('click', function() {
            notification.style.animation = 'slideOutRight 0.3s ease';
            setTimeout(() => notification.remove(), 300);
        });
        
        // Auto remove after 5 seconds
        setTimeout(() => {
            if (notification.parentNode) {
                notification.style.animation = 'slideOutRight 0.3s ease';
                setTimeout(() => notification.remove(), 300);
            }
        }, 5000);
        
        // Add keyframes for animation
        if (!document.querySelector('#notification-styles')) {
            const style = document.createElement('style');
            style.id = 'notification-styles';
            style.textContent = `
                @keyframes slideInRight {
                    from {
                        transform: translateX(100%);
                        opacity: 0;
                    }
                    to {
                        transform: translateX(0);
                        opacity: 1;
                    }
                }
                @keyframes slideOutRight {
                    from {
                        transform: translateX(0);
                        opacity: 1;
                    }
                    to {
                        transform: translateX(100%);
                        opacity: 0;
                    }
                }
            `;
            document.head.appendChild(style);
        }
    }

    // Check for saved credentials
    function checkSavedCredentials() {
        const rememberUser = localStorage.getItem('rememberUser');
        const savedEmail = localStorage.getItem('userEmail');
        
        if (rememberUser === 'true' && savedEmail) {
            document.getElementById('email').value = savedEmail;
            document.getElementById('rememberMe').checked = true;
        }
    }

    // Initialize
    checkSavedCredentials();
    
    // Add notification styles
    if (!document.querySelector('#notification-styles')) {
        const style = document.createElement('style');
        style.id = 'notification-styles';
        style.textContent = `
            .notification {
                font-family: 'Inter', sans-serif;
            }
            .close-notification {
                background: none;
                border: none;
                color: white;
                font-size: 20px;
                cursor: pointer;
                padding: 0;
                width: 24px;
                height: 24px;
                display: flex;
                align-items: center;
                justify-content: center;
                margin-left: auto;
            }
            .close-notification:hover {
                opacity: 0.8;
            }
        `;
        document.head.appendChild(style);
    }
});
