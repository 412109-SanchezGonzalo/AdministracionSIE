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

    const btnSearch = document.getElementById('btnSearch');
    const btnAll = document.getElementById('btnAll');
    const btnClear = document.getElementById('btnClear');
    const btnRetry = document.getElementById('btnRetry');
    const btnNewTask = document.getElementById('btnNewTask');

    btnNewTask.style.disabled = true;

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

    // 🔹 Función para abrir el modal de nueva tarea
    function openModalNewTask(nombreEmpleado) {
        const modalNewTask = document.getElementById('modal-NewTask');
        const inputUserName = document.getElementById('userName'); // ⚠️ Asegúrate de que este ID sea correcto

        // Rellena el input con el nombre del empleado
        inputUserName.value = nombreEmpleado;
        inputUserName.disabled = true;
        // Muestra el modal
        modalNewTask.style.display = 'flex';

        // Carga las actividades en el dropdown
        cargarActividades();
    }

    // Obtén una referencia al menú desplegable
    const dropdownMenu = document.querySelector('.dropdown-menu');

   async function cargarActividades() {
    console.log('Cargando actividades desde la API...');
    try {
        const url = 'https://administracionsie.onrender.com/api/SIE/Obtener-todas-las-actividades';
        console.log('URL completa:', url); // Debug
        
        const response = await fetch(url);
        
        console.log('Response object:', response); // Debug
        console.log('Response status:', response.status); // Debug
        console.log('Response statusText:', response.statusText); // Debug
        console.log('Response ok:', response.ok); // Debug
        
        if (!response.ok) {
            // Intenta leer el body del error
            const errorText = await response.text();
            console.error('Error response body:', errorText);
            throw new Error(`HTTP error! status: ${response.status}, statusText: ${response.statusText}, body: ${errorText}`);
        }
        
        const actividades = await response.json();
        console.log('Actividades obtenidas:', actividades);
        
        // ... resto del código igual
        
    } catch (error) {
        console.error('Error completo:', error);
        console.error('Error al cargar las actividades:', error);
    }
}


    const closeNewTaskModalBtn = document.getElementById('closeNewTaskModalBtn');
    // Cerrar modal
    if (closeNewTaskModalBtn) {
        closeNewTaskModalBtn.addEventListener('click', () => {
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

    // 🔹 Buscar usuario por nombre
    async function searchByName() {
        const nombre = searchNameInput.value.trim();
        console.log('🔍 Buscando usuario por nombre:', nombre);

        if (!nombre) return alert("Ingresa un nombre");

        showLoading();
        try {
            const q = query(collection(db, "usuarios"), where("nombre", "==", nombre));
            console.log('🔥 Query creada:', q);

            const querySnapshot = await getDocs(q);
            console.log('📄 Resultado query:', querySnapshot.size, 'documentos');

            if (querySnapshot.empty) {
                console.log('📭 No se encontraron usuarios con ese nombre');
                showError("Usuario no encontrado");
                return;
            }

            tableBody.innerHTML = '';

            querySnapshot.forEach(docSnap => {
                const usuario = docSnap.data();
                const userId = docSnap.id;

                console.log('👤 Usuario encontrado:', { userId, usuario });

                const tr = document.createElement('tr');
                tr.id = `row-${userId}`;
                tr.innerHTML = `
                    <td><span class="badge bg-secondary">${userId}</span></td>
                    <td><strong>${formatFullName(usuario)}</strong></td>
                    <td><code>${usuario.dni || 'Sin DNI'}</code></td>
                    <td></td>
                `;

                const cell = tr.querySelector('td:last-child');

                const check = document.createElement('input');
                check.type = 'checkbox';
                check.className = 'form-check-input';
                check.title = 'Seleccionar empleado';

                // ⚠️ Ahora el listener se ejecuta al marcar/desmarcar
                check.addEventListener('change', () => {
                    const nombreCompleto = formatFullName(usuario);

                    if (check.checked) {
                        // Agregar si está marcado
                        empleadosSeleccionados.push(nombreCompleto);
                    } else {
                        // Quitar si se desmarca
                        empleadosSeleccionados = empleadosSeleccionados.filter(
                            emp => emp !== nombreCompleto
                        );
                    }

                    console.log("Seleccionados:", empleadosSeleccionados);
                });
                
                cell.appendChild(check);
                tableBody.appendChild(tr);

            });

            showTable(querySnapshot.size);
        } catch (e) {
            console.error("❌ Error en searchByName:", e);
            showError(e.message);
        }
    }

    // 🔹 Cargar todos los usuarios desde Firestore
    async function loadAllUsers() {
        console.log('📊 Cargando todos los usuarios...');
        showLoading();

        try {
            console.log('🔥 Obteniendo colección "usuarios"...');
            const querySnapshot = await getDocs(collection(db, "usuarios"));

            console.log('📊 Total documentos encontrados:', querySnapshot.size);

            if (querySnapshot.empty) {
                console.log('📭 La colección "usuarios" está vacía');
                showNoData();
                return;
            }

            tableBody.innerHTML = '';
            let userCount = 0;

            querySnapshot.forEach(docSnap => {
                const usuario = docSnap.data();
                const userId = docSnap.id;
                userCount++;

                console.log(`👤 Usuario ${userCount}:`, { userId, usuario });

                const tr = document.createElement('tr');
                tr.id = `row-${userId}`;
                tr.innerHTML = `
                    <td><span class="badge bg-secondary">${userId}</span></td>
                    <td><strong>${formatFullName(usuario)}</strong></td>
                    <td><code>${usuario.dni || 'Sin DNI'}</code></td>
                    <td></td>
                `;

                const cell = tr.querySelector("td:last-child");

                const check = document.createElement('input');
                check.type = 'checkbox';
                check.className = 'form-check-input';
                check.title = 'Seleccionar empleado';

                // ⚠️ Ahora el listener se ejecuta al marcar/desmarcar
                check.addEventListener('change', () => {
                    const nombreCompleto = formatFullName(usuario);

                    if (check.checked) {
                        // Agregar si está marcado
                        empleadosSeleccionados.push(nombreCompleto);
                    } else {
                        // Quitar si se desmarca
                        empleadosSeleccionados = empleadosSeleccionados.filter(
                            emp => emp !== nombreCompleto
                        );
                    }

                    console.log("Seleccionados:", empleadosSeleccionados);
                });

                cell.appendChild(check);
                tableBody.appendChild(tr);
            });

            showTable(querySnapshot.size);


        } catch (e) {
            console.error("❌ Error en loadAllUsers:", e);
            showError('Error: ' + e.message);
        }
    }

    // 🎯 Eventos
    if (btnSearch) btnSearch.addEventListener('click', searchByName);
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

    if (searchNameInput) {
        searchNameInput.addEventListener('keypress', e => {
            if (e.key === 'Enter') searchByName();
        });
    }
});
