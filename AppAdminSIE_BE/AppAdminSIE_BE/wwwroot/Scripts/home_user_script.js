
document.addEventListener('DOMContentLoaded', async function () {

    const navbarToggle = document.querySelector('.navbar-toggle');
    const navbarMenu = document.querySelector('.navbar-menu');
    const saludoSpan = document.querySelector('.navbar-saludo');


    let tareaSeleccionada = [];



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



    // 🔹 Función CORREGIDA para manejar el botón "Ver Tareas"
    async function verTareas() {
        const password = localStorage.getItem('user_password');
        console.log('🔐 User password:', password);

        const response = await fetch('https://administracionsie.onrender.com/api/SIE/Obtener-id-usuario-por-contrasena', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(password)
        });

        const employeeId = await response.text();
        console.log('Realizando consulta para empleado ID:' + employeeId);
        // Llamar a la función que abre el modal
        await openModalVerTask(employeeId);
    }


    // Función ACTUALIZADA para abrir el modal de Ver Tareas con List Group
    async function openModalVerTask(employeeId) {
        console.log('Abriendo modal Ver Tareas para:', { employeeId });

        try {
            console.log('Realizando consulta para empleado ID:', employeeId);

            const response = await fetch(`https://administracionsie.onrender.com/api/SIE/Obtener-servicioXusuario-por-usuario?userId=${employeeId}`);

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.json();
            console.log('Datos obtenidos de la API:', data);

            const modalVerTask = document.getElementById('modal-VerTask');

            if (!modalVerTask) {
                console.error('Modal o input no encontrado');
                return;
            }

            // Procesar los datos de la API
            if (Array.isArray(data) && data.length > 0) {
                console.log(`Empleado tiene ${data.length} tarea(s) asignada(s)`);

                if (data.length === 1) {
                    // Una sola tarea - mostrar directamente en el modal (comportamiento actual)
                    mostrarTareaEnModal(data[0]);
                } else {
                    // Múltiples tareas - mostrar list group
                    mostrarListGroupTareas(data);
                }

                // Mostrar el modal
                modalVerTask.style.display = 'flex';
                console.log('Modal Ver Tareas abierto correctamente');

            } else {
                // No hay datos asignados
                console.log('No se encontraron tareas asignadas para este empleado');
                alert('No tienes tareas asignadas');

            }

        } catch (error) {
            console.error('Error al obtener datos de la API:', error);
            alert('Error al cargar las tareas del empleado: ' + error.message);
        }
    }

    // Función para mostrar una tarea individual en el modal
    function mostrarTareaEnModal(tarea) {
        console.table(tarea);

        // ✅ NUEVO: Limpiar array antes de agregar nueva tarea
        tareaSeleccionada = [];
        tareaSeleccionada.push(tarea);

        console.log('Mostrando tarea individual:', tarea);

        // Limpiar el container del list group (si existe)
        const listGroupContainer = document.getElementById('listGroupContainer');
        if (listGroupContainer) {
            listGroupContainer.style.display = 'none';
        }

        // Mostrar los campos del formulario original
        const formContainer = document.getElementById('formContainer');
        if (formContainer) {
            formContainer.style.display = 'block';
        }

        const activityButton = document.getElementById('activitySelectedByUser');
        const edificioButton = document.getElementById('edificioSelectedByUser');
        const fechaInput = document.getElementById('verDateActivityByUser');
        const observacionesInput = document.getElementById('VerCommentsByUser');

        // Llenar campos con datos de la tarea
        if (activityButton) {
            activityButton.textContent = tarea.nombreServicio || 'Sin actividad asignada';
            activityButton.setAttribute('data-selected', tarea.idServicio || '');
            activityButton.disabled = true;
        }

        if (edificioButton) {
            edificioButton.textContent = tarea.nombreEdificio || 'Sin edificio asignado';
            edificioButton.setAttribute('data-selected', tarea.idEdificio || '');
            edificioButton.disabled = true;
        }

        if (fechaInput && tarea.fecha) {
            const fecha = new Date(tarea.fecha);
            if (!isNaN(fecha.getTime())) {
                fechaInput.value = fecha.toISOString().split('T')[0];
            }
            fechaInput.disabled = true;
        }

        if (observacionesInput) {
            observacionesInput.value = tarea.observaciones || '';
            observacionesInput.disabled = true;
        }

    }

    // Función corregida para mostrar el list group con múltiples tareas
    function mostrarListGroupTareas(tareas) {
        console.log('Mostrando list group con', tareas.length, 'tareas');

        // Ocultar el formulario original
        const formContainer = document.getElementById('formContainer');
        if (formContainer) {
            formContainer.style.display = 'none';
        }

        // Buscar o crear el contenedor del list group
        let listGroupContainer = document.getElementById('listGroupContainer');

        if (!listGroupContainer) {
            console.log('Creando contenedor de list group...');

            // Crear el contenedor
            listGroupContainer = document.createElement('div');
            listGroupContainer.id = 'listGroupContainer';
            listGroupContainer.className = 'mb-3';

            // CORREGIDO: Buscar un elemento que SÍ existe en el HTML
            const modalContent = document.querySelector('#modal-VerTask .modal-content-location');

            if (modalContent) {
                // Insertar después del header pero antes del formContainer
                const headerContainer = modalContent.querySelector('.modal-header-container');
                if (headerContainer) {
                    modalContent.insertBefore(listGroupContainer, headerContainer.nextSibling);
                } else {
                    // Si no encuentra el header, insertar al principio
                    modalContent.insertBefore(listGroupContainer, modalContent.firstChild);
                }
            } else {
                console.error('No se pudo encontrar el contenedor del modal');
                return;
            }

            console.log('Contenedor creado e insertado');
        }

        // Crear el HTML del list group
        listGroupContainer.innerHTML = `
        <label class="form-label"><strong>Tareas Asignadas (${tareas.length})</strong></label>
        <div class="list-group" id="tareasListGroup"></div>
    `;

        listGroupContainer.style.display = 'block';

        // Ahora sí buscar el list group (que acabamos de crear)
        const listGroup = document.getElementById('tareasListGroup');

        if (!listGroup) {
            console.error('Error: No se pudo crear el elemento tareasListGroup');
            return;
        }

        console.log('List group encontrado, agregando tareas...');

        // Crear elementos del list group
        tareas.forEach((tarea, index) => {
            const listItem = document.createElement('a');
            listItem.href = '#';
            listItem.className = 'list-group-item list-group-item-action';

            // Formatear fecha
            let fechaFormateada = 'Sin fecha';
            if (tarea.fecha) {
                const fecha = new Date(tarea.fecha);
                if (!isNaN(fecha.getTime())) {
                    fechaFormateada = fecha.toLocaleDateString('es-ES');
                }
            }

            listItem.innerHTML = `
            <div class="d-flex w-100 justify-content-between">
                <h6 class="mb-1">${tarea.nombreServicio || 'Actividad sin nombre'}</h6>
                <small class="text-muted">${fechaFormateada}</small>
            </div>
            <p class="mb-1"><strong>Edificio:</strong> ${tarea.nombreEdificio || 'Sin edificio'}</p>
            <small class="text-muted">${tarea.observaciones || 'Sin observaciones'}</small>
        `;

            // Agregar event listener para abrir el detalle de la tarea
            listItem.addEventListener('click', (e) => {
                e.preventDefault();
                abrirDetalleTarea(tarea, index);
            });

            listGroup.appendChild(listItem);
        });
    }

    // Función para abrir el detalle de una tarea específica
    function abrirDetalleTarea(tarea, index) {
        console.log('Abriendo detalle de tarea:', tarea);

        // Ocultar el list group
        const listGroupContainer = document.getElementById('listGroupContainer');
        if (listGroupContainer) {
            listGroupContainer.style.display = 'none';
        }

        // Mostrar el formulario
        const formContainer = document.getElementById('formContainer');
        if (formContainer) {
            formContainer.style.display = 'block';
        }

        // Llenar los campos con los datos de la tarea seleccionada
        mostrarTareaEnModal(tarea);

        // Agregar botón para volver a la lista (si hay múltiples tareas)
        let btnVolver = document.getElementById('btnVolverLista');
        if (!btnVolver) {
            btnVolver = document.createElement('button');
            btnVolver.id = 'btnVolverLista';
            btnVolver.type = 'button';
            btnVolver.className = 'btn btn-secondary';
            btnVolver.innerHTML = '← Volver a la Lista';
            btnVolver.style.marginRight = '10px';


            btnVolver.addEventListener('click', () => {
                tareaSeleccionada = [];
                const modalVerTask = document.getElementById('modal-VerTask');
                modalVerTask.style.display = 'none';
                verTareas();
                volverAListaTareas();
            });
        }
        btnVolver.style.display = 'inline-block';

        // Actualizar el título del modal para indicar qué tarea se está viendo
        const modalTitle = document.querySelector('#modal-VerTask .modal-header-container h2');
        if (modalTitle) {
            modalTitle.innerHTML = `📝 Tarea ${index + 1}: ${tarea.nombreServicio || 'Sin nombre'}`;
        }
    }

    // Función para volver a mostrar la lista de tareas
    function volverAListaTareas() {
        console.log('Volviendo a la lista de tareas');

        // Ocultar formulario
        const formContainer = document.getElementById('formContainer');
        if (formContainer) {
            formContainer.style.display = 'none';
        }

        // Mostrar list group
        const listGroupContainer = document.getElementById('listGroupContainer');
        if (listGroupContainer) {

            listGroupContainer.style.display = 'block';
        }

        // Ocultar botón volver
        const btnVolver = document.getElementById('btnVolverLista');
        if (btnVolver) {
            btnVolver.style.display = 'none';
        }

        // Restaurar título del modal
        const modalTitle = document.querySelector('#modal-VerTask .modal-header-container h2');
        if (modalTitle) {
            modalTitle.innerHTML = '📝 Tareas Asignadas';
        }
    }

    const closeVerTaskModalBtn = document.getElementById('closeVerTaskModalBtn');
    if (closeVerTaskModalBtn) {
        closeVerTaskModalBtn.addEventListener('click', () => {
            tareaSeleccionada = [];
            console.log('🔄 Cerrando modal Ver Tareas y desmarcando usuarios...');

            // Cerrar modal
            document.getElementById('modal-VerTask').style.display = "none";
        });
    }


    btnPendingTasks.addEventListener('click',verTareas);
});
