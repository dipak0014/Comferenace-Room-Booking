// Initialize particles on load
let particleInterval;

function initParticles() {
    const particles = document.getElementById('particles');
    if (!particles) return;

    function createParticle() {
        const particle = document.createElement('div');
        const size = Math.random() * 3 + 1;
        
        particle.style.cssText = `
            position: absolute;
            background: rgba(255, 255, 255, ${Math.random() * 0.3 + 0.2});
            width: ${size}px;
            height: ${size}px;
            border-radius: 50%;
            pointer-events: none;
            left: ${Math.random() * 100}%;
            top: ${Math.random() * 100}%;
            transform: scale(0);
            animation: particle ${Math.random() * 2 + 2}s ease-in-out infinite;
        `;

        particles.appendChild(particle);

        particle.addEventListener('animationend', () => {
            particle.remove();
        });
    }

    // Clear existing interval if any
    if (particleInterval) {
        clearInterval(particleInterval);
    }

    // Create particles periodically
    particleInterval = setInterval(createParticle, 300);
}

// Form validation functions
function validateEmail(email) {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
}

function validatePassword(password) {
    return password.length >= 6;
}

// Show error message
function showError(input, message) {
    const formGroup = input.closest('.form-group');
    const errorDiv = formGroup.querySelector('.error-message') || document.createElement('div');
    errorDiv.className = 'error-message';
    errorDiv.textContent = message;
    
    if (!formGroup.querySelector('.error-message')) {
        formGroup.appendChild(errorDiv);
    }
    
    input.classList.add('error');
}

// Clear error message
function clearError(input) {
    const formGroup = input.closest('.form-group');
    const errorDiv = formGroup.querySelector('.error-message');
    if (errorDiv) {
        errorDiv.remove();
    }
    input.classList.remove('error');
}

// Add loading state to button
function setButtonLoading(button, isLoading) {
    if (isLoading) {
        button.disabled = true;
        const originalText = button.querySelector('span').textContent;
        button.setAttribute('data-original-text', originalText);
        button.querySelector('span').textContent = 'Loading...';
    } else {
        button.disabled = false;
        const originalText = button.getAttribute('data-original-text');
        if (originalText) {
            button.querySelector('span').textContent = originalText;
        }
    }
}

// Initialize the page

    document.addEventListener('DOMContentLoaded', function () {
        // Toggle password visibility


        // Initialize particles
    initParticles();

    // Toggle password visibility
    document.querySelectorAll('.toggle-password').forEach(button => {
        button.addEventListener('click', function() {
            const input = this.parentElement.querySelector('input');
            const type = input.getAttribute('type') === 'password' ? 'text' : 'password';
            input.setAttribute('type', type);
            
            // Update icon based on password visibility
            this.classList.toggle('showing');
        });
    });

    // Toggle between user and admin login
    const userLoginContainer = document.getElementById('userLogin');
    const adminLoginContainer = document.getElementById('adminLogin');
    const toggleButtons = document.querySelectorAll('.toggle-btn');

    toggleButtons.forEach(button => {
        button.addEventListener('click', function() {
            const loginType = this.getAttribute('data-type');
            
            // Update active button state
            toggleButtons.forEach(btn => btn.classList.remove('active'));
            this.classList.add('active');

            // Animate form transition
            if (loginType === 'admin') {
                userLoginContainer.style.opacity = '0';
                setTimeout(() => {
                    userLoginContainer.classList.add('hidden');
                    adminLoginContainer.classList.remove('hidden');
                    setTimeout(() => {
                        adminLoginContainer.style.opacity = '1';
                    }, 50);
                }, 300);
            } else {
                adminLoginContainer.style.opacity = '0';
                setTimeout(() => {
                    adminLoginContainer.classList.add('hidden');
                    userLoginContainer.classList.remove('hidden');
                    setTimeout(() => {
                        userLoginContainer.style.opacity = '1';
                    }, 50);
                }, 300);
            }
        });
    });

    
        toggleButtons.forEach(button => {
            button.addEventListener('click', function () {
                const input = this.parentElement.querySelector('input');
                const type = input.getAttribute('type');
    
                if (type === 'password') {
                    input.setAttribute('type', 'text');
                    this.innerHTML = `
                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                            <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path>
                            <line x1="1" y1="1" x2="23" y2="23"></line>
                        </svg>
                    `;
                } else {
                    input.setAttribute('type', 'password');
                    this.innerHTML = `
                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                            <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                            <circle cx="12" cy="12" r="3"></circle>
                        </svg>
                    `;
                }
            });
        });
    
        // Form submission with improved error handling
        const loginForm = document.getElementById('loginForm');
    
        loginForm.addEventListener('submit', async function (e) {
            e.preventDefault();
    
            const name = document.getElementById('username').value;
            const password = document.getElementById('password').value;
            const type="employee";
            if (!name || !password) {
                alert('Please enter both name and password.');
                return;
            }
    
            try {
                const response = await fetch('http://192.168.1.7:8080/user', {   // Use your backend IP
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({ name, password ,type})   // Send name & password
                });
    
                if (response.ok) {
                    const result = await response.json();
                    console.log('User authenticated:', result);
    
                    localStorage.setItem('userData', JSON.stringify(result));
    
                // Redirect to the second page
                window.location.href = "User_dash_index.html";
    
                } else {
                    console.error('Failed to authenticate. Response:', response.status);
                    alert('Invalid username or password.');
                }
    
            } catch (error) {
                console.error('Error:', error);
                alert('Network error. Please try again later.');
            }
        });
    
    });
    

    // Handle admin login form
    const adminLoginForm = document.getElementById('adminForm');
    adminLoginForm.addEventListener('submit', async function(e) {
        e.preventDefault();
        
        const name = this.querySelector('#adminId').value;
        const  password  = this.querySelector('#adminPassword').value;
        const type="admin";
        console.log(name,password,type);
        if (!name || !password) {
            alert('Please enter both name and password.');
            return;
        }

        try {
            const response = await fetch('http://192.168.1.7:8080/user', {   // Use your backend IP
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ name, password ,type})   // Send name & password
            });

            if (response.ok) {
                const result = await response.json();
                console.log('User authenticated:', result);

                localStorage.setItem('userData', JSON.stringify(result));

            // Redirect to the second page
            window.location.href = "admin_dashbord.html";

            } else {
                console.error('Failed to authenticate. Response:', response.status);
                alert('Invalid username or password.');
            }

        } catch (error) {
            console.error('Error:', error);
            alert('Network error. Please try again later.');
        }
    });

    // Add input animations
    document.querySelectorAll('input').forEach(input => {
        input.addEventListener('focus', function() {
            this.parentElement.classList.add('focused');
        });

        input.addEventListener('blur', function() {
            if (!this.value) {
                this.parentElement.classList.remove('focused');
            }
        });

        // Initialize with focused class if input has value
        if (input.value) {
            input.parentElement.classList.add('focused');
        }
    });
