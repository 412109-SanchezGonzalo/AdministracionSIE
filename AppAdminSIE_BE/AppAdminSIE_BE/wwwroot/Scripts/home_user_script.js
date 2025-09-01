
document.addEventListener('DOMContentLoaded', async function () {

    const navbarToggle = document.querySelector('.navbar-toggle');
    const navbarMenu = document.querySelector('.navbar-menu');
    const saludoSpan = document.querySelector('.navbar-saludo');

    const btnPendingTasks = document.getElementById('btnTareasPendientes');


    try {
        const password = localStorage.getItem('user_password');
        console.log('🔐 User password:', password);

        const response = await fetch('https://administracionsie.onrender.com/api/SIE/Obtener-nombre-de-usuario-por-contrasena', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(password)
        });

        saludoSpan.textContent = response.ok
            ? `Hola, ${await response.text()} !`
            : 'Hola, Usuario !';
    } catch (error) {
        console.log('⚠️ Error en autenticación admin:', error);
        saludoSpan.textContent = 'Hola, Usuario !';
    }

    navbarToggle.addEventListener('click', () => {
        window.location.href = "https://administracionsie.onrender.com/Pages/Login_page.html";
    });


    async function openModalPendingTasks() {
        try {
            const password = localStorage.getItem('user_password');
            console.log('🔐 User password:', password);

            const response = await fetch('https://administracionsie.onrender.com/api/SIE/Obtener-id-usuario-por-contrasena', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(password)
            });

            const employeeId = await response.text();
            console.log('Realizando consulta para empleado ID:' + employeeId);

            const response2 = await fetch(`https://administracionsie.onrender.com/api/SIE/Obtener-servicioXusuario-por-usuario?userId=${employeeId}`);

            if (!response2.ok) {
                throw new Error(`HTTP error! status: ${response2.status}`);
            }

            const data = await response2.json();
            console.log('Datos obtenidos de la API:', data);

            if (Array.isArray(data) && data.length > 0) {
                const primerRegistro = data[0];
                console.log('Primer registro:', primerRegistro);

                // Llenar los campos
                const activityDisplay = document.getElementById('task-activity-display');
                const buildingDisplay = document.getElementById('task-building-display');
                const startDateDisplay = document.getElementById('task-start-date-display');
                const observationsDisplay = document.getElementById('task-observations-display');

                if (activityDisplay) {
                    activityDisplay.textContent = primerRegistro.nombreServicio || 'Sin actividad asignada';
                }
                if (buildingDisplay) {
                    buildingDisplay.textContent = primerRegistro.nombreEdificio || 'Sin edificio asignado';
                }
                if (startDateDisplay) {
                    if (primerRegistro.fecha) {
                        const fecha = new Date(primerRegistro.fecha);
                        if (!isNaN(fecha.getTime())) {
                            startDateDisplay.textContent = fecha.toLocaleDateString('es-ES');
                        } else {
                            startDateDisplay.textContent = 'Fecha no válida';
                        }
                    } else {
                        startDateDisplay.textContent = 'Sin fecha asignada';
                    }
                }
                if (observationsDisplay) {
                    observationsDisplay.textContent = primerRegistro.observaciones || 'Sin observaciones';
                }

                // Crear y mostrar el modal
                const modalElement = document.getElementById('modal-pending-tasks');
                const modal = new bootstrap.Modal(modalElement, {
                    backdrop: true,  // Permite cerrar clickeando fuera
                    keyboard: true   // Permite cerrar con ESC
                });

                modal.show();

                // Event listeners para cerrar el modal
                const closeButtons = modalElement.querySelectorAll('[data-bs-dismiss="modal"]');
                closeButtons.forEach(button => {
                    button.addEventListener('click', function() {
                        modal.hide();
                    });
                });

                console.log('Modal Tareas Pendientes abierto correctamente');

            } else {
                console.log('No se encontraron tareas asignadas para este empleado');
                alert("No tienes tareas asignadas");
            }

        } catch (error) {
            console.error('Error al obtener datos de la API:', error);
            alert('Error al cargar las tareas del empleado: ' + error.message);
        }
    }


    btnPendingTasks.addEventListener('click', openModalPendingTasks);
    btnPendingTasks.addEventListener('touchstart', openModalPendingTasks);

});
