import { db } from "./firebase.js";
import {
    doc,
    setDoc,
    serverTimestamp,
    onSnapshot,
    collection,
    query,
    where,
    getDocs
} from "https://www.gstatic.com/firebasejs/11.0.1/firebase-firestore.js";

document.addEventListener('DOMContentLoaded', async function () {
    console.log('🚀 Iniciando admin_home.js...');
    console.log('🔥 Firebase DB objeto:', db);

    // 🔹 Array global para guardar seleccionados
    let empleadosSeleccionados = [];
    // 🔹 Array global para almacenar actividades
    let actividadesDisponibles = [];
    let servicioSeleccionadoId = null;
    // 🔹 Array global para almacenar edificios
    let edificiosDisponibles = [];
    let edificioSeleccionadoId = null;

    const navbarToggle = document.querySelector('.navbar-toggle');
    const navbarMenu = document.querySelector('.navbar-menu');
    const saludoSpan = document.querySelector('.navbar-saludo');

    const loadingElement = document.getElementById('loading');
    const errorElement = document.getElementById('error-message');
    const noDataElement = document.getElementById('no-data-message');
    const tableWrapper = document.getElementById('table-wrapper');
    const tableBody = document.getElementById('table-body');
    const errorDetails = document.getElementById('error-details');
    const userCount = document.getElementById('user-count');
    const searchNameInput = document.getElementById('search-name');

    searchNameInput.disabled = true;

    const btnSearch = document.getElementById('btnSearch');
    const btnAll = document.getElementById('btnAll');
    const btnClear = document.getElementById('btnClear');
    const btnRetry = document.getElementById('btnRetry');
    const btnNewTask = document.getElementById('btnNewTask');
    const btnVerTask = document.getElementById('btnVerTask');
    const btnConfirm = document.getElementById('btnConfirmar');
    const btnEditar = document.getElementById('btnEditar');
    const btnEliminar = document.getElementById('btnEliminar');


    // 🔍 VERIFICAR ELEMENTOS HTML
    console.log('📋 Elementos encontrados:', {
        loadingElement: !!loadingElement,
        errorElement: !!errorElement,
        noDataElement: !!noDataElement,
        tableWrapper: !!tableWrapper,
        tableBody: !!tableBody,
        btnAll: !!btnAll
    });

    try {
        const password = localStorage.getItem('admin_password');
        console.log('🔐 Admin password:', password);

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

    // Menú hamburguesa
    navbarToggle.addEventListener('click', () => {
        window.location.href = "https://administracionsie.onrender.com/Pages/Login_page.html";
    });

    // 📌 Funciones de UI
    function showLoading() {
        console.log('⏳ Mostrando loading...');
        loadingElement.classList.remove('d-none');
        errorElement.classList.add('d-none');
        noDataElement.classList.add('d-none');
        tableWrapper.classList.add('d-none');
    }

    function showError(msg) {
        console.log('❌ Mostrando error:', msg);
        loadingElement.classList.add('d-none');
        errorElement.classList.remove('d-none');
        noDataElement.classList.add('d-none');
        tableWrapper.classList.add('d-none');
        errorDetails.textContent = msg;
    }

    function showNoData() {
        console.log('📭 No hay datos para mostrar');
        loadingElement.classList.add('d-none');
        errorElement.classList.add('d-none');
        noDataElement.classList.remove('d-none');
        tableWrapper.classList.add('d-none');
        userCount.textContent = '0';
    }

    function showTable(count) {
        console.log('📊 Mostrando tabla con', count, 'elementos');
        loadingElement.classList.add('d-none');
        errorElement.classList.add('d-none');
        noDataElement.classList.add('d-none');
        tableWrapper.classList.remove('d-none');
        userCount.textContent = count;
    }

    function clearTable() {
        console.log('🧹 Limpiando tabla...');
        tableBody.innerHTML = '';
        searchNameInput.value = '';
        showNoData();
    }

    // 🔹 Función auxiliar para formatear nombre completo
    function formatFullName(usuario) {
        const apellido = usuario.apellido || '';
        const nombre = usuario.nombre || '';

        if (apellido && nombre) {
            return `${apellido} ${nombre}`;
        } else if (apellido) {
            return apellido;
        } else if (nombre) {
            return nombre;
        } else {
            return 'Sin nombre';
        }
    }

    // 🔹 Función corregida para llenar el dropdown de actividades
    function llenarDropdownActividades(actividades) {
        console.log('🔄 Llenando dropdown con actividades:', actividades);

        // CORREGIDO: Buscar específicamente el dropdown de actividades
        const dropdown = document.querySelector('#menuActivities .dropdown-menu');

        if (!dropdown) {
            console.error('❌ No se encontró el dropdown de actividades');
            console.log('🔍 Elementos disponibles:', {
                modal: document.getElementById('modal-NewTask'),
                menuActividades: document.getElementById('menuActividades'),
                dropdownMenu: document.querySelector('#menuActivities .dropdown-menu')
            });
            return;
        }

        console.log('✅ Dropdown de actividades encontrado:', dropdown);

        // Limpiar opciones existentes
        dropdown.innerHTML = '';

        // Agregar actividades como <li> con <button> dentro
        actividades.forEach((actividad, index) => {
            console.log(`➕ Agregando actividad ${index + 1}:`, actividad);

            const li = document.createElement('li');
            const button = document.createElement('button');
            button.className = 'dropdown-item';
            button.type = 'button';
            button.textContent = actividad.descripcion;
            button.setAttribute('data-value', actividad.idServicio);

            button.addEventListener('click', () => {
                seleccionarActividad(actividad.idServicio, actividad.descripcion);
            });

            li.appendChild(button);
            dropdown.appendChild(li);
        });

        console.log('✅ Dropdown de actividades poblado exitosamente con', actividades.length, 'actividades');
    }


    // 🔹 Función corregida para seleccionar una actividad
    function seleccionarActividad(id, descripcion) {
        console.log('🎯 Actividad seleccionada:', { id, descripcion });

        // Guardar el ID en variable global
        servicioSeleccionadoId = id;

        const botonDropdown = document.getElementById('activitySelected');

        if (botonDropdown) {
            botonDropdown.textContent = descripcion;
            botonDropdown.setAttribute('data-selected', id);
            console.log('✅ Botón dropdown de actividades actualizado y ID guardado:', id);

            // Cerrar el dropdown después de seleccionar
            try {
                const dropdown = bootstrap.Dropdown.getInstance(botonDropdown);
                if (dropdown) {
                    dropdown.hide();
                }
            } catch (e) {
                console.log('ℹ️ No se pudo cerrar dropdown automáticamente:', e);
            }
        } else {
            console.error('❌ No se encontró el botón activitySelected');
        }
    }

    // 🔹 Función para llenar el dropdown de edificios
    function llenarDropdownEdificios(edificios) {
        console.log('🔄 Llenando dropdown con edificios:', edificios);

        // CORREGIDO: Buscar específicamente el dropdown de edificios
        const dropdown = document.querySelector('#menuEdificios .dropdown-menu');

        if (!dropdown) {
            console.error('❌ No se encontró el dropdown de edificios');
            console.log('🔍 Elementos disponibles:', {
                modal: document.getElementById('modal-NewTask'),
                menuEdificios: document.getElementById('menuEdificios'),
                dropdownMenu: document.querySelector('#menuEdificios .dropdown-menu')
            });
            return;
        }

        console.log('✅ Dropdown de edificios encontrado:', dropdown);

        // Limpiar opciones existentes
        dropdown.innerHTML = '';

        // Agregar edificios como <li> con <button> dentro
        edificios.forEach((edificio, index) => {
            console.log(`➕ Agregando edificio ${index + 1}:`, edificio);

            const li = document.createElement('li');
            const button = document.createElement('button');
            button.className = 'dropdown-item';
            button.type = 'button';
            button.textContent = edificio.nombre;
            button.setAttribute('data-value', edificio.id_Edificio);

            button.addEventListener('click', () => {
                seleccionarEdificio(edificio.id_Edificio, edificio.nombre);
            });

            li.appendChild(button);
            dropdown.appendChild(li);
        });

        console.log('✅ Dropdown de edificios poblado exitosamente con', edificios.length, 'edificios');
    }

    // Funcion para seleccionar un Edificio del Dropdown
    function seleccionarEdificio(id, nombre) {
        console.log('🎯 Edificio seleccionado:', { id, nombre });

        // Guardar el ID en variable global
        edificioSeleccionadoId = id;

        const botonDropdown = document.getElementById('edificioSelected');

        if (botonDropdown) {
            botonDropdown.textContent = nombre;
            botonDropdown.setAttribute('data-selected', id);
            console.log('✅ Botón dropdown de edificios actualizado y ID guardado:', id);

            // Cerrar el dropdown después de seleccionar
            try {
                const dropdown = bootstrap.Dropdown.getInstance(botonDropdown);
                if (dropdown) {
                    dropdown.hide();
                }
            } catch (e) {
                console.log('ℹ️ No se pudo cerrar dropdown automáticamente:', e);
            }
        } else {
            console.error('❌ No se encontró el botón edificioSelected');
        }
    }

    // Función para obtener el ID (usa la variable global)
    function obtenerIdEdificio() {
        console.log('🏢 ID Edificio obtenido:', edificioSeleccionadoId);
        return edificioSeleccionadoId;
    }

    // 🔹 Función corregida para cargar actividades desde la API
    async function cargarActividades() {
        console.log('🔄 Cargando actividades desde la API...');

        try {
            const url = 'https://administracionsie.onrender.com/api/SIE/Obtener-todas-las-actividades';
            console.log('📡 URL completa:', url);

            const response = await fetch(url);

            console.log('📊 Response status:', response.status);
            console.log('📊 Response ok:', response.ok);

            if (!response.ok) {
                const errorText = await response.text();
                console.error('❌ Error response body:', errorText);
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const actividades = await response.json();
            console.log('✅ Actividades obtenidas:', actividades);

            // Verificar que sea un array
            if (!Array.isArray(actividades)) {
                console.error('❌ Las actividades no son un array:', typeof actividades);
                throw new Error('Formato de actividades inválido');
            }

            // Guardar las actividades globalmente
            actividadesDisponibles = actividades;

            // Llenar el dropdown inmediatamente
            llenarDropdownActividades(actividades);

        } catch (error) {
            console.error('❌ Error al cargar actividades:', error);
            alert('Error al cargar actividades: ' + error.message);
        }
    }

    // 🔹 Función para obtener el ID del servicio seleccionado
    function obtenerIdServicio() {
        console.log('🔧 ID Servicio obtenido:', servicioSeleccionadoId);
        return servicioSeleccionadoId;
    }



    // 🔹 Función corregida para cargar edificios desde la API
    async function cargarEdificios() {
        console.log('🔄 Cargando edificios desde la API...');

        try {
            const url = 'https://administracionsie.onrender.com/api/SIE/Obtener-todos-los-edificios';
            console.log('📡 URL completa:', url);

            const response = await fetch(url);

            console.log('📊 Response status:', response.status);
            console.log('📊 Response ok:', response.ok);

            if (!response.ok) {
                const errorText = await response.text();
                console.error('❌ Error response body:', errorText);
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const edificios = await response.json();
            console.log('✅ Edificios obtenidos:', edificios);

            // Verificar que sea un array
            if (!Array.isArray(edificios)) {
                console.error('❌ Los edificios no son un array:', typeof edificios);
                throw new Error('Formato de edificios inválido');
            }

            // Guardar los edificios globalmente
            edificiosDisponibles = edificios;

            // Llenar el dropdown inmediatamente
            llenarDropdownEdificios(edificios);

        } catch (error) {
            console.error('❌ Error al cargar edificios:', error);
            alert('Error al cargar edificios: ' + error.message);
        }
    }

    // 🔹 Función CORREGIDA para abrir el modal de Asignar Nueva Tarea
    function openModalNewTask(empleadosSeleccionados) {
        console.log('🔓 Abriendo modal Nueva Tarea para empleados:', empleadosSeleccionados);

        const modalNewTask = document.getElementById('modal-NewTask');
        const inputUserName = document.getElementById('userName');

        if (!modalNewTask) {
            console.error('❌ Modal no encontrado');
            return;
        }

        if (!inputUserName) {
            console.error('❌ Input userName no encontrado');
            return;
        }

        // ✅ CORRECCIÓN: Extraer solo los nombres de los objetos
        let nombresEmpleados;

        if (Array.isArray(empleadosSeleccionados) && empleadosSeleccionados.length > 0) {
            // Si el primer elemento es un objeto, extraer los nombres
            if (typeof empleadosSeleccionados[0] === 'object' && empleadosSeleccionados[0].nombre) {
                nombresEmpleados = empleadosSeleccionados.map(emp => emp.nombre).join(', ');
            } else {
                // Si ya son strings, usar directamente
                nombresEmpleados = empleadosSeleccionados.join(', ');
            }
        } else {
            nombresEmpleados = 'Sin empleados seleccionados';
        }

        console.log('📝 Nombres a mostrar:', nombresEmpleados);

        // Rellenar el input con los nombres de los empleados
        inputUserName.value = nombresEmpleados;
        inputUserName.disabled = true;

        // Resetear dropdowns al estado inicial
        const activityButton = document.getElementById('activitySelected');
        const edificioButton = document.getElementById('edificioSelected');

        if (activityButton) {
            activityButton.textContent = 'Seleccione una actividad';
            activityButton.removeAttribute('data-selected');
        }

        if (edificioButton) {
            edificioButton.textContent = 'Seleccione un edificio';
            edificioButton.removeAttribute('data-selected');
        }

        // Limpiar fecha
        const fechaInput = document.getElementById('dateActivity');
        if (fechaInput) {
            fechaInput.value = '';
        }

        // Limpiar observaciones
        const observacionesTextarea = document.querySelector('#modal-NewTask textarea');
        if (observacionesTextarea) {
            observacionesTextarea.value = '';
        }

        // Mostrar el modal
        modalNewTask.style.display = 'flex';

        // Cargar las actividades Y edificios después de mostrar el modal
        setTimeout(async () => {
            await cargarActividades();
            await cargarEdificios();
        }, 200);
    }


    // 🔹 Event listeners para los botones de cerrar modales (CORREGIDOS)
    const closeVerTaskModalBtn = document.getElementById('closeVerTaskModalBtn');
    if (closeVerTaskModalBtn) {
        closeVerTaskModalBtn.addEventListener('click', () => {
            console.log('🔄 Cerrando modal Ver Tareas y desmarcando usuarios...');

            // Desmarcar todos los checkboxes
            const checkboxes = document.querySelectorAll('#table-body input[type="checkbox"]');
            checkboxes.forEach(checkbox => {
                if (checkbox.checked) {
                    checkbox.checked = false;
                }
            });

            // Limpiar empleados seleccionados
            empleadosSeleccionados = [];

            // Cerrar modal
            document.getElementById('modal-VerTask').style.display = "none";
        });
    }



    // 🔹 Función CORREGIDA para manejar el botón "Ver Tareas"
    function verTareas() {
        console.log('🔍 Verificando empleados seleccionados...');
        console.log('Empleados seleccionados:', empleadosSeleccionados);

        // Verificar que haya exactamente un empleado seleccionado
        if (empleadosSeleccionados.length === 0) {
            alert('❌ No se ha seleccionado ningún empleado');
            return;
        }

        if (empleadosSeleccionados.length > 1) {
            alert('❌ Por favor seleccione solo un empleado para ver sus tareas');
            return;
        }

        // Obtener el empleado seleccionado
        const empleadoSeleccionado = empleadosSeleccionados[0];
        console.log('👤 Empleado seleccionado:', empleadoSeleccionado);

        // Llamar a la función que abre el modal
        openModalVerTask(empleadoSeleccionado.id, empleadoSeleccionado.nombre);
    }


    // Función CORREGIDA para abrir el modal de Ver Tareas Asignadas
    async function openModalVerTask(employeeId, nombreEmpleado) {
        console.log('Abriendo modal Ver Tareas para:', { employeeId, nombreEmpleado });

        try {
            console.log('Realizando consulta para empleado ID:', employeeId);

            const response = await fetch(`https://administracionsie.onrender.com/api/SIE/Obtener-servicioXusuario-por-usuario?userId=${employeeId}`);

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.json();
            console.log('Datos obtenidos de la API:', data);
            console.log('Tipo de respuesta:', typeof data);
            console.log('Es array:', Array.isArray(data));

            const modalVerTask = document.getElementById('modal-VerTask');
            const inputUser = document.getElementById('verTareaByUser');

            if (!modalVerTask) {
                console.error('Modal modal-VerTask no encontrado');
                return;
            }

            if (!inputUser) {
                console.error('Input verTareaByUser no encontrado');
                return;
            }



            // Rellenar el input con el nombre del empleado
            inputUser.value = nombreEmpleado;
            inputUser.disabled = true;

            // Obtener los elementos del dropdown
            const activityButton = document.getElementById('activitySelectedByUser');
            const edificioButton = document.getElementById('edificioSelectedByUser');

            // Procesar los datos de la API
            if (Array.isArray(data) && data.length > 0) {
                // Si hay datos, tomar el primer registro (o podrías mostrar múltiples)
                const primerRegistro = data[0];
                console.log('Primer registro:', primerRegistro);

                // Llenar dropdown de actividad/servicio
                if (activityButton) {
                    if (primerRegistro.nombreServicio) {
                        activityButton.textContent = primerRegistro.nombreServicio;
                        activityButton.setAttribute('data-selected', primerRegistro.idServicio || primerRegistro.nombreServicio);
                        console.log('Actividad asignada:', primerRegistro.nombreServicio);
                        activityButton.disabled = true;
                    } else {
                        activityButton.textContent = 'Sin actividad asignada';
                        activityButton.removeAttribute('data-selected');
                    }
                }

                // Llenar dropdown de edificio
                if (edificioButton) {
                    if (primerRegistro.nombreEdificio) {
                        edificioButton.textContent = primerRegistro.nombreEdificio;
                        edificioButton.setAttribute('data-selected', primerRegistro.idEdificio || primerRegistro.nombreEdificio);
                        console.log('Edificio asignado:', primerRegistro.nombreEdificio);
                        edificioButton.disabled = true;
                    } else {
                        edificioButton.textContent = 'Sin edificio asignado';
                        edificioButton.removeAttribute('data-selected');
                        edificioButton.disabled = true;
                    }
                }

                // Si quieres mostrar también la fecha y observaciones
                const fechaInput = document.getElementById('verDateActivityByUser');
                if (fechaInput && primerRegistro.fecha) {
                    // Convertir la fecha al formato YYYY-MM-DD si es necesario
                    const fecha = new Date(primerRegistro.fecha);
                    if (!isNaN(fecha.getTime())) {
                        fechaInput.value = fecha.toISOString().split('T')[0];
                    }
                }
                fechaInput.disabled = true;

                const observacionesInput = document.getElementById('VerCommentsByUser');
                if (observacionesInput) {
                    observacionesInput.value = primerRegistro.observaciones || '';
                }
                observacionesInput.disabled = true;

                // Mostrar el modal
                modalVerTask.style.display = 'flex';
                console.log('Modal Ver Tareas abierto correctamente');

            } else {
                // No hay datos asignados
                console.log('No se encontraron tareas asignadas para este empleado');

                if(confirm(`El empleado ${nombreEmpleado} no tiene ninguna tarea asignada. Desea asignarle una ?`))
                {
                    openModalNewTask(empleadosSeleccionados);
                }


            }



        } catch (error) {
            console.error('Error al obtener datos de la API:', error);
            alert('Error al cargar las tareas del empleado: ' + error.message);
        }
    }




    const closeNewTaskModalBtn = document.getElementById('closeNewTaskModalBtn');
    // Cerrar modal
    if (closeNewTaskModalBtn) {
        closeNewTaskModalBtn.addEventListener('click', () => {
            console.log('🔄 Desmarcando todos los usuarios...');

            // Buscar todos los checkboxes en la tabla
            const checkboxes = document.querySelectorAll('#table-body input[type="checkbox"]');

            // Desmarcar cada checkbox
            checkboxes.forEach(checkbox => {
                if (checkbox.checked) {
                    checkbox.checked = false;
                    console.log('✅ Usuario desmarcado');
                }
            });
            empleadosSeleccionados= [];
            document.getElementById('modal-NewTask').style.display = "none";
        });
    }



    // 🔹 Función CORREGIDA para buscar usuario por nombre
    async function searchByName() {
        const nombre = searchNameInput.value.trim();
        console.log('🔍 Buscando usuario por nombre:', nombre);

        if (!nombre) {
            alert("Ingresa un nombre");
            return;
        }

        showLoading();

        try {
            const response = await fetch('https://administracionsie.onrender.com/api/SIE/Obtener-usuario-por-nombre', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(nombre)
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const usuario = await response.json();
            console.log('✅ Usuario encontrado:', usuario);

            // Limpiar tabla y empleados seleccionados
            tableBody.innerHTML = '';
            empleadosSeleccionados = []; // ✅ Limpiar selecciones anteriores

            // Crear fila con los datos del usuario
            const tr = document.createElement('tr');
            tr.id = `row-${usuario.idUsuario || 'unknown'}`;
            tr.innerHTML = `
            <td><span class="badge bg-secondary">${usuario.idUsuario || 'N/A'}</span></td>
            <td><strong>${usuario.nombre || 'Sin nombre'}</strong></td>
            <td><code>${usuario.nicknameDni || 'Sin DNI'}</code></td>
            <td></td>
        `;

            // Crear checkbox para las acciones
            const check = createCheckboxForUser(usuario);

            const cell = tr.querySelector('td:last-child');
            cell.appendChild(check);
            tableBody.appendChild(tr);

            showTable(1);

        } catch (error) {
            console.error('❌ Error en searchByName:', error);

            if (error.message.includes('404')) {
                showError('Usuario no encontrado');
            } else if (error.message.includes('500')) {
                showError('Error interno del servidor');
            } else {
                showError('Error al buscar usuario: ' + error.message);
            }
        }
    }

    let usuariosGlobal = []; // lista global de usuarios

// ✅ Cargar todos los usuarios al inicio
    async function loadAllUsers() {
        showLoading();
        try {
            const response = await fetch('https://administracionsie.onrender.com/api/SIE/Obtener-todos-los-usuarios');
            const usuarios = await response.json();

            if (!Array.isArray(usuarios)) throw new Error('Formato inválido');

            searchNameInput.disabled = false;

            usuariosGlobal = usuarios; // guardamos todos
            renderTable(usuariosGlobal); // mostramos todo
        } catch (error) {
            showError("Error al cargar usuarios: " + error.message);
        }
    }

// 🔍 Filtrar usuarios por nombre, apellido o DNI
    function filtrarUsuariosPorNombre(patron) {
        if (!patron) {
            renderTable(usuariosGlobal);
            return;
        }

        const filtro = patron.toLowerCase();
        const resultados = usuariosGlobal.filter(u =>
            (u.nombre && u.nombre.toLowerCase().includes(filtro)) ||
            (u.apellido && u.apellido.toLowerCase().includes(filtro)) ||
            (u.nicknameDni && u.nicknameDni.toLowerCase().includes(filtro))
        );

        renderTable(resultados);
    }

    // Esta función se utiliza para crear y agregar un checkbox a cada fila (CORREGIDA)
    function createCheckboxForUser(usuario) {
        const check = document.createElement('input');
        check.type = 'checkbox';
        check.className = 'form-check-input selectEmployee'; // ✅ Agregar clase selectEmployee
        check.title = 'Seleccionar empleado';

        // Si el empleado está en empleadosSeleccionados, marcar el checkbox
        const empleadoExistente = empleadosSeleccionados.find(emp => emp.id === usuario.idUsuario);
        if (empleadoExistente) {
            check.checked = true;
        }

        // Evento para manejar el cambio de estado del checkbox
        check.addEventListener('change', () => {
            const empleadoInfo = {
                id: usuario.idUsuario || 'N/A',
                nombre: usuario.nombre || 'Sin nombre',
                dni: usuario.nicknameDni || 'Sin DNI'
            };

            if (check.checked) {
                // Agregar si no existe
                if (!empleadosSeleccionados.find(emp => emp.id === empleadoInfo.id)) {
                    empleadosSeleccionados.push(empleadoInfo);
                }
            } else {
                // Quitar si se desmarca
                empleadosSeleccionados = empleadosSeleccionados.filter(emp => emp.id !== empleadoInfo.id);
            }

            console.log("Empleados seleccionados:", empleadosSeleccionados);
        });

        return check;
    }

    // Función que renderiza la tabla con la lista de empleados y checkboxes
    function renderTable(usuarios) {
        tableBody.innerHTML = ''; // Limpiar la tabla antes de agregar filas

        if (usuarios.length === 0) {
            showNoData(); // Mostrar mensaje si no hay usuarios
            return;
        }

        usuarios.forEach(usuario => {
            const tr = document.createElement('tr');
            tr.innerHTML = `
            <td><span class="badge bg-secondary">${usuario.idUsuario || 'N/A'}</span></td>
            <td><strong>${usuario.nombre || 'Sin nombre'}</strong></td>
            <td><code>${usuario.nicknameDni || 'Sin DNI'}</code></td>
            <td></td> <!-- Aquí se agregará el checkbox -->
        `;

            // Crear el checkbox para este usuario
            const check = createCheckboxForUser(usuario);

            // Añadir el checkbox a la última columna de la fila
            const cell = tr.querySelector('td:last-child');
            cell.appendChild(check);

            // Agregar la fila a la tabla
            tableBody.appendChild(tr);
        });

        showTable(usuarios.length); // Mostrar la tabla
    }



    // Función para validar el formulario de nueva tarea
    function validateNewTaskForm() {
        console.log('Validando formulario de nueva tarea...');

        const errores = [];

        // 1. Validar que se haya seleccionado una actividad
        const activityButton = document.getElementById('activitySelected');
        const actividadSeleccionada = activityButton ? activityButton.getAttribute('data-selected') : null;

        if (!actividadSeleccionada || activityButton.textContent.trim() === 'Seleccione una actividad') {
            errores.push('Debe seleccionar una actividad');
            console.log('Error: No se seleccionó actividad');
        } else {
            console.log('Actividad seleccionada:', actividadSeleccionada);
        }

        // 2. Validar que se haya seleccionado un edificio
        const edificioButton = document.getElementById('edificioSelected');
        const edificioSeleccionado = edificioButton ? edificioButton.getAttribute('data-selected') : null;

        if (!edificioSeleccionado || edificioButton.textContent.trim() === 'Seleccione un edificio') {
            errores.push('Debe seleccionar un edificio');
            console.log('Error: No se seleccionó edificio');
        } else {
            console.log('Edificio seleccionado:', edificioSeleccionado);
        }

        // 3. Validar que la fecha no sea menor a la fecha actual
        const fechaInput = document.getElementById('dateActivity');
        const fechaSeleccionada = fechaInput ? fechaInput.value : '';

        if (!fechaSeleccionada) {
            errores.push('Debe seleccionar una fecha');
            console.log('Error: No se seleccionó fecha');
        } else {
            // Obtener fecha actual sin hora (solo YYYY-MM-DD)
            const fechaActual = new Date();
            const fechaActualString = fechaActual.toISOString().split('T')[0];

            // Comparar fechas
            if (fechaSeleccionada < fechaActualString) {
                errores.push('La fecha no puede ser anterior a la fecha actual');
                console.log('Error: Fecha anterior a hoy. Seleccionada:', fechaSeleccionada, 'Actual:', fechaActualString);
            } else {
                console.log('Fecha válida:', fechaSeleccionada);
            }
        }

        // Mostrar resultados
        if (errores.length > 0) {
            console.log('Errores encontrados:', errores);

            // Mostrar alert con todos los errores
            const mensajeError = 'Por favor corrija los siguientes errores:\n\n' +
                errores.map((error, index) => `${index + 1}. ${error}`).join('\n');
            alert(mensajeError);

            return false; // Formulario inválido
        }

        console.log('Formulario válido - todos los campos están correctos');
        return true; // Formulario válido
    }

    // Agregar estas funciones para obtener los nombres
    function obtenerNombreServicio() {
        const botonDropdown = document.getElementById('activitySelected');
        if (botonDropdown && botonDropdown.getAttribute('data-selected')) {
            return botonDropdown.textContent.trim();
        }
        return null;
    }

    function obtenerNombreEdificio() {
        const botonDropdown = document.getElementById('edificioSelected');
        if (botonDropdown && botonDropdown.getAttribute('data-selected')) {
            return botonDropdown.textContent.trim();
        }
        return null;
    }

    async function handleFormSubmit(event) {
        event.preventDefault();

        console.log('Intentando enviar formulario...');

        const isValid = validateNewTaskForm();

        if (isValid) {
            console.log('Formulario válido - procediendo con el envío...');

            try {
                // CORREGIR EL FOR
                for (let i = 0; i < empleadosSeleccionados.length; i++) {

                    // Obtener el ID del empleado actual
                    const idEmpleado = empleadosSeleccionados[i].id;
                    const observacionesNuevaTarea = document.getElementById('comments');
                    const fechaNuevaTarea = document.getElementById('dateActivity');

                    // CORREGIR CONVERSIÓN DE FECHA
                    const datos = {
                        idUsuario: idEmpleado,
                        idServicio: obtenerIdServicio(),
                        nombreServicio: obtenerNombreServicio(),
                        idEdificio: obtenerIdEdificio(),
                        nombreEdificio: obtenerNombreEdificio(),
                        observaciones: observacionesNuevaTarea.value.trim(),
                        fecha: fechaNuevaTarea.value // Ya está en formato YYYY-MM-DD si es input type="date"
                    };

                    console.log(`📤 Datos para empleado ${i + 1}:`, datos);

                    // Validar que no haya valores null
                    if (!datos.idUsuario || !datos.idServicio || !datos.idEdificio || !datos.fecha) {
                        console.error('❌ Datos faltantes:', datos);
                        alert(`Error: Datos faltantes para empleado ${empleadosSeleccionados[i].nombre}`);
                        continue;
                    }

                    // Enviar petición HTTP
                    const response = await fetch('https://administracionsie.onrender.com/api/SIE/Crear-servicioXactividad-por-usuario', {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                        },
                        body: JSON.stringify(datos)
                    });

                    console.log(`📊 Response status para empleado ${i + 1}:`, response.status);

                    if (!response.ok) {
                        const errorText = await response.text();
                        console.error(`❌ Error del servidor para empleado ${i + 1}:`, errorText);
                        throw new Error(`Error ${response.status} para ${empleadosSeleccionados[i].nombre}: ${errorText}`);
                    }

                    const resultado = await response.json();
                    console.log(`✅ Tarea asignada exitosamente al empleado ${i + 1}:`, resultado);
                }

                alert(`Tareas asignadas correctamente a ${empleadosSeleccionados.length} empleados`);

                // Cerrar modal y limpiar
                document.getElementById('modal-NewTask').style.display = 'none';
                empleadosSeleccionados = [];
                servicioSeleccionadoId = null;
                edificioSeleccionadoId = null;

                // Desmarcar checkboxes
                const checkboxes = document.querySelectorAll('#table-body input[type="checkbox"]');
                checkboxes.forEach(checkbox => checkbox.checked = false);

            } catch (error) {
                console.error('❌ Error al enviar formulario:', error);
                alert('Error al asignar tareas: ' + error.message);
            }

        } else {
            console.log('Formulario inválido - no se enviará');
        }
    }



    // Funcion para editar una tarea asignada
    async function UpdateTask(idUser){

        

    }

    // 🎯 Eventos
    if (btnSearch) btnSearch.addEventListener('click', loadAllUsers);
    if (btnAll) btnAll.addEventListener('click', loadAllUsers);
    if (btnClear) btnClear.addEventListener('click', clearTable);
    if (btnRetry) btnRetry.addEventListener('click', loadAllUsers);

    btnNewTask.addEventListener('click', async () => {
        if (empleadosSeleccionados.length === 0) {
            alert("Por favor selecciona al menos un empleado.");
            return;
        }

        // Pasar todos los seleccionados al modal
        openModalNewTask(empleadosSeleccionados);
    })

    btnVerTask.addEventListener('click', async () => {

            verTareas();
    })

    if (btnConfirm) {
        btnConfirm.addEventListener('click', handleFormSubmit);
    }

    if (searchNameInput) {
        searchNameInput.addEventListener('input', e => {
            filtrarUsuariosPorNombre(e.target.value);
        });
    }
});
