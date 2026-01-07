// ===================================
// SISTEMA DE LOADING PARA LOGIN
// ===================================

class LoginLoader {
    constructor() {
        this.overlay = null;
        this.progressBar = null;
        this.loadingText = null;
        this.loadingSubtext = null;
        this.currentStep = 0;
        this.steps = [
            { text: "Verificando credenciales", subtext: "Validando usuario y contraseña", progress: 25 },
            { text: "Autenticando usuario", subtext: "Estableciendo sesión segura", progress: 50 },
            { text: "Cargando perfil", subtext: "Obteniendo información del usuario", progress: 75 },
            { text: "Redirigiendo", subtext: "Accediendo al sistema", progress: 100 }
        ];
        this.init();
    }

    init() {
        this.createLoadingOverlay();
        this.setupFormListener();
    }

    createLoadingOverlay() {
        // Crear el overlay principal
        this.overlay = document.createElement('div');
        this.overlay.className = 'login-loading-overlay';
        this.overlay.id = 'loginLoadingOverlay';

        // Crear el contenido del loading
        this.overlay.innerHTML = `
            <div class="login-loading-particles" id="loginParticles"></div>
            <div class="login-loading-content">
                <img src="../Images/logo_SIE.png" alt="Logo" class="login-loading-logo" id="loadingLogo">
                <div class="login-loading-spinner"></div>
                <div class="login-loading-text" id="loadingText">Iniciando sesión<span class="loading-dots"></span></div>
                <div class="login-loading-subtext" id="loadingSubtext">Por favor espere</div>
                <div class="login-progress-bar">
                    <div class="login-progress-fill" id="progressFill"></div>
                </div>
            </div>
            <div class="login-messages" id="loginMessages"></div>
        `;

        document.body.appendChild(this.overlay);

        // Obtener referencias a los elementos
        this.progressBar = document.getElementById('progressFill');
        this.loadingText = document.getElementById('loadingText');
        this.loadingSubtext = document.getElementById('loadingSubtext');

        // Crear partículas de fondo
        this.createParticles();
    }

    createParticles() {
        const particlesContainer = document.getElementById('loginParticles');
        const particleCount = 15;

        for (let i = 0; i < particleCount; i++) {
            const particle = document.createElement('div');
            particle.className = 'particle';
            particle.style.left = Math.random() * 100 + '%';
            particle.style.animationDelay = Math.random() * 8 + 's';
            particle.style.animationDuration = (Math.random() * 3 + 5) + 's';
            particlesContainer.appendChild(particle);
        }
    }

    setupFormListener() {
        const loginForm = document.getElementById('loginForm');
        const loginButton = loginForm.querySelector('button[type="submit"]');

        if (loginForm) {
            loginForm.addEventListener('submit', (e) => {
                e.preventDefault();
                this.handleLogin();
            });
        }

        // Guardar texto original del botón
        if (loginButton && !loginButton.dataset.originalText) {
            loginButton.dataset.originalText = loginButton.textContent;
        }
    }

    async handleLogin() {
        const username = document.getElementById('username').value;
        const password = document.getElementById('password').value;
        const errorMessage = document.getElementById('error-message');
        const loginButton = document.querySelector('#loginForm button[type="submit"]');

        // Limpiar mensajes de error anteriores
        if (errorMessage) {
            errorMessage.textContent = '';
            errorMessage.style.display = 'none';
        }

        // Validar campos
        if (!username || !password) {
            this.showError('Por favor complete todos los campos');
            return;
        }

        try {
            // Activar loading en el botón
            this.setButtonLoading(loginButton, true);

            // Mostrar overlay de loading
            this.showLoading();

            // Simular proceso de login con pasos
            await this.processLoginSteps();

            // Aquí iría tu lógica real de autenticación
            const loginResult = await this.authenticateUser(username, password);

            if (loginResult.success) {
                await this.showSuccessAndRedirect(loginResult.redirectUrl || '../HTML/home_admin.html');
            } else {
                throw new Error(loginResult.message || 'Credenciales inválidas');
            }

        } catch (error) {
            this.hideLoading();
            this.setButtonLoading(loginButton, false);
            this.showError(error.message || 'Error al iniciar sesión');
        }
    }

    async processLoginSteps() {
        for (let i = 0; i < this.steps.length; i++) {
            const step = this.steps[i];

            // Actualizar texto y progreso
            this.updateLoadingText(step.text, step.subtext);
            this.updateProgress(step.progress);

            // Simular tiempo de procesamiento
            await this.delay(800 + Math.random() * 400);
        }
    }

    async authenticateUser(username, password) {
        // Aquí deberías hacer la llamada real a tu API
        // Por ahora, simulamos la respuesta
        await this.delay(500);

        // Ejemplo de validación simple (reemplaza con tu lógica real)
        if (username === 'admin' && password === 'admin') {
            return { success: true, redirectUrl: '../HTML/home_admin.html' };
        } else if (username === 'user' && password === 'user') {
            return { success: true, redirectUrl: '../HTML/home_user.html' };
        } else {
            return { success: false, message: 'Usuario o contraseña incorrectos' };
        }

        // Ejemplo de llamada a API real:
        /*
        try {
            const response = await fetch('/api/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ username, password })
            });

            const data = await response.json();
            return data;
        } catch (error) {
            throw new Error('Error de conexión');
        }
        */
    }

    showLoading() {
        this.overlay.classList.add('active');
        document.body.style.overflow = 'hidden';
    }

    hideLoading() {
        this.overlay.classList.remove('active');
        document.body.style.overflow = '';
        this.resetProgress();
    }

    updateLoadingText(text, subtext) {
        if (this.loadingText) {
            this.loadingText.innerHTML = text + '<span class="loading-dots"></span>';
        }
        if (this.loadingSubtext) {
            this.loadingSubtext.textContent = subtext;
        }
    }

    updateProgress(percentage) {
        if (this.progressBar) {
            this.progressBar.style.width = percentage + '%';
        }
    }

    resetProgress() {
        this.currentStep = 0;
        if (this.progressBar) {
            this.progressBar.style.width = '0%';
        }
        this.updateLoadingText('Iniciando sesión', 'Por favor espere');
    }

    async showSuccessAndRedirect(redirectUrl) {
        // Mostrar mensaje de éxito
        this.updateLoadingText('¡Bienvenido!', 'Ingreso exitoso');
        this.updateProgress(100);

        const messagesContainer = document.getElementById('loginMessages');
        if (messagesContainer) {
            const successMessage = document.createElement('div');
            successMessage.className = 'login-success-message';
            successMessage.textContent = '✓ Autenticación exitosa';
            messagesContainer.appendChild(successMessage);

            // Mostrar mensaje con animación
            setTimeout(() => {
                successMessage.classList.add('show');
            }, 100);
        }

        // Esperar un momento antes de redirigir
        await this.delay(1500);

        // Redirigir
        window.location.href = redirectUrl;
    }

    setButtonLoading(button, loading) {
        if (!button) return;

        if (loading) {
            button.classList.add('login-btn-loading');
            button.disabled = true;
        } else {
            button.classList.remove('login-btn-loading');
            button.disabled = false;
        }
    }

    showError(message) {
        const errorMessage = document.getElementById('error-message');
        if (errorMessage) {
            errorMessage.textContent = message;
            errorMessage.style.display = 'block';
        }
    }

    delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
}


document.addEventListener("DOMContentLoaded", function () {
    document.getElementById('loginForm').addEventListener('submit', async function(event) {
        event.preventDefault();
        window.loginLoader = new LoginLoader();

        const API_BASE_URL = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
            ? 'http://localhost:5152'  // Local
            : 'https://administracionsie.onrender.com';  // Producción

        console.log('Submit detectado');

        const username = document.getElementById('username').value.trim();
        const password = document.getElementById('password').value.trim();
        const errorMessage = document.getElementById('error-message');

        if (!username || !password) {
            errorMessage.textContent = 'Por favor ingresa usuario y contraseña.';
            return;
        }

        const apiUrlLogin = `${API_BASE_URL}/api/SIE/Obtener-usuario-por-credenciales`;

        try {
            const response = await fetch(apiUrlLogin, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    nickName: username,
                    contrasena: password
                })
            });




            const data = await response.json();

            if (!response.ok) {
                // Si la respuesta no es exitosa (ej. 400, 401), el backend envía un JSON con un mensaje de error.

                throw new Error(data.error || '* Usuario y/o contraseña incorrectos.');

            }



            if (!data.token) {
                errorMessage.textContent = 'No se recibió el token.';
                return;
            }

            // Decodificar el token JWT para obtener el rol
            console.log('Token recibido:', data.token);
            const decodedToken = parseJwt(data.token);
            console.log('Token decodificado:', decodedToken);
            const userRole = decodedToken.role;
            console.log('Rol del usuario:', userRole);



            if (userRole === 'Administrador') {
                // Guardar datos específicos para el administrador
                localStorage.setItem('admin_username', username);
                sessionStorage.setItem('admin_password', password);
                localStorage.setItem('admin_token', data.token);

                window.location.href = `${API_BASE_URL}/Pages/Home_Admin_Page.html`;
            }
            else if (userRole === 'Usuario') {
                // Guardar datos específicos para el usuario
                localStorage.setItem('user_username', username);
                sessionStorage.setItem('user_password', password);
                localStorage.setItem('user_token', data.token);

                window.location.href = `${API_BASE_URL}/Pages/Home_User_Page.html`;
            }
            else {
                errorMessage.textContent = 'Rol desconocido. Contacte al administrador.';
            }

        } catch (error) {
            console.error('Error al iniciar sesión:', error);
            errorMessage.textContent = 'Ocurrió un error. Inténtalo de nuevo más tarde.';
        }
    });
});

function parseJwt(token) {
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(
        atob(base64).split('').map(c =>
            '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2)
        ).join('')
    );
    return JSON.parse(jsonPayload);
}

// ===================================
// FUNCIONES GLOBALES PARA USO MANUAL
// ===================================

window.LoginUtils = {
    showLoading: () => {
        if (window.loginLoader) {
            window.loginLoader.showLoading();
        }
    },

    hideLoading: () => {
        if (window.loginLoader) {
            window.loginLoader.hideLoading();
        }
    },

    updateProgress: (percentage, text, subtext) => {
        if (window.loginLoader) {
            window.loginLoader.updateProgress(percentage);
            if (text) window.loginLoader.updateLoadingText(text, subtext || '');
        }
    }
};