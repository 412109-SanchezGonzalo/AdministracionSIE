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

        const response = await fetch('/api/SIE/Obtener-nombre-de-usuario-por-contrasena', {
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
        window.location.href = "/Pages/Login_page.html";
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

    // 🔹 Mostrar ubicación desde Firestore en Google Maps
    function showUserLocation(userId, lat, lon) {
        console.log('🗺️ Mostrando ubicación:', { userId, lat, lon });

        if (lat && lon) {
            const modal = document.getElementById('locationModal');
            const mapFrame = document.getElementById('mapFrame');

            if (!modal || !mapFrame) {
                console.error('❌ Modal o mapFrame no encontrados');
                alert('Error: Modal de ubicación no encontrado');
                return;
            }

            mapFrame.src = `https://www.google.com/maps?q=${lat},${lon}&z=15&output=embed`;
            modal.style.display = "flex";
        } else {
            alert("⚠️ El empleado no tiene ubicación activa.");
        }
    }

    // Cerrar modal
    const closeBtn = document.getElementById('closeLocationBtn');
    if (closeBtn) {
        closeBtn.addEventListener('click', () => {
            document.getElementById('locationModal').style.display = "none";
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
                const ubicacion = usuario.ultimaUbicacion;
                console.log('📍 Ubicación del usuario:', ubicacion);

                // Solo crear botón si hay ubicación válida
                if (ubicacion && ubicacion.lat && ubicacion.lon) {
                    const btn = document.createElement('button');
                    btn.className = 'btn btn-outline-info btn-xs';
                    btn.textContent = '📍';
                    btn.title = 'Ver ubicación en mapa';

                    btn.addEventListener('click', () => {
                        showUserLocation(userId, ubicacion.lat, ubicacion.lon);
                    });

                    cell.appendChild(btn);
                } else {
                    // Si no hay ubicación, mostrar guion o celda vacía
                    cell.innerHTML = '<span class="text-muted small">-</span>';
                }
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

    if (searchNameInput) {
        searchNameInput.addEventListener('keypress', e => {
            if (e.key === 'Enter') searchByName();
        });
    }

});