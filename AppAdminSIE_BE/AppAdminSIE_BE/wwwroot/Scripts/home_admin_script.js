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
    // 🔹 Array global para almacenar edificios
    let edificiosDisponibles = [];

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
    const btnConfirm = document.getElementById('btnConfirmar');


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
            button.setAttribute('data-value', actividad.id);

            button.addEventListener('click', () => {
                seleccionarActividad(actividad.id, actividad.descripcion);
            });

            li.appendChild(button);
            dropdown.appendChild(li);
        });

        console.log('✅ Dropdown de actividades poblado exitosamente con', actividades.length, 'actividades');
    }

// 🔹 Función corregida para seleccionar una actividad
    function seleccionarActividad(id, descripcion) {
        console.log('🎯 Actividad seleccionada:', { id, descripcion });

        // CORREGIDO: Buscar específicamente el botón de actividades
        const botonDropdown = document.getElementById('activitySelected');

        if (botonDropdown) {
            botonDropdown.textContent = descripcion;
            botonDropdown.setAttribute('data-selected', id);
            console.log('✅ Botón dropdown de actividades actualizado');

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

    // 🔹 Función corregida para llenar el dropdown de edificios
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
            button.setAttribute('data-value', edificio.id);

            button.addEventListener('click', () => {
                seleccionarEdificio(edificio.id, edificio.nombre);
            });

            li.appendChild(button);
            dropdown.appendChild(li);
        });

        console.log('✅ Dropdown de edificios poblado exitosamente con', edificios.length, 'edificios');
    }

// 🔹 Función corregida para seleccionar un edificio
    function seleccionarEdificio(id, nombre) {
        console.log('🎯 Edificio seleccionado:', { id, nombre });

        // CORREGIDO: Buscar específicamente el botón de edificios
        const botonDropdown = document.getElementById('edificioSelected');

        if (botonDropdown) {
            botonDropdown.textContent = nombre;
            botonDropdown.setAttribute('data-selected', id);
            console.log('✅ Botón dropdown de edificios actualizado');

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

// 🔹 Función mejorada para abrir el modal
    function openModalNewTask(nombreEmpleado) {
        console.log('🔓 Abriendo modal para:', nombreEmpleado);

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

        // Rellena el input con el nombre del empleado
        inputUserName.value = Array.isArray(nombreEmpleado) ? nombreEmpleado.join(', ') : nombreEmpleado;
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

        // Muestra el modal
        modalNewTask.style.display = 'flex';

        // Carga las actividades Y edificios después de mostrar el modal
        setTimeout(async () => {
            await cargarActividades();
            await cargarEdificios();
        }, 200);
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

    // Cerrar modal al hacer clic fuera del contenido
    const modal = document.getElementById('locationModal');
    if (modal) {
        modal.addEventListener('click', e => {
            if (e.target.id === 'locationModal') {
                e.target.style.display = "none";
            }
        });
    }

    // Función para buscar usuario por nombre usando la API
    async function searchByName() {
        const nombre = searchNameInput.value.trim();
        console.log('Buscando usuario por nombre:', nombre);

        if (!nombre) {
            alert("Ingresa un nombre");
            return;
        }

        showLoading();

        try {
            // Llamada a la API que recibe string y devuelve JSON
            const response = await fetch('https://administracionsie.onrender.com/api/SIE/Obtener-usuario-por-nombre', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'  // Cambiar a JSON
                },
                body: JSON.stringify(nombre)  // Envolver el string en JSON
            });

            console.log('Response status:', response.status);
            console.log('Response ok:', response.ok);

            if (!response.ok) {
                const errorText = await response.text();
                console.error('Error response body:', errorText);
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            // La API devuelve un objeto JSON
            const usuario = await response.json();
            console.log('Usuario encontrado:', usuario);

            // Verificar que el objeto tiene los campos necesarios
            if (!usuario || typeof usuario !== 'object') {
                throw new Error('Respuesta de API inválida');
            }

            // Limpiar tabla antes de agregar el resultado
            tableBody.innerHTML = '';

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
            const cell = tr.querySelector('td:last-child');
            const check = document.createElement('input');
            check.type = 'checkbox';
            check.className = 'form-check-input';
            check.title = 'Seleccionar empleado';

            // Event listener para manejar selección
            check.addEventListener('change', () => {
                const nombreCompleto = usuario.nombre || 'Sin nombre';

                if (check.checked) {
                    // Agregar si está marcado
                    if (!empleadosSeleccionados.includes(nombreCompleto)) {
                        empleadosSeleccionados.push(nombreCompleto);
                    }
                } else {
                    // Quitar si se desmarca
                    empleadosSeleccionados = empleadosSeleccionados.filter(
                        emp => emp !== nombreCompleto
                    );
                }

                console.log("Empleados seleccionados:", empleadosSeleccionados);
            });

            cell.appendChild(check);
            tableBody.appendChild(tr);

            // Mostrar tabla con 1 resultado
            showTable(1);

        } catch (error) {
            console.error('Error en searchByName:', error);

            // Manejar diferentes tipos de errores
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

// 🔹 Renderizar tabla con resultados
    function renderTable(usuarios) {
        tableBody.innerHTML = '';

        if (usuarios.length === 0) {
            showNoData();
            return;
        }

        usuarios.forEach(usuario => {
            const tr = document.createElement('tr');
            tr.innerHTML = `
            <td><span class="badge bg-secondary">${usuario.idUsuario || 'N/A'}</span></td>
            <td><strong>${usuario.nombre || 'Sin nombre'}</strong></td>
            <td><code>${usuario.nicknameDni || 'Sin DNI'}</code></td>
            <td></td>
        `;

            const cell = tr.querySelector("td:last-child");
            const check = document.createElement('input');
            check.type = 'checkbox';
            check.className = 'form-check-input';

            check.addEventListener('change', () => {
                const nombre = usuario.nombre || 'Sin nombre';
                if (check.checked) {
                    if (!empleadosSeleccionados.includes(nombre)) empleadosSeleccionados.push(nombre);
                } else {
                    empleadosSeleccionados = empleadosSeleccionados.filter(emp => emp !== nombre);
                }
            });

            cell.appendChild(check);
            tableBody.appendChild(tr);
        });

        showTable(usuarios.length);
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

    // Función para usar en el evento submit del formulario
     function handleFormSubmit(event) {
        event.preventDefault(); // Prevenir envío del formulario

        console.log('Intentando enviar formulario...');

        // Validar formulario
        const isValid = validateNewTaskForm();

        if (isValid) {
            console.log('Formulario válido - procediendo con el envío...');

            const response = fetch('https://administracionsie.onrender.com/api/SIE/Crear-servicioXactividad-por-usuario')
            const datos = {
                IdUsuario: data.IdUsuario
                ,
                IdServicio: data.IdServicio,
                IdEdificio: data.IdEdificio,
                Observaciones: data.Observaciones,
                Fecha: data.Fecha
            };


            alert('Tarea asignada correctamente');

            // Cerrar modal si todo está bien
            document.getElementById('modal-NewTask').style.display = 'none';

            // Limpiar selecciones si es necesario
            empleadosSeleccionados = [];

            // Desmarcar checkboxes
            const checkboxes = document.querySelectorAll('#table-body input[type="checkbox"]');
            checkboxes.forEach(checkbox => checkbox.checked = false);

        } else {
            console.log('Formulario inválido - no se enviará');
        }
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

    if (btnConfirm) {
        btnConfirm.addEventListener('click', handleFormSubmit);
    }

    if (searchNameInput) {
        searchNameInput.addEventListener('input', e => {
            filtrarUsuariosPorNombre(e.target.value);
        });
    }
});
