document.addEventListener("DOMContentLoaded", function () {
    document.getElementById('loginForm').addEventListener('submit', async function(event) {
        event.preventDefault();

        const username = document.getElementById('username').value.trim();
        const password = document.getElementById('password').value.trim();
        const errorMessage = document.getElementById('error-message');

        if (!username || !password) {
            errorMessage.textContent = 'Por favor ingresa usuario y contraseña.';
            return;
        }

        const apiUrlLogin = 'https://localhost:7040/api/SIE/Obtener-usuario-por-credenciales';

        try {
            const response = await fetch(apiUrlLogin, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    nickName: username,
                    contrasena: password
                })
            });

            if (!response.ok) {
                const errorData = await response.json();
                errorMessage.textContent = errorData.message || '* Usuario y/o contraseña incorrectos.';
                return;
            }

            const data = await response.json();

            if (!data.token) {
                errorMessage.textContent = 'No se recibió el token.';
                return;
            }

            // Guardar datos en sessionStorage para usar en Home
            localStorage.setItem('token', data.token);
            localStorage.setItem('password', password); // Si necesitas consumir API por contraseña
            localStorage.setItem('username', username);

            const decodedToken = parseJwt(data.token);
            const userRole = decodedToken.role;

            if (userRole === 'Administrador') {
                window.location.href = 'https://www.mercadolibre.com.ar/';
            } else if (userRole === 'Usuario') {
                window.location.href = 'http://localhost:63342/JobOclock_FrontEnd/Pages/Home_User_Page.html';
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
