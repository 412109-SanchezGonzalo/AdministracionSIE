document.addEventListener("DOMContentLoaded", function () {
    document.getElementById('loginForm').addEventListener('submit', async function(event) {
        event.preventDefault();

        console.log('Submit detectado');

        const username = document.getElementById('username').value.trim();
        const password = document.getElementById('password').value.trim();
        const errorMessage = document.getElementById('error-message');

        if (!username || !password) {
            errorMessage.textContent = 'Por favor ingresa usuario y contraseña.';
            return;
        }

        const apiUrlLogin = 'https://administracionsie.onrender.com/api/SIE/Obtener-usuario-por-credenciales';

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
                // Si la respuesta no es exitosa (ej. 400, 401), el backend envía un JSON con un mensaje de error.
                const errorData = await response.json();
                errorMessage.textContent = errorData.message || '* Usuario y/o contraseña incorrectos.';
                return;
            }

            const data = await response.json();

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
                localStorage.setItem('admin_password', password);
                localStorage.setItem('admin_token', data.token);

                window.location.href = 'https://administracionsie.onrender.com/Pages/Home_Admin_Page.html';
            }
            else if (userRole === 'Usuario') {
                // Guardar datos específicos para el usuario
                localStorage.setItem('user_username', username);
                localStorage.setItem('user_password', password);
                localStorage.setItem('user_token', data.token);

                window.location.href = 'https://administracionsie.onrender.com/Pages/Home_User_Page.html';
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