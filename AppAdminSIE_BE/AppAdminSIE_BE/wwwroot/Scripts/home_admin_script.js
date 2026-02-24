
console.log('🔥🔥🔥 HOME_ADMIN_SCRIPT.JS CARGADO - TIMESTAMP:', Date.now());// ===================================
console.log('🔥🔥🔥 HOME_ADMIN_SCRIPT.JS CARGADO - TIMESTAMP:', Date.now());

// 👇 AÑADE ESTO INMEDIATAMENTE DESPUÉS
console.log('🟢 Interceptando openModalVerTask original');
const openModalVerTaskOriginal = window.openModalVerTask;

window.openModalVerTask = function(employeeId, nombreEmpleado) {
    console.log('🟢 openModalVerTask INTERCEPTADA:', employeeId, nombreEmpleado);
    return openModalVerTaskOriginal.call(this, employeeId, nombreEmpleado);
};
// SISTEMA DE LOADING PARA BOTONES
// ===================================

/**
 * Activa el estado de loading en un botón
 * @param {string|HTMLElement} button - ID del botón o elemento del botón
 * @param {string} loadingText - Texto opcional para mostrar durante el loading
 */

console.log("%c🚀 SCRIPT CARGADO CORRECTAMENTE", "color: yellow; background: black; font-size: 20px");

let originalTareasAsignadas = [];
let tareasFiltradas = [];
let currentFilterTypeTareasAsignadas = null;

function setButtonLoading(button, loadingText = null) {
    const btn = typeof button === 'string' ? document.getElementById(button) : button;
    if (!btn) return;

    // Guardar el texto original si no se ha guardado ya
    if (!btn.dataset.originalText) {
        btn.dataset.originalText = btn.innerHTML;
    }

    // Agregar clase de loading
    btn.classList.add('btn-loading');

    // Cambiar el texto si se proporciona
    if (loadingText) {
        btn.innerHTML = `<span class="btn-text">${loadingText}</span>`;
    }

    // Deshabilitar el botón
    btn.disabled = true;
}

/**
 * Desactiva el estado de loading en un botón
 * @param {string|HTMLElement} button - ID del botón o elemento del botón
 * @param {string} newText - Nuevo texto opcional para el botón
 */
function removeButtonLoading(button, newText = null) {
    const btn = typeof button === 'string' ? document.getElementById(button) : button;
    if (!btn) return;

    // Remover clase de loading
    btn.classList.remove('btn-loading');

    // Restaurar el texto original o usar el nuevo texto
    if (newText) {
        btn.innerHTML = `<span class="btn-text">${newText}</span>`;
    } else if (btn.dataset.originalText) {
        btn.innerHTML = btn.dataset.originalText;
    }

    // Habilitar el botón
    btn.disabled = false;
}

/**
 * Simula una operación asíncrona con loading
 * @param {string|HTMLElement} button - ID del botón o elemento del botón
 * @param {Function} asyncOperation - Función asíncrona a ejecutar
 * @param {string} loadingText - Texto durante el loading
 * @param {number} minDelay - Delay mínimo en ms para mostrar el loading
 */
async function executeWithLoading(button, asyncOperation, loadingText = 'Cargando...', minDelay = 500) {
    const btn = typeof button === 'string' ? document.getElementById(button) : button;
    if (!btn) return;

    setButtonLoading(btn, loadingText);

    const startTime = Date.now();

    try {
        // Ejecutar la operación asíncrona
        const result = await asyncOperation();

        // Asegurar que el loading se muestre por el tiempo mínimo
        const elapsedTime = Date.now() - startTime;
        if (elapsedTime < minDelay) {
            await new Promise(resolve => setTimeout(resolve, minDelay - elapsedTime));
        }

        removeButtonLoading(btn);
        return result;
    } catch (error) {
        removeButtonLoading(btn);
        throw error;
    }
}

// Inicializar filtros para Mis Tareas Asignadas

function initializeFiltersTareasAsignadas() {
    console.log('🔵 [INIT] Iniciando filtros');

    const fechaInput = document.getElementById('fechaFiltrada');
    const estadoDropdownBtn = document.getElementById('tareaFiltradaByEstado');
    const edificioInput = document.getElementById('edificioTareaFiltrado');

    console.log('🔵 [CHECK] edificioInput existe?', !!edificioInput);
    console.log('🔵 [CHECK] edificioInput valor:', edificioInput);

    const estadoDropdownItems = document.querySelectorAll('#modal-VerMisTasks .dropdown-menu a');

    if (!fechaInput || !estadoDropdownBtn || !edificioInput) {
        console.error('❌ Faltan elementos:', {
            fechaInput: !!fechaInput,
            estadoDropdownBtn: !!estadoDropdownBtn,
            edificioInput: !!edificioInput
        });
        return; // ← AQUÍ SE DETIENE TODO
    }

    // Filtro por fecha
    fechaInput.addEventListener('change', function() {
        console.log('📅 Filtro de fecha activado:', this.value);

        if (this.value) {
            disableEstadoDropdownTareasAsignadas();
            currentFilterTypeTareasAsignadas = 'fecha';

            tareasFiltradas = originalTareasAsignadas.filter(tarea => {
                const fecha = new Date(tarea.fecha).toISOString().split('T')[0];
                return fecha === this.value;
            });

            console.log('📅 Tareas filtradas por fecha:', tareasFiltradas.length);

            const nombreEmpleado = empleadosSeleccionados[0]?.nombre || 'Usuario';
            mostrarListGroupTareasAsignadas(tareasFiltradas, nombreEmpleado);
        } else {
            enableEstadoDropdownTareasAsignadas();
            currentFilterTypeTareasAsignadas = null;
            tareasFiltradas = [];

            const nombreEmpleado = empleadosSeleccionados[0]?.nombre || 'Usuario';
            mostrarListGroupTareasAsignadas(originalTareasAsignadas, nombreEmpleado);
        }
    });

    // Filtro por estado
    estadoDropdownItems.forEach(item => {
        item.addEventListener('click', function(e) {
            e.preventDefault();

            if (estadoDropdownBtn.disabled) {
                console.log('Dropdown deshabilitado, ignorando click');
                return;
            }

            const estado = this.textContent.trim();
            console.log('🏷️ Filtro de estado activado:', estado);

            disableFechaInputTareasAsignadas();
            estadoDropdownBtn.textContent = estado;
            currentFilterTypeTareasAsignadas = 'estado';

            tareasFiltradas = originalTareasAsignadas.filter(tarea => tarea.estado === estado);

            console.log('🏷️ Tareas filtradas por estado:', tareasFiltradas.length);

            const nombreEmpleado = empleadosSeleccionados[0]?.nombre || 'Usuario';
            mostrarListGroupTareasAsignadas(tareasFiltradas, nombreEmpleado);
        });
    });

    // Filtro por edificio
    // Filtro por edificio - VERSIÓN SIMPLIFICADA
    edificioInput.addEventListener('input', function() {
        console.log('🏢 [INPUT] Evento disparado, valor:', this.value);
        filtrarPorEdificioTarea();
    });

    console.log('✅ Filtros de Mis Tareas Asignadas inicializados correctamente');
}

// Función para filtrar por edificio
function filtrarPorEdificioTarea() {
    console.log('🟢 [1] filtrarPorEdificioTarea EJECUTADA');

    const edificioInput = document.getElementById('edificioTareaFiltrado');
    console.log('🟢 [2] edificioInput:', edificioInput);

    const edificioFiltro = edificioInput?.value?.toLowerCase()?.trim();
    console.log('🟢 [3] edificioFiltro:', edificioFiltro);
    console.log('🟢 [4] originalTareasAsignadas:', originalTareasAsignadas);
    console.log('🟢 [5] originalTareasAsignadas.length:', originalTareasAsignadas?.length);

    let base = originalTareasAsignadas;

    if (currentFilterTypeTareasAsignadas === 'fecha' ||
        currentFilterTypeTareasAsignadas === 'estado') {
        base = tareasFiltradas;
        console.log('🟢 [6] Usando tareasFiltradas como base:', base.length);
    }

    console.log('🟢 [7] Primera tarea completa:', base[0]);
    console.log('🟢 [8] Campos de la primera tarea:', Object.keys(base[0] || {}));

    const tareasFiltradasPorEdificio = base.filter(tarea => {
        if (!edificioFiltro) {
            console.log('🟢 [9] Sin filtro, retornando todas');
            return true;
        }

        const nombreEdif = tarea.nombreEdificio?.toLowerCase();
        console.log(`🟢 [10] Tarea: ${tarea.id}, nombreEdificio: "${tarea.nombreEdificio}", coincide: ${nombreEdif?.includes(edificioFiltro)}`);

        return nombreEdif?.includes(edificioFiltro);
    });

    console.log('🟢 [11] Tareas filtradas:', tareasFiltradasPorEdificio.length);

    const nombreEmpleado = empleadosSeleccionados[0]?.nombre || 'Usuario';
    mostrarListGroupTareasAsignadas(tareasFiltradasPorEdificio, nombreEmpleado);

    console.log('🟢 [12] mostrarListGroupTareasAsignadas ejecutada');
}
// Función ACTUALIZADA para abrir el modal de Ver Tareas con List Group
async function openModalVerTask(employeeId, nombreEmpleado) {
    console.log('🔴 [1] openModalVerTask INICIADA para:', nombreEmpleado);
    console.log('Buscando modal:', document.getElementById('modal-VerMisTasks'));
    console.log('Buscando inputUser:', document.getElementById('verTareaByUser'));

    const modalVerTask = document.getElementById('modal-VerMisTasks');
    const inputUser = document.getElementById('verMiTareaByUser');
    const formContainer = document.getElementById('miFormContainer');
    const filterOptionsContainer = document.getElementById('filterOptionsContainer');
    const closeBtn = document.getElementById('closeVerMisTaskModalBtn');

    if (!modalVerTask || !inputUser || !formContainer || !filterOptionsContainer) {
        console.error('Uno o más elementos del modal no fueron encontrados. Verifique el HTML.');
        return;
    }

    closeBtn.style.display = 'block';
    formContainer.style.display = 'none';
    filterOptionsContainer.style.display = 'flex';
    inputUser.value = nombreEmpleado;
    inputUser.disabled = true;
    modalVerTask.style.display = 'flex';

    limpiarFiltrosTareasAsignadas();
    showLoadingTareas();

    try {
        console.log('🟢 [2] Haciendo fetch...');
        const response = await fetch(`${API_BASE_URL}/api/SIE/Obtener-servicioXusuario-por-usuario?userId=${employeeId}`);

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        console.log('🟢 [3] Data recibida:', data);
        hideLoadingTareas();

        if (Array.isArray(data) && data.length > 0) {
            console.log('🔴 [2] Data recibida, cantidad:', data.length);
            originalTareasAsignadas = data;

            console.log('🔴 [3] Llamando mostrarListGroupTareasAsignadas');
            mostrarListGroupTareasAsignadas(data, nombreEmpleado);

            console.log('🔴 [4] Programando setTimeout');
            setTimeout(() => {
                console.log('🔴 [5] setTimeout ejecutándose');
                initializeFiltersTareasAsignadas();
                console.log('🔴 [6] initializeFiltersTareasAsignadas llamada');
            }, 500);
        }
    } catch (error) {
        console.error('Error al obtener datos de la API:', error);
        hideLoadingTareas();
        showToast('Error al cargar las tareas del empleado: ' + error.message, 'danger');
    }
}


// Luego expones a window
window.initializeFiltersTareasAsignadas = initializeFiltersTareasAsignadas;
window.openModalVerTask = openModalVerTask;
window.filtrarPorEdificioTarea = filtrarPorEdificioTarea;

document.addEventListener('DOMContentLoaded', async function () {
    console.log('🚀 Iniciando admin_home.js...');

    const API_BASE_URL = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
        ? 'http://localhost:5152'  // Local
        : 'https://administracionsie.onrender.com';  // Producción




    // LOADING
    // Lista de IDs de botones que deben tener loading automático
    const buttonIds = [
        'btnNewTask',
        'btnClear',
        /*'btnVerTask',*/
        'btnRetry',
        'btnConfirmar',
        //'btnEditar',
        'btnEliminar',
        'btnConfirmEdit'
    ];

    buttonIds.forEach(buttonId => {
        const button = document.getElementById(buttonId);
        if (button) {
            // Envolver el contenido existente en un span si no lo está ya
            if (!button.querySelector('.btn-text')) {
                button.innerHTML = `<span class="btn-text">${button.innerHTML}</span>`;
            }

            // Agregar event listener para activar loading automáticamente
            button.addEventListener('click', function(e) {
                // Solo activar loading si el botón no está ya en estado loading
                if (!this.classList.contains('btn-loading')) {
                    setButtonLoading(this);

                    // Auto-remover loading después de 3 segundos si no se remueve manualmente
                    setTimeout(() => {
                        if (this.classList.contains('btn-loading')) {
                            removeButtonLoading(this);
                        }
                    }, 3000);
                }
            });
        }
    });



    // 🔹 Array global para guardar seleccionados
    let empleadosSeleccionados = [];
    // 🔹 Array global para guardar Tarea seleccionado
    let tareaSeleccionada = [];
    // 🔹 Array global para almacenar actividades
    let actividadesDisponibles = [];
    let servicioSeleccionadoId = null;
    // 🔹 Array global para almacenar edificios
    let edificiosDisponibles = [];
    let edificioSeleccionadoId = null;

    const navbarToggle = document.querySelector('.navbar-toggle');
    const navbarMenu = document.querySelector('.navbar-menu');
    const saludoSpan = document.querySelector('.navbar-saludo');


    const loadingSpinner = document.getElementById('loadingSpinner');

    const loadingElement = document.getElementById('loading');
    const errorElement = document.getElementById('error-message');
    const noDataElement = document.getElementById('no-data-message');
    const tableWrapper = document.getElementById('table-wrapper');
    const tableBody = document.getElementById('table-body');
    const errorDetails = document.getElementById('error-details');
    const userCount = document.getElementById('user-count');
    const searchNameInput = document.getElementById('search-name');

    searchNameInput.disabled = true;

    const btnAll = document.getElementById('btnAll');
    const btnClear = document.getElementById('btnClear');
    const btnRetry = document.getElementById('btnRetry');
    const btnNewTask = document.getElementById('btnNewTask');
    /*const btnVerTask = document.getElementById('btnVerTask');*/
    const btnVerMisTasks = document.getElementById('btnVerMisTasks');
    const btnConfirm = document.getElementById('btnConfirmar');
    //const btnEditar = document.getElementById('btnEditar');
    const btnEliminar = document.getElementById('btnEliminar');
    const btnConfirmEdit = document.getElementById('btnConfirmarEdicion');


    // 🔍 VERIFICAR ELEMENTOS HTML
    console.log('📋 Elementos encontrados:', {
        loadingElement: !!loadingElement,
        errorElement: !!errorElement,
        noDataElement: !!noDataElement,
        tableWrapper: !!tableWrapper,
        tableBody: !!tableBody,
        btnAll: !!btnAll
    });



    function deshabilitarCampos() {
        // Deshabilitar dropdowns
        const activityDropdownBtn = document.getElementById("activitySelectedByUser");
        const edificioDropdownBtn = document.getElementById("edificioSelectedByUser");

        activityDropdownBtn.disabled = true;
        activityDropdownBtn.classList.add("disabled");
        edificioDropdownBtn.disabled = true;
        edificioDropdownBtn.classList.add("disabled");

        // Deshabilitar el input de fecha
        const dateInput = document.getElementById("verDateActivityByUser");
        dateInput.disabled = true;
        dateInput.readOnly = true;

        // Deshabilitar el textarea de observaciones
        const observacionesTextarea = document.getElementById("VerCommentsByUser");
        observacionesTextarea.disabled = true;
        observacionesTextarea.readOnly = true;

        // Ocultar el botón de confirmar cambios
        const btnConfirmarEdicion = document.getElementById("btnConfirmarEdicion");
        btnConfirmarEdicion.style.display = "none";

        // Mostrar el botón de editar nuevamente
        //const btnEditar = document.getElementById("btnEditar");
        //btnEditar.style.display = "inline-block";

        // Remover la clase de modo edición
        document.getElementById("formContainer").classList.remove("editing-mode");

        // REVERTIR LOS ESTILOS INLINE - Opción 1: Restaurar al valor original
        activityDropdownBtn.style.borderColor = "";
        edificioDropdownBtn.style.borderColor = "";
        dateInput.style.borderColor = "";
        observacionesTextarea.style.borderColor = "";
    }

    const btnVolver = document.getElementById("btnVolverLista");
    if (btnVolver) {
        btnVolver.addEventListener("click", volverAListaTareasAsignadas);
    }

    /*btnEditar.addEventListener("click", function () {
        // Habilitar dropdowns - activar los botones dropdown
        const activityDropdownBtn = document.getElementById("activitySelectedByUser");
        const edificioDropdownBtn = document.getElementById("edificioSelectedByUser");

        // Remover el atributo disabled si existe y habilitar funcionalidad
        activityDropdownBtn.disabled = false;
        activityDropdownBtn.classList.remove("disabled");
        edificioDropdownBtn.disabled = false;
        edificioDropdownBtn.classList.remove("disabled");

        // Habilitar el input de fecha
        const dateInput = document.getElementById("verDateActivityByUser");
        dateInput.disabled = false;
        dateInput.readOnly = false;

        // Habilitar el textarea de observaciones
        const observacionesTextarea = document.getElementById("VerCommentsByUser");
        observacionesTextarea.disabled = false;
        observacionesTextarea.readOnly = false;

        // Mostrar el botón de confirmar cambios
        const btnConfirmarEdicion = document.getElementById("btnConfirmarEdicion");
        btnConfirmarEdicion.style.display = "inline-block";

        // Opcionalmente, ocultar el botón de editar para evitar confusión
        btnEditar.style.display = "none";

        // Cambiar el estilo visual para indicar que los campos están editables
        // Agregar una clase CSS para indicar modo edición
        document.getElementById("formContainer").classList.add("editing-mode");

        // Opcional: Agregar estilos inline para mayor claridad visual
        activityDropdownBtn.style.borderColor = "#0d6efd";
        edificioDropdownBtn.style.borderColor = "#0d6efd";
        dateInput.style.borderColor = "#0d6efd";
        observacionesTextarea.style.borderColor = "#0d6efd";

        cargarActividadesParaEdicion();
        cargarEdificiosParaEdicion();
    });*/


    /*btnConfirmEdit.addEventListener("click", function () {
        if(confirm('¿ Confirmar edición?'))
        {
            UpdateTask();
        }

    })*/

    async function UpdateTask() {

        try {
            const fecha = document.getElementById('verDateActivityByUser').value;
            const observaciones = document.getElementById('VerCommentsByUser').value;

            // Validar que la fecha no esté vacía
            if (!fecha) {
                showToast('Por favor selecciona una fecha', 'warning');
                return;
            }

            // Obtener IDs usando las funciones existentes
            const idServicio = obtenerIdServicio();
            const idEdificio = obtenerIdEdificio();

            console.log("🔍 Depuración - Valores obtenidos:");
            console.log("idServicio:", idServicio, typeof idServicio);
            console.log("idEdificio:", idEdificio, typeof idEdificio);
            console.log("tareaSeleccionada:", tareaSeleccionada);
            console.log("Variables globales:", {
                servicioSeleccionadoId: window.servicioSeleccionadoId,
                edificioSeleccionadoId: window.edificioSeleccionadoId
            });

            // Validar que los IDs sean números válidos
            if (!idServicio || isNaN(parseInt(idServicio))) {
                showToast('Error: ID de servicio no válido', 'danger');
                return;
            }

            if (!idEdificio || isNaN(parseInt(idEdificio))) {
                showToast('Error: ID de edificio no válido', 'danger');
                return;
            }

            const data = {
                idServicioXActividad: tareaSeleccionada.idUsuarioXActividad,
                idServicio: parseInt(idServicio), // ✅ Convertir a número entero
                idEdificio: parseInt(idEdificio), // ✅ Convertir a número entero
                fecha: new Date(fecha + 'T00:00:00').toISOString(),
                observaciones: observaciones || "",
                servixusu: tareaSeleccionada.idUsuarioXActividad || 0 // ✅ Agregar campo requerido
            }

            console.log("📤 Enviando datos corregidos:", data);
            console.log("🌐 URL del endpoint:", `${API_BASE_URL}/api/SIE/Editar-servicioxusuario`);

            // Agregar timeout a la petición
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), 30000); // 30 segundos

            const response = await fetch(`${API_BASE_URL}/api/SIE/Editar-servicioxusuario`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(data),
                signal: controller.signal // Agregar señal de abort
            });

            clearTimeout(timeoutId); // Limpiar timeout si la petición fue exitosa

            if (!response.ok) {
                const errorText = await response.text();
                console.error("❌ Error del servidor:", errorText);
                showToast(`Error ${response.status}: ${errorText}`, 'danger');
                return;
            }

            const result = await response.text();
            console.log("✅ Respuesta del servidor:", result);
            showToast('Tarea editada con éxito!', 'success');

            // Deshabilitar campos después del éxito
            deshabilitarCampos();

        } catch (error) {
            console.error("❌ Error completo:", error);

            // Manejo más específico de errores
            if (error.name === 'TypeError' && error.message.includes('fetch')) {
                showToast('Error de red: Verifica tu conexión a internet', 'danger');
            } else if (error.name === 'SyntaxError') {
                showToast('Error: Respuesta del servidor no válida', 'danger');
            } else if (error.message.includes('timeout')) {
                showToast('Error: Tiempo de espera agotado', 'danger');
            } else {
                showToast(`Error: ${error.message}`, 'danger');
            }
        }

    }

    if(loadingSpinner) {
        loadingSpinner.classList.remove('d-none');
    }

    try {
        const password = sessionStorage.getItem('admin_password');

        const response = await fetch(`${API_BASE_URL}/api/SIE/Obtener-nombre-de-usuario-por-contrasena`, {
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




    function mostrarListGroupTareasAsignadas(tareas, nombreEmpleado) {
        console.log('Mostrando tareas asignadas list group con', tareas.length, 'tareas');

        // Ocultar el formulario original
        const formContainer = document.getElementById('formContainer');
        if (formContainer) {
            formContainer.style.display = 'none';
        }

        // Buscar o crear el contenedor del list group para "Ver Tareas Asignadas"
        let listGroupContainer = document.getElementById('listGroupContainer');

        // ✅ LÓGICA CORREGIDA: Si el contenedor no existe, créalo. Si existe, no hagas nada.
        if (!listGroupContainer) {
            console.log('Creando contenedor de tareas asignadas list group...');

            // Crear el contenedor
            listGroupContainer = document.createElement('div');
            listGroupContainer.id = 'listGroupContainer';
            listGroupContainer.className = 'mb-3';

            // Buscar dónde insertarlo (después del input del usuario)
            const userInputDiv = document.getElementById('verTareaByUser').parentNode;
            const modalContent = userInputDiv.parentNode;

            // Insertar después del div del input del usuario
            modalContent.insertBefore(listGroupContainer, userInputDiv.nextSibling);
        }

        // ✅ LIMPIAR EL CONTENIDO del contenedor antes de agregar la nueva lista
        listGroupContainer.innerHTML = '';

        // Mostrar mensaje si no hay resultados
        if (!tareas || tareas.length === 0) {
            listGroupContainer.innerHTML = `
                <div class="text-center p-4">
                    <h6 class="text-muted">📭 Sin resultados</h6>
                    <p class="small text-muted">No se encontraron tareas con los filtros aplicados.</p>
                </div>
            `;
            listGroupContainer.style.display = 'block';
            return;
        }

        // Crear el HTML del list group
        const titleAndListHtml = `
            <h6 class="fw-bold">Tareas Asignadas a ${nombreEmpleado} (${tareas.length})</h6>
            <ol class="list-group list-group-numbered mt-3" id="tareasAsignadasListGroup"></ol>
        `;

        // ✅ Usar insertAdjacentHTML para agregar la nueva lista sin borrar los filtros
        listGroupContainer.insertAdjacentHTML('beforeend', titleAndListHtml);

        listGroupContainer.style.display = 'block';

        // Buscar el list group que acabamos de crear
        const listGroup = document.getElementById('tareasAsignadasListGroup');

        if (!listGroup) {
            console.error('Error: No se pudo crear el elemento tareasAsignadasListGroup');
            return;
        }

        // Crear elementos del list group
        tareas.forEach((tarea, index) => {
            // ... (Tu lógica para determinar el estado y crear el HTML del li) ...
            let estadoTarea = tarea.estado || 'Pendiente';
            let colorBorde;
            let estadoHtml;

            switch (estadoTarea) {
                case 'Completado':
                case 'Finalizado':
                    colorBorde = '#005488';
                    estadoHtml = '<span class="badge rounded-pill bg-info">Completado</span>';
                    break;
                case 'En Progreso':
                    colorBorde = '#ffc107';
                    estadoHtml = '<span class="badge rounded-pill bg-warning">En Progreso</span>';
                    break;
                case 'FACTURADO':
                    colorBorde = '#198754';
                    estadoHtml = '<span class="badge rounded-pill bg-success">FACTURADO</span>';
                    break;
                case 'Pendiente':
                default:
                    colorBorde = '#dc3545';
                    estadoHtml = '<span class="badge rounded-pill bg-danger">Pendiente</span>';
                    break;
            }

            // Formatear fecha
            let fechaFormateada = 'Sin fecha';
            if (tarea.fecha) {
                try {
                    const fecha = new Date(tarea.fecha);
                    if (!isNaN(fecha.getTime())) {
                        fechaFormateada = fecha.toLocaleDateString('es-ES', {
                            year: 'numeric',
                            month: '2-digit',
                            day: '2-digit'
                        });
                    }
                } catch (e) {
                    fechaFormateada = tarea.fecha;
                }
            }

            const listItem = document.createElement('li');
            listItem.className = 'list-group-item d-flex justify-content-between align-items-start tarea-item flex-wrap';
            listItem.setAttribute('data-tarea-id', tarea.idUsuarioXActividad || index);
            listItem.setAttribute('data-estado-tarea', estadoTarea);
            listItem.style.cursor = 'pointer';
            listItem.style.borderLeft = `4px solid ${colorBorde}`;

            listItem.innerHTML = `
                <div class="ms-2 me-auto">
                    <div class="fw-bold">Tarea #${tarea.idUsuarioXActividad || (index + 1)}</div>
                    <div><strong>📅 Fecha:</strong> ${fechaFormateada}</div>
                    <div><strong>🏢 Edificio:</strong> ${tarea.nombreEdificio || "Sin edificio"}</div>
                    <small class="text-muted">🔧 ${tarea.nombreServicio || 'Actividad sin nombre'}</small>
                    <br>
                    <small class="text-muted">📝 ${tarea.observaciones || "Sin observaciones"}</small>
                </div>
                <div class="text-end">
                    ${estadoHtml}
                    <br>
                </div>
            `;

            // Event listener para abrir el detalle de la tarea (diferente a Mis Tareas)
            listItem.addEventListener('click', (e) => {
                e.preventDefault();
                abrirDetalleTareaAsignada(tarea, index, nombreEmpleado);
            });

            listGroup.appendChild(listItem);
            console.log("✅ List group creado, inicializando filtros...");
            initializeFiltersTareasAsignadas();
        });
    }

// Función para abrir el detalle de una tarea asignada (diferente a Mis Tareas)
    function abrirDetalleTareaAsignada(tarea, index, nombreEmpleado) {
        console.log('Abriendo detalle de tarea asignada:', tarea);

        // Ocultar el botón de cerrar del modal principal
        document.getElementById('closeVerTaskModalBtn').style.display = 'none';

        // Guardar empleado y tarea seleccionada
        empleadosSeleccionados = [{ nombre: nombreEmpleado, id: tarea.idUsuario }];
        tareaSeleccionada = [tarea];
        console.table(tarea);

        // Ocultar listado y filtros
        const listGroupContainer = document.getElementById('listGroupContainer');
        if (listGroupContainer) listGroupContainer.style.display = 'none';

        const filterOptionsContainer = document.getElementById('filterOptionsContainerTareasAsignadas');
        if (filterOptionsContainer) filterOptionsContainer.style.display = 'none';

        // Mostrar formulario de detalle
        const formContainer = document.getElementById('formContainer');
        if (formContainer) formContainer.style.display = 'block';

        // Cargar datos en los campos
        const activityButton = document.getElementById('activitySelectedByUser');
        if (activityButton) {
            activityButton.textContent = tarea.nombreServicio || 'Sin actividad asignada';
            activityButton.disabled = true;
        }

        const edificioButton = document.getElementById('edificioSelectedByUser');
        if (edificioButton) {
            edificioButton.textContent = tarea.nombreEdificio || 'Sin edificio asignado';
            edificioButton.disabled = true;
        }

        const fechaInput = document.getElementById('verDateActivityByUser');
        if (fechaInput && tarea.fecha) {
            const fecha = new Date(tarea.fecha);
            if (!isNaN(fecha.getTime())) {
                fechaInput.value = fecha.toISOString().split('T')[0];
            }
            fechaInput.disabled = true;
        }

        const observacionesInput = document.getElementById('VerCommentsByUser');
        if (observacionesInput) {
            observacionesInput.value = tarea.observaciones || '';
            observacionesInput.disabled = true;
        }

        // Configurar botones según estado
        configurarBotonesEdicionSegunEstado(tarea.estado);

        // Mostrar botón volver
        const btnVolverLista = document.getElementById('btnVolverLista');
        if (btnVolverLista) {
            btnVolverLista.style.display = 'block';
        }

    }

    function volverAListaTareasAsignadas() {
        console.log('🔙 Volviendo a la lista de tareas...');

        // Ocultar formulario de detalle
        const formContainer = document.getElementById('formContainer');
        if (formContainer) {
            formContainer.style.display = 'none';
        }

        // Mostrar lista de tareas
        const listGroupContainer = document.getElementById('listGroupContainer');
        if (listGroupContainer) {
            listGroupContainer.style.display = 'block';
        }

        // Mostrar filtros de tareas
        const filterOptionsContainer = document.getElementById('filterOptionsContainerTareasAsignadas');
        if (filterOptionsContainer) {
            filterOptionsContainer.style.display = 'block';
        }

        // Ocultar botón volver
        const btnVolverLista = document.getElementById('btnVolverLista');
        if (btnVolverLista) {
            btnVolverLista.style.display = 'none';
        }

        // Resetear botones
        //const btnEditar = document.getElementById('btnEditar');
        const btnEliminar = document.getElementById('btnEliminar');
        const btnConfirmEdit = document.getElementById('btnConfirmarEdicion');

        //if (btnEditar) btnEditar.style.display = 'inline-block';
        if (btnEliminar) btnEliminar.style.display = 'inline-block';
        if (btnConfirmEdit) btnConfirmEdit.style.display = 'none';

        const activityDropdownBtn = document.getElementById("activitySelectedByUser");
        const edificioDropdownBtn = document.getElementById("edificioSelectedByUser");

        const dateInput = document.getElementById("verDateActivityByUser");

        const observacionesTextarea = document.getElementById("VerCommentsByUser");

        activityDropdownBtn.style.borderColor = "";
        edificioDropdownBtn.style.borderColor = "";
        dateInput.style.borderColor = "";
        observacionesTextarea.style.borderColor = "";

        const closeBtn = document.getElementById('closeVerTaskModalBtn');
        // ✅ Mostrar el botón de cerrar inmediatamente
        closeBtn.style.display = 'block';


        // Resetear tarea seleccionada
        tareaSeleccionada = [];

        console.log('✅ Volvió a la lista.');
    }



// Funciones para habilitar/deshabilitar filtros en Ver Tareas Asignadas
    function disableFechaInputTareasAsignadas() {
        const fechaInput = document.getElementById('fechaFiltradaEnTareasAsignadas');
        if (fechaInput) {
            fechaInput.disabled = true;
            fechaInput.style.opacity = '0.6';
        }
    }

    function enableFechaInputTareasAsignadas() {
        const fechaInput = document.getElementById('fechaFiltradaEnTareasAsignadas');
        if (fechaInput) {
            fechaInput.disabled = false;
            fechaInput.style.opacity = '1';
        }
    }

    function disableEstadoDropdownTareasAsignadas() {
        const estadoBtn = document.getElementById('tareaAsignadaFiltradaByEstado');
        if (estadoBtn) {
            estadoBtn.disabled = true;
            estadoBtn.style.opacity = '0.6';
        }
    }

    function enableEstadoDropdownTareasAsignadas() {
        const estadoBtn = document.getElementById('tareaAsignadaFiltradaByEstado');
        if (estadoBtn) {
            estadoBtn.disabled = false;
            estadoBtn.style.opacity = '1';
        }
    }

// Función para limpiar filtros de Ver Tareas Asignadas
    function limpiarFiltrosTareasAsignadas() {
        console.log('Limpiando filtros de tareas asignadas...');

        // Limpiar el campo de fecha
        const fechaInput = document.getElementById('fechaFiltradaEnTareasAsignadas');
        if (fechaInput) {
            fechaInput.value = '';
        }

        // Limpiar el dropdown de estado
        const estadoDropdownBtn = document.getElementById('tareaAsignadaFiltradaByEstado');
        if (estadoDropdownBtn) {
            estadoDropdownBtn.textContent = 'Seleccionar Estado';
        }
        enableFechaInputTareasAsignadas();
        enableEstadoDropdownTareasAsignadas();


        // Resetear el tipo de filtro actual
        currentFilterTypeTareasAsignadas = null;

        // Volver a mostrar la lista completa
        const nombreEmpleado = document.getElementById('verTareaByUser').value;

        if (originalTareasAsignadas && originalTareasAsignadas.length > 0) {
            mostrarListGroupTareasAsignadas(originalTareasAsignadas, nombreEmpleado);
        } else {
            console.warn("No se pudo recargar la lista de tareas. El array de tareas originales está vacío.");
        }

        console.log('Filtros de tareas asignadas limpiados y lista recargada.');
    }

    // Variable para mantener las tareas filtradas actuales

    let tareasFiltradas = [];




// Event listener para el botón limpiar filtros en Ver Tareas Asignadas
    const limpiarBtnTareasAsignadas = document.getElementById('limpiarFiltrosBtnEnTareasAsignadas');
    if (limpiarBtnTareasAsignadas) {
        limpiarBtnTareasAsignadas.addEventListener('click', limpiarFiltrosTareasAsignadas);
        console.log('Botón limpiar filtros de tareas asignadas conectado');
    }





    function showLoadingTareas() {
        const loadingTareas = document.getElementById('loadingTareas');
        if (loadingTareas) {
            loadingTareas.classList.remove('d-none');
        }

        // Ocultar contenido de tareas mientras carga
        const listGroupContainer = document.getElementById('listGroupContainer');
        if (listGroupContainer) {
            listGroupContainer.style.display = 'none';
        }

        const formContainer = document.getElementById('formContainer');
        if (formContainer) {
            formContainer.style.display = 'none';
        }

    }

    function hideLoadingTareas() {
        const loadingTareas = document.getElementById('loadingTareas');
        if (loadingTareas) {
            loadingTareas.classList.add('d-none');
        }
    }

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
            const url = `${API_BASE_URL}/api/SIE/Obtener-todas-las-actividades`;
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
            showToast('Error al cargar actividades: ' + error.message,'danger');
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
            const url = `${API_BASE_URL}/api/SIE/Obtener-todos-los-edificios`;
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
            showToast('Error al cargar edificios: ' + error.message,'danger');
        }
    }

    // 🔹 Función CORREGIDA para abrir el modal de Asignar Nueva Tarea
    function openModalNewTask(empleadosSeleccionados) {
        console.table('🔓 Abriendo modal Nueva Tarea para empleados:', empleadosSeleccionados);

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
            tareaSeleccionada = [];
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
            showToast('❌ No se ha seleccionado ningún empleado','warning');
            return;
        }

        if (empleadosSeleccionados.length > 1) {
            showToast('❌ Por favor seleccione solo un empleado para ver sus tareas','warning');
            return;
        }

        // Obtener el empleado seleccionado
        console.table(empleadosSeleccionados);
        const empleadoSeleccionado = empleadosSeleccionados[0];
        console.log('👤 Empleado seleccionado:', empleadoSeleccionado);

        // Llamar a la función que abre el modal
        openModalVerTask(empleadoSeleccionado.id, empleadoSeleccionado.nombre);
    }



// Función para mostrar una tarea individual en el modal
    function mostrarTareaEnModal(tarea) {
        console.table(tarea);

        // Limpiar array antes de agregar nueva tarea
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

        // ✅ MODIFICACIÓN: Configurar botones según el estado en lugar de mostrarlos siempre
        configurarBotonesEdicionSegunEstado(tarea.estado);

        // Asegurar que el botón de confirmación esté oculto inicialmente
        const btnConfirmEdit = document.getElementById('btnConfirmEdit');
        if (btnConfirmEdit) {
            btnConfirmEdit.style.visibility = 'hidden';
        }
    }

    // Función auxiliar para mostrar un mensaje cuando los botones están deshabilitados
    function mostrarMensajeEdicionDeshabilitada(estadoTarea) {
        // Opcional: Agregar un mensaje informativo cuando la edición no está disponible
        const formContainer = document.getElementById('formContainer');
        if (!formContainer) return;

        // Remover mensaje previo si existe
        const mensajePrevio = document.getElementById('mensajeEdicionDeshabilitada');
        if (mensajePrevio) {
            mensajePrevio.remove();
        }

        if (estadoTarea !== 'Pendiente') {
            const mensaje = document.createElement('div');
            mensaje.id = 'mensajeEdicionDeshabilitada';
            mensaje.className = 'alert alert-info mt-3';
            mensaje.innerHTML = `
            <i class="fas fa-info-circle"></i> 
            <strong>Información:</strong> Esta tarea no puede ser editada porque está en estado "${estadoTarea}". 
            Solo las tareas en estado "Pendiente" pueden ser modificadas.
        `;

            /* Insertar antes de los botones
            const btnEditar = document.getElementById('btnEditar');
            if (btnEditar) {
                btnEditar.parentNode.insertBefore(mensaje, btnEditar);
            }*/
        }
    }

// Función para mostrar el list group con múltiples tareas
    function mostrarListGroupTareas(tareas, nombreEmpleado) {
        console.log('Mostrando list group con', tareas.length, 'tareas');

        // Ocultar el formulario original
        const formContainer = document.getElementById('formContainer');
        if (formContainer) {
            formContainer.style.display = 'none';
        }

        // Ocultar botones de acción
        //const btnEditar = document.getElementById('btnEditar');
        const btnEliminar = document.getElementById('btnEliminar');
        //if (btnEditar) btnEditar.style.display = 'none';
        if (btnEliminar) btnEliminar.style.display = 'none';

        // Buscar o crear el contenedor del list group
        let listGroupContainer = document.getElementById('listGroupContainer');

        if (!listGroupContainer) {
            console.log('Creando contenedor de list group...');

            // Crear el contenedor
            listGroupContainer = document.createElement('div');
            listGroupContainer.id = 'listGroupContainer';
            listGroupContainer.className = 'mb-3';

            // Buscar dónde insertarlo (después del input del usuario)
            const userInputDiv = document.getElementById('verTareaByUser').parentNode;
            const modalContent = userInputDiv.parentNode;

            // Insertar después del div del input del usuario
            modalContent.insertBefore(listGroupContainer, userInputDiv.nextSibling);

            console.log('Contenedor creado e insertado');
        }

        // Crear el HTML del list group con estilo de pedidos
        listGroupContainer.innerHTML = `
        <h6 class="fw-bold">Tareas Asignadas (${tareas.length})</h6>
        <ol class="list-group list-group-numbered mt-3" id="tareasListGroup"></ol>
    `;

        listGroupContainer.style.display = 'block';

        // Buscar el list group que acabamos de crear
        const listGroup = document.getElementById('tareasListGroup');

        if (!listGroup) {
            console.error('Error: No se pudo crear el elemento tareasListGroup');
            return;
        }

        console.log('List group encontrado, agregando tareas...');

        // Crear elementos del list group con el estilo de pedidos
        tareas.forEach((tarea, index) => {
            // Determinar el estado y color de borde basado en el estado de la tarea
            let estadoTarea = tarea.estado || 'Pendiente';
            let colorBorde;
            let estadoHtml;

            switch (estadoTarea) {
                case 'Completado':
                case 'Finalizado':
                    colorBorde = '#198754'; // Verde
                    estadoHtml = '<span class="badge rounded-pill bg-success">Completado</span>';
                    break;
                case 'En Progreso':
                    colorBorde = '#ffc107'; // Amarillo
                    estadoHtml = '<span class="badge rounded-pill bg-warning">En Progreso</span>';
                    break;
                case 'Pendiente':
                default:
                    colorBorde = '#dc3545'; // Rojo
                    estadoHtml = '<span class="badge rounded-pill bg-danger">Pendiente</span>';
                    break;
            }

            // Formatear fecha
            let fechaFormateada = 'Sin fecha';
            if (tarea.fecha) {
                try {
                    const fecha = new Date(tarea.fecha);
                    if (!isNaN(fecha.getTime())) {
                        fechaFormateada = fecha.toLocaleDateString('es-ES', {
                            year: 'numeric',
                            month: '2-digit',
                            day: '2-digit'
                        });
                    }
                } catch (e) {
                    fechaFormateada = tarea.fecha;
                }
            }

            const listItem = document.createElement('li');
            listItem.className = 'list-group-item d-flex justify-content-between align-items-start tarea-item flex-wrap';
            listItem.setAttribute('data-tarea-id', tarea.idUsuarioXActividad || index);
            listItem.setAttribute('data-estado-tarea', estadoTarea);
            listItem.style.cursor = 'pointer';
            listItem.style.borderLeft = `4px solid ${colorBorde}`;

            // Estructura similar a la de pedidos
            listItem.innerHTML = `
            <div class="ms-2 me-auto">
                <div class="fw-bold">Tarea #${tarea.idUsuarioXActividad || (index + 1)}</div>
                <div><strong>📅 Fecha:</strong> ${fechaFormateada}</div>
                <div><strong>🏢 Edificio:</strong> ${tarea.nombreEdificio || "Sin edificio"}</div>
                <small class="text-muted">🔧 ${tarea.nombreServicio || 'Actividad sin nombre'}</small>
                <br>
                <small class="text-muted">📝 ${tarea.observaciones || "Sin observaciones"}</small>
            </div>
            <div class="text-end">
                ${estadoHtml}
                <br>
            </div>
        `;

            // Agregar event listener para abrir el detalle de la tarea
            listItem.addEventListener('click', (e) => {
                e.preventDefault();
                abrirDetalleTarea(tarea, index, nombreEmpleado);
            });

            listGroup.appendChild(listItem);
        });
    }

// Updated function to get task status HTML (similar to pedidos)
    function obtenerEstadoTareaHtml(estadoTarea) {
        let texto = '';
        let claseColor = '';

        switch (estadoTarea) {
            case 'Completado':
            case 'Finalizado':
                texto = 'Completado';
                claseColor = 'bg-success';
                break;
            case 'En Progreso':
                texto = 'En Progreso';
                claseColor = 'bg-warning';
                break;
            case 'FACTURADO':
                texto = 'FACTURADO';
                claseColor = 'bg-success';
                break;
            case 'Pendiente':
            default:
                texto = 'Pendiente';
                claseColor = 'bg-danger';
        }

        return `<span class="badge rounded-pill ${claseColor}">${texto}</span>`;
    }

    // Función para abrir el detalle de una tarea específica
    function abrirDetalleTarea(tarea, index, nombreEmpleado) {
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

        // ✅ NUEVA LÍNEA: Configurar botones según el estado de la tarea
        configurarBotonesEdicionSegunEstado(tarea.estado);


// Actualizar el título del modal para indicar qué tarea se está viendo
        const modalTitle = document.querySelector('#modal-VerTask .modal-header-container h2');
        if (modalTitle) {
            modalTitle.innerHTML = `📝 Tarea ${index + 1}: ${tarea.nombreServicio || 'Sin nombre'}`;
        }

    }

// Función para volver a mostrar la lista de tareas
    function volverAMisListaTareas() {
        // Ocultar el formulario
        const miFormContainer = document.getElementById('miFormContainer');
        if (miFormContainer) {
            miFormContainer.style.display = 'none';
        }

        // Mostrar el listado de tareas
        const miListGroupContainer = document.getElementById('miListGroupContainer');
        if (miListGroupContainer) {
            miListGroupContainer.style.display = 'block';
        }

        // ✅ CORRECCIÓN: Volver a mostrar el contenedor de filtros
        const filterOptionsContainer = document.getElementById('filterOptionsContainer');
        if (filterOptionsContainer) {
            filterOptionsContainer.style.display = 'block';
        }

        const filterOptionsContainerEnTareasAsignadas = document.getElementById('filterOptionsContainerTareasAsignadas');

        // Ocultar el botón de volver
        const btnVolverMisLista = document.getElementById('btnVolverMisLista');
        if (btnVolverMisLista) {
            btnVolverMisLista.style.display = 'none';
        }

        // 🧹 Eliminar el contenedor del estado
        const estadoContainer = document.getElementById('miEstadoContainer');
        if (estadoContainer) {
            estadoContainer.remove();
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
            showToast("Ingresa un nombre",'warning');
            return;
        }

        showLoading();

        try {
            const response = await fetch(`${API_BASE_URL}/api/SIE/Obtener-usuario-por-nombre`, {
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
            const response = await fetch(`${API_BASE_URL}/api/SIE/Obtener-todos-los-usuarios`);
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

            // Mostrar showToast con todos los errores
            const mensajeError = 'Por favor corrija los siguientes errores:\n\n' +
                errores.map((error, index) => `${index + 1}. ${error}`).join('\n');
            showToast(mensajeError,'danger');

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
                        fecha: fechaNuevaTarea.value,
                        fechaFinalizacion: null,
                        estado: 'Pendiente'
                    };

                    console.log(`📤 Datos para empleado ${i + 1}:`, datos);

                    // Validar que no haya valores null
                    if (!datos.idUsuario || !datos.idServicio || !datos.idEdificio || !datos.fecha) {
                        console.error('❌ Datos faltantes:', datos);
                        showToast(`Error: Datos faltantes para empleado ${empleadosSeleccionados[i].nombre}`,'danger');
                        continue;
                    }

                    // Enviar petición HTTP
                    const response = await fetch(`${API_BASE_URL}/api/SIE/Crear-servicioXactividad-por-usuario`, {
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

                showToast(`Tareas asignadas correctamente a ${empleadosSeleccionados.length} empleados`,'success');

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
                showToast('Error al asignar tareas: ' + error.message,'danger');
            }

        } else {
            console.log('Formulario inválido - no se enviará');
        }
    }




    // 🔹 Función para llenar el dropdown de actividades EN EL FORMULARIO DE EDICIÓN
    async function cargarActividadesParaEdicion() {
        console.log('🔄 Cargando actividades para edición...');

        try {
            // Si ya tienes las actividades cargadas, úsalas
            let actividades = actividadesDisponibles;

            // Si no están cargadas, cargarlas desde la API
            if (!actividades || actividades.length === 0) {
                const response = await fetch(`${API_BASE_URL}/api/SIE/Obtener-todas-las-actividades`);
                if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
                actividades = await response.json();
                actividadesDisponibles = actividades; // Guardar globalmente
            }

            // Buscar el dropdown del formulario de EDICIÓN (no el de creación)
            const dropdown = document.querySelector('#VerMenuActivities .dropdown-menu');

            if (!dropdown) {
                console.error('❌ No se encontró el dropdown de actividades para edición');
                return;
            }

            console.log('✅ Dropdown de actividades para edición encontrado:', dropdown);

            // Limpiar opciones existentes
            dropdown.innerHTML = '';

            // Agregar actividades como <li> con <button> dentro
            actividades.forEach((actividad) => {
                const li = document.createElement('li');
                const button = document.createElement('button');
                button.className = 'dropdown-item';
                button.type = 'button';
                button.textContent = actividad.descripcion;
                button.setAttribute('data-value', actividad.idServicio);

                button.addEventListener('click', () => {
                    seleccionarActividadParaEdicion(actividad.idServicio, actividad.descripcion);
                });

                li.appendChild(button);
                dropdown.appendChild(li);
            });

            console.log('✅ Dropdown de actividades para edición poblado con', actividades.length, 'actividades');

        } catch (error) {
            console.error('❌ Error al cargar actividades para edición:', error);
            showToast('Error al cargar actividades: ' + error.message, 'danger');
        }
    }

// 🔹 Función para seleccionar una actividad EN EL FORMULARIO DE EDICIÓN
    function seleccionarActividadParaEdicion(id, descripcion) {
        console.log('🎯 Actividad seleccionada para edición:', { id, descripcion });

        // Guardar el ID en variable global
        servicioSeleccionadoId = id;

        // Actualizar el botón del formulario de EDICIÓN
        const botonDropdown = document.getElementById('activitySelectedByUser');

        if (botonDropdown) {
            botonDropdown.textContent = descripcion;
            botonDropdown.setAttribute('data-selected', id);
            console.log('✅ Botón dropdown de actividades (edición) actualizado:', id);

            // Cerrar el dropdown después de seleccionar
            try {
                const dropdown = bootstrap.Dropdown.getInstance(botonDropdown);
                if (dropdown) dropdown.hide();
            } catch (e) {
                console.log('ℹ️ No se pudo cerrar dropdown automáticamente:', e);
            }
        } else {
            console.error('❌ No se encontró el botón activitySelectedByUser');
        }
    }

    // 🔹 Función para llenar el dropdown de edificios EN EL FORMULARIO DE EDICIÓN
    async function cargarEdificiosParaEdicion() {
        console.log('🔄 Cargando edificios para edición...');

        try {
            // Si ya tienes los edificios cargados, úsalos
            let edificios = edificiosDisponibles;

            // Si no están cargados, cargarlos desde la API
            if (!edificios || edificios.length === 0) {
                const response = await fetch(`${API_BASE_URL}/api/SIE/Obtener-todos-los-edificios`);
                if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
                edificios = await response.json();
                edificiosDisponibles = edificios; // Guardar globalmente
            }

            // Buscar el dropdown del formulario de EDICIÓN (no el de creación)
            const dropdown = document.querySelector('#VerMenuEdificios .dropdown-menu');

            if (!dropdown) {
                console.error('❌ No se encontró el dropdown de edificios para edición');
                return;
            }

            console.log('✅ Dropdown de edificios para edición encontrado:', dropdown);

            // Limpiar opciones existentes
            dropdown.innerHTML = '';

            // Agregar edificios como <li> con <button> dentro
            edificios.forEach((edificio) => {
                const li = document.createElement('li');
                const button = document.createElement('button');
                button.className = 'dropdown-item';
                button.type = 'button';
                button.textContent = edificio.nombre;
                button.setAttribute('data-value', edificio.id_Edificio);

                button.addEventListener('click', () => {
                    seleccionarEdificioParaEdicion(edificio.id_Edificio, edificio.nombre);
                });

                li.appendChild(button);
                dropdown.appendChild(li);
            });

            console.log('✅ Dropdown de edificios para edición poblado con', edificios.length, 'edificios');

        } catch (error) {
            console.error('❌ Error al cargar edificios para edición:', error);
            showToast('Error al cargar edificios: ' + error.message, 'danger');
        }
    }

// 🔹 Función para seleccionar un edificio EN EL FORMULARIO DE EDICIÓN
    function seleccionarEdificioParaEdicion(id, nombre) {
        console.log('🎯 Edificio seleccionado para edición:', { id, nombre });

        // Guardar el ID en variable global
        edificioSeleccionadoId = id;

        // Actualizar el botón del formulario de EDICIÓN
        const botonDropdown = document.getElementById('edificioSelectedByUser');

        if (botonDropdown) {
            botonDropdown.textContent = nombre;
            botonDropdown.setAttribute('data-selected', id);
            console.log('✅ Botón dropdown de edificios (edición) actualizado:', id);

            // Cerrar el dropdown después de seleccionar
            try {
                const dropdown = bootstrap.Dropdown.getInstance(botonDropdown);
                if (dropdown) dropdown.hide();
            } catch (e) {
                console.log('ℹ️ No se pudo cerrar dropdown automáticamente:', e);
            }
        } else {
            console.error('❌ No se encontró el botón edificioSelectedByUser');
        }
    }


    // 🎯 Eventos
    if (btnAll) btnAll.addEventListener('click', loadAllUsers);
    if (btnClear) btnClear.addEventListener('click', clearTable);
    if (btnRetry) btnRetry.addEventListener('click', loadAllUsers);
    if(btnEliminar) btnEliminar.addEventListener('click', DeleteTask);



    async function DeleteTask(){

        const nombreEmpleado = empleadosSeleccionados[0].nombre;
        if(confirm(`¿ Esta seguro que desea eliminar la tarea asignada al empleado ${nombreEmpleado} ?`))
        {
            try
            {
                const idServicioXActividad = tareaSeleccionada[0].idUsuarioXActividad;

                const response = await fetch(`${API_BASE_URL}/api/SIE/Eliminar-servicioxusuario`,{
                    method: 'DELETE',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(idServicioXActividad)
                });
                if (!response.ok) {
                    const errorText = await response.text();
                    console.error("❌ Error del servidor para empleado ${nombreEmpleado}");
                    tareaSeleccionada = [];
                }

                const resultado = await response.json();
                showToast(`✅ La Tarea asignada al empleado ${nombreEmpleado} fué eliminada con éxito`,'success');
                tareaSeleccionada = [];
                const modalVerTask = document.getElementById('modal-VerTask');
                modalVerTask.style.display = 'none';

            } catch(error)
            {
                showToast("Error al eliminar la tarea: " + error.message,'danger');
                tareaSeleccionada = [];
            }
        }

    }


    // ----------------------------
    //         MIS TAREAS
    // ----------------------------


    let currentFilterType = null; // 'fecha' | 'estado' | null
    let originalTareas = []; // To store the original task list

// ===================================
// GLOBAL FILTER FUNCTIONS
// ===================================

// Your showToast function (no changes needed)
    function showToast(message, type = "info") {
        const toastLive = document.getElementById('liveToast');
        const toastBody = document.getElementById('toast-message');

        if (toastBody && toastLive) {
            toastBody.innerHTML = message;
            toastLive.className = "toast align-items-center border-0";

            switch (type) {
                case "success":
                    toastLive.classList.add("text-bg-success");
                    break;
                case "error":
                    toastLive.classList.add("text-bg-danger");
                    break;
                case "warning":
                    toastLive.classList.add("text-bg-warning");
                    break;
                default:
                    toastLive.classList.add("text-bg-dark");
                    break;
            }

            const toast = new bootstrap.Toast(toastLive, {
                autohide: true,
                delay: 3000
            });

            toast.show();
        }
    }

// Function to clean all filters and reset the view
    function limpiarFiltros() {
        console.log('🗑️ Limpiando filtros...');
        const fechaInput = document.getElementById('fechaFiltrada');
        const fechaInputEnTareaAsignada = document.getElementById('fechaFiltradaEnTareasAsignadas');
        const estadoDropdownBtn = document.getElementById('tareaFiltradaByEstado');
        const estadoDropdownBtnEnTareaAsignada = document.getElementById('tareaAsignadaFiltradaByEstado');

        if (fechaInput) fechaInput.value = '';
        if(fechaInputEnTareaAsignada)  fechaInputEnTareaAsignada.value = '';
        if (estadoDropdownBtn) estadoDropdownBtn.textContent = 'Seleccionar Estado';
        if(estadoDropdownBtnEnTareaAsignada) estadoDropdownBtnEnTareaAsignada.textContent = 'Seleccionar Estado';

        enableFechaInput();
        enableEstadoDropdown();
        currentFilterType = null;

        // ✅ CORRECCIÓN: Volver a mostrar las tareas originales
        mostrarMisListGroupTareas(originalTareas, empleadosSeleccionados[0]?.nombre || 'Usuario');

        console.log('✅ Filtros limpiados. Se muestra la lista completa.');
    }

// Functions to enable/disable filter inputs
    function enableEstadoDropdown() {
        const estadoDropdownBtn = document.getElementById('tareaFiltradaByEstado');
        if (estadoDropdownBtn) {
            estadoDropdownBtn.disabled = false;
            estadoDropdownBtn.classList.remove('disabled');
            estadoDropdownBtn.style.pointerEvents = 'auto';
            estadoDropdownBtn.style.opacity = '1';
        }
        const estadoDropdownBtnEnTareaAsignada = document.getElementById('tareaAsignadaFiltradaByEstado');
        if (estadoDropdownBtnEnTareaAsignada) {
            estadoDropdownBtnEnTareaAsignada.disabled = false;
            estadoDropdownBtnEnTareaAsignada.classList.remove('disabled');
            estadoDropdownBtnEnTareaAsignada.style.pointerEvents = 'auto';
            estadoDropdownBtnEnTareaAsignada.style.opacity = '1';
        }
    }

    function enableFechaInput() {
        const fechaInput = document.getElementById('fechaFiltrada');
        if (fechaInput) {
            fechaInput.disabled = false;
            fechaInput.classList.remove('disabled');
            fechaInput.style.pointerEvents = 'auto';
            fechaInput.style.opacity = '1';
        }
        const fechaInputEnTareaAsignada = document.getElementById('fechaFiltradaEnTareasAsignadas');
        if (fechaInputEnTareaAsignada){
            fechaInputEnTareaAsignada.disabled = false;
            fechaInputEnTareaAsignada.classList.remove('disabled');
            fechaInputEnTareaAsignada.style.pointerEvents = 'auto';
            fechaInputEnTareaAsignada.style.opacity = '1';
        }
    }

    function disableEstadoDropdown() {
        const estadoDropdownBtn = document.getElementById('tareaFiltradaByEstado');
        if (estadoDropdownBtn) {
            estadoDropdownBtn.disabled = true;
            estadoDropdownBtn.classList.add('disabled');
            estadoDropdownBtn.style.pointerEvents = 'none';
            estadoDropdownBtn.style.opacity = '0.5';
        }
    }

    function disableFechaInput() {
        const fechaInput = document.getElementById('fechaFiltrada');
        if (fechaInput) {
            fechaInput.disabled = true;
            fechaInput.classList.add('disabled');
            fechaInput.style.pointerEvents = 'none';
            fechaInput.style.opacity = '0.5';
        }
    }

// ✅ Function to display filtered tasks
    function mostrarMisListGroupTareas(tareas, nombreEmpleado) {
        console.log('Mostrando mis tareas list group con', tareas.length, 'tareas');

        // Ocultar el formulario original
        const miFormContainer = document.getElementById('miFormContainer');
        if (miFormContainer) {
            miFormContainer.style.display = 'none';
        }

        // Buscar o crear el contenedor del list group para "Mis Tareas"
        let miListGroupContainer = document.getElementById('miListGroupContainer');

        if (!miListGroupContainer) {
            console.log('Creando contenedor de mis tareas list group...');

            // Crear el contenedor
            miListGroupContainer = document.createElement('div');
            miListGroupContainer.id = 'miListGroupContainer';
            miListGroupContainer.className = 'mb-3';

            // Buscar dónde insertarlo (después del input del usuario)
            const userInputDiv = document.getElementById('verMiTareaByUser').parentNode;
            const modalContent = userInputDiv.parentNode;

            // Insertar después del div del input del usuario
            modalContent.insertBefore(miListGroupContainer, userInputDiv.nextSibling);
        }

        // Crear el HTML del list group
        miListGroupContainer.innerHTML = `
        <h6 class="fw-bold">Mis Tareas Asignadas (${tareas.length})</h6>
        <ol class="list-group list-group-numbered mt-3" id="misTareasListGroup"></ol>
    `;

        miListGroupContainer.style.display = 'block';

        // Buscar el list group que acabamos de crear
        const listGroup = document.getElementById('misTareasListGroup');

        if (!listGroup) {
            console.error('Error: No se pudo crear el elemento misTareasListGroup');
            return;
        }

        // Crear elementos del list group
        tareas.forEach((tarea, index) => {
            // Determinar el estado y color de borde
            let estadoTarea = tarea.estado || 'Pendiente';
            let colorBorde;
            let estadoHtml;

            switch (estadoTarea) {
                case 'Completado':
                case 'Finalizado':
                    colorBorde = '#198754';
                    estadoHtml = '<span class="badge rounded-pill bg-success">Completado</span>';
                    break;
                case 'En Progreso':
                    colorBorde = '#ffc107';
                    estadoHtml = '<span class="badge rounded-pill bg-warning">En Progreso</span>';
                    break;
                case 'FACTURADO':
                    colorBorde = '#198754';
                    estadoHtml = '<span class="badge rounded-pill bg-success">FACTURADO</span>';
                    break;
                case 'Pendiente':
                default:
                    colorBorde = '#dc3545';
                    estadoHtml = '<span class="badge rounded-pill bg-danger">Pendiente</span>';
                    break;
            }

            // Formatear fecha
            let fechaFormateada = 'Sin fecha';
            if (tarea.fecha) {
                try {
                    const fecha = new Date(tarea.fecha);
                    if (!isNaN(fecha.getTime())) {
                        fechaFormateada = fecha.toLocaleDateString('es-ES', {
                            year: 'numeric',
                            month: '2-digit',
                            day: '2-digit'
                        });
                    }
                } catch (e) {
                    fechaFormateada = tarea.fecha;
                }
            }

            const listItem = document.createElement('li');
            listItem.className = 'list-group-item d-flex justify-content-between align-items-start tarea-item flex-wrap';
            listItem.setAttribute('data-tarea-id', tarea.idUsuarioXActividad || index);
            listItem.setAttribute('data-estado-tarea', estadoTarea);
            listItem.style.cursor = 'pointer';
            listItem.style.borderLeft = `4px solid ${colorBorde}`;

            listItem.innerHTML = `
            <div class="ms-2 me-auto">
                <div class="fw-bold">Mi Tarea #${tarea.idUsuarioXActividad || (index + 1)}</div>
                <div><strong>📅 Fecha:</strong> ${fechaFormateada}</div>
                <div><strong>🏢 Edificio:</strong> ${tarea.nombreEdificio || "Sin edificio"}</div>
                <small class="text-muted">🔧 ${tarea.nombreServicio || 'Actividad sin nombre'}</small>
                <br>
                <small class="text-muted">📝 ${tarea.observaciones || "Sin observaciones"}</small>
            </div>
            <div class="text-end">
                ${estadoHtml}
                <br>
            </div>
        `;

            // IMPORTANTE: Event listener para abrir el modal correcto
            listItem.addEventListener('click', (e) => {
                e.preventDefault();
                abrirDetalleMiTarea(tarea, index, nombreEmpleado);
            });

            listGroup.appendChild(listItem);
        });
    }

// ✅ Function to initialize event listeners for filters
    function initializeFiltersMisTareas() {
        console.log('🔧 Inicializando filtros del modal de Mis Tareas...');
        const fechaInput = document.getElementById('fechaFiltrada');
        const estadoDropdownItems = document.querySelectorAll('#modal-VerMisTasks .dropdown-menu a');
        const estadoDropdownBtn = document.getElementById('tareaFiltradaByEstado');
        const edificioInput = document.getElementById('edificioTareaFiltrado');

        if (!fechaInput || !estadoDropdownItems.length || !estadoDropdownBtn || !edificioInput) {
            console.error('❌ No se encontraron todos los elementos de filtro necesarios.');
            return;
        }

        // Inicializamos dataset para estado
        estadoDropdownBtn.dataset.estado = '';

        // 🔎 FUNCIÓN INTERNA PARA FILTRAR (no es global)
        function filtrarTareas() {

            const fechaValor = fechaInput.value;
            const estadoValor = estadoDropdownBtn.dataset.estado;
            const edificioValor = edificioInput.value?.toLowerCase()?.trim();

            // Si no hay ningún filtro activo → mostrar todo
            if (!fechaValor && !estadoValor && !edificioValor) {
                mostrarMisListGroupTareas(originalTareas, empleadosSeleccionados[0].nombre);
                return;
            }

            const tareasFiltradas = originalTareas.filter(tarea => {

                // 📅 Fecha
                if (fechaValor) {
                    const fechaTarea = new Date(tarea.fecha)
                        .toLocaleDateString('sv-SE');

                    if (fechaTarea !== fechaValor) return false;
                }


                // 📌 Estado
                if (estadoValor) {
                    if (tarea.estado !== estadoValor) return false;
                }

                // 🏢 Edificio
                if (edificioValor) {
                    const nombre = String(tarea.nombreEdificio || '')
                        .toLowerCase()
                        .trim();

                    if (!nombre.includes(edificioValor)) return false;
                }

                return true;
            });

            mostrarMisListGroupTareas(tareasFiltradas, empleadosSeleccionados[0].nombre);
        }

        // 📅 Evento fecha
        fechaInput.addEventListener('change', function() {
            filtrarTareas();
        });

        // 📌 Evento estado
        estadoDropdownItems.forEach(item => {
            item.addEventListener('click', function(e) {
                e.preventDefault();

                const estadoSeleccionado = this.textContent.trim();

                estadoDropdownBtn.textContent = estadoSeleccionado;
                estadoDropdownBtn.dataset.estado = estadoSeleccionado;

                filtrarTareas();
            });
        });

        // 🏢 Evento edificio
        edificioInput.addEventListener('input', function() {
            filtrarTareas();
        });

        console.log('✅ Filtros de Mis Tareas inicializados correctamente');
    }


    // Función específica para mostrar loading en modal "Mis Tareas"
    function showLoadingMisTareas() {
        const loadingMisTareas = document.getElementById('loadingMisTareas');
        if (loadingMisTareas) {
            loadingMisTareas.classList.remove('d-none');
        }

        // Ocultar contenido mientras carga
        const miFormContainer = document.getElementById('miFormContainer');
        if (miFormContainer) {
            miFormContainer.style.display = 'none';
        }

        // Ocultar list group si existe
        const miListGroupContainer = document.getElementById('miListGroupContainer');
        if (miListGroupContainer) {
            miListGroupContainer.style.display = 'none';
        }
    }

// Función específica para ocultar loading en modal "Mis Tareas"
    function hideLoadingMisTareas() {
        const loadingMisTareas = document.getElementById('loadingMisTareas');
        if (loadingMisTareas) {
            loadingMisTareas.classList.add('d-none');
        }
    }

// Función para mostrar el list group de "Mis Tareas"
    function mostrarMisListGroupTareas(tareas, nombreEmpleado) {
        console.log('Mostrando mis tareas list group con', tareas.length, 'tareas');

        // Ocultar el formulario original
        const miFormContainer = document.getElementById('miFormContainer');
        if (miFormContainer) {
            miFormContainer.style.display = 'none';
        }

        // Buscar o crear el contenedor del list group para "Mis Tareas"
        let miListGroupContainer = document.getElementById('miListGroupContainer');

        if (!miListGroupContainer) {
            console.log('Creando contenedor de mis tareas list group...');

            // Crear el contenedor
            miListGroupContainer = document.createElement('div');
            miListGroupContainer.id = 'miListGroupContainer';
            miListGroupContainer.className = 'mb-3';

            // Buscar dónde insertarlo (después del input del usuario)
            const userInputDiv = document.getElementById('verMiTareaByUser').parentNode;
            const modalContent = userInputDiv.parentNode;

            // Insertar después del div del input del usuario
            modalContent.insertBefore(miListGroupContainer, userInputDiv.nextSibling);
        }
        // ✅ NUEVA LÓGICA: Mostrar mensaje si no hay resultados
        if (!tareas || tareas.length === 0) {
            miListGroupContainer.innerHTML = `
            <div class="text-center p-4">
                <h6 class="text-muted">📭 Sin resultados</h6>
                <p class="small text-muted">No se encontraron tareas con los filtros aplicados.</p
            </div>
        `;
            miListGroupContainer.style.display = 'block';
            return;
        }

        // Crear el HTML del list group
        miListGroupContainer.innerHTML = `
        <h6 class="fw-bold">Mis Tareas Asignadas (${tareas.length})</h6>
        <ol class="list-group list-group-numbered mt-3" id="misTareasListGroup"></ol>
    `;

        miListGroupContainer.style.display = 'block';

        // Buscar el list group que acabamos de crear
        const listGroup = document.getElementById('misTareasListGroup');

        if (!listGroup) {
            console.error('Error: No se pudo crear el elemento misTareasListGroup');
            return;
        }

        // Crear elementos del list group
        tareas.forEach((tarea, index) => {
            // Determinar el estado y color de borde
            let estadoTarea = tarea.estado || 'Pendiente';
            let colorBorde;
            let estadoHtml;

            switch (estadoTarea) {
                case 'Completado':
                case 'Finalizado':
                    colorBorde = '#198754';
                    estadoHtml = '<span class="badge rounded-pill bg-success">Completado</span>';
                    break;
                case 'En Progreso':
                    colorBorde = '#ffc107';
                    estadoHtml = '<span class="badge rounded-pill bg-warning">En Progreso</span>';
                    break;
                case 'FACTURADO':
                    colorBorde = '#198754'; // Verde
                    estadoHtml = '<span class="badge rounded-pill bg-success">FACTURADO</span>';
                    break;
                case 'Pendiente':
                default:
                    colorBorde = '#dc3545';
                    estadoHtml = '<span class="badge rounded-pill bg-danger">Pendiente</span>';
                    break;
            }

            // Formatear fecha
            let fechaFormateada = 'Sin fecha';
            if (tarea.fecha) {
                try {
                    const fecha = new Date(tarea.fecha);
                    if (!isNaN(fecha.getTime())) {
                        fechaFormateada = fecha.toLocaleDateString('es-ES', {
                            year: 'numeric',
                            month: '2-digit',
                            day: '2-digit'
                        });
                    }
                } catch (e) {
                    fechaFormateada = tarea.fecha;
                }
            }

            const listItem = document.createElement('li');
            listItem.className = 'list-group-item d-flex justify-content-between align-items-start tarea-item flex-wrap';
            listItem.setAttribute('data-tarea-id', tarea.idUsuarioXActividad || index);
            listItem.setAttribute('data-estado-tarea', estadoTarea);
            listItem.style.cursor = 'pointer';
            listItem.style.borderLeft = `4px solid ${colorBorde}`;

            listItem.innerHTML = `
            <div class="ms-2 me-auto">
                <div class="fw-bold">Mi Tarea #${tarea.idUsuarioXActividad || (index + 1)}</div>
                <div><strong>📅 Fecha:</strong> ${fechaFormateada}</div>
                <div><strong>🏢 Edificio:</strong> ${tarea.nombreEdificio || "Sin edificio"}</div>
                <small class="text-muted">🔧 ${tarea.nombreServicio || 'Actividad sin nombre'}</small>
                <br>
                <small class="text-muted">📝 ${tarea.observaciones || "Sin observaciones"}</small>
            </div>
            <div class="text-end">
                ${estadoHtml}
                <br>
            </div>
        `;

            // IMPORTANTE: Cambiar el event listener para abrir el modal correcto
            listItem.addEventListener('click', (e) => {
                e.preventDefault();
                abrirDetalleMiTarea(tarea, index, nombreEmpleado);
            });

            listGroup.appendChild(listItem);
        });
    }

// Función para abrir el detalle de MI tarea específica
    function abrirDetalleMiTarea(tarea, index, nombreEmpleado) {
        console.log('Abriendo detalle de mi tarea:', tarea);

        // Limpiar y guardar la tarea seleccionada
        tareaSeleccionada = [tarea];

        // Ocultar el listado de tareas
        const miListGroupContainer = document.getElementById('miListGroupContainer');
        if (miListGroupContainer) {
            miListGroupContainer.style.display = 'none';
        }

        // ✅ CORRECCIÓN: Ocultar el contenedor de filtros
        const filterOptionsContainer = document.getElementById('filterOptionsContainer');
        if (filterOptionsContainer) {
            filterOptionsContainer.style.display = 'none';
        }

        // Mostrar el formulario de "Mis Tareas"
        const miFormContainer = document.getElementById('miFormContainer');
        if (miFormContainer) {
            miFormContainer.style.display = 'block';
        }

        // Determinar el estado de la tarea y configurar el badge
        let estadoTarea = tarea.estado || 'Pendiente';
        let colorBorde;
        let estadoHtml;

        switch (estadoTarea) {
            case 'Completado':
            case 'Finalizado':
                colorBorde = '#198754'; // Verde
                estadoHtml = '<span class="badge rounded-pill bg-success">Completado</span>';
                break;
            case 'En Progreso':
                colorBorde = '#ffc107'; // Amarillo
                estadoHtml = '<span class="badge rounded-pill bg-warning">En Progreso</span>';
                break;
            case 'FACTURADO':
                colorBorde = '#198754'; // Verde
                estadoHtml = '<span class="badge rounded-pill bg-success">FACTURADO</span>';
                break;
            case 'Pendiente':
            default:
                colorBorde = '#dc3545'; // Rojo
                estadoHtml = '<span class="badge rounded-pill bg-danger">Pendiente</span>';
                break;
        }

        // Buscar o crear el contenedor del estado
        let estadoContainer = document.getElementById('miEstadoContainer');
        if (!estadoContainer) {
            estadoContainer = document.createElement('div');
            estadoContainer.id = 'miEstadoContainer';
            estadoContainer.className = 'mb-3 text-center';

            // Insertar después del input del empleado
            const userInputDiv = document.getElementById('verMiTareaByUser').parentNode;
            const modalContent = userInputDiv.parentNode;
            modalContent.insertBefore(estadoContainer, userInputDiv.nextSibling);
        }

        // Actualizar el contenido del estado
        estadoContainer.innerHTML = `
    <div class="mb-2">
        <strong>Estado de la tarea:</strong><br>
        <span id="estadoTarea">${estadoHtml}</span>
    </div>
    `;

        // Llenar los campos con los datos de la tarea
        const activityButton = document.getElementById('activitySelectedByMe');
        const edificioButton = document.getElementById('edificioSelectedByMe');
        const fechaInput = document.getElementById('verDateActivityByMe');
        const observacionesInput = document.getElementById('VerCommentsByMe');

        if (activityButton) {
            activityButton.textContent = tarea.nombreServicio || 'Sin actividad asignada';
            activityButton.setAttribute('data-selected', tarea.idServicio || '');
            activityButton.disabled = true; // SOLO LECTURA
        }

        if (edificioButton) {
            edificioButton.textContent = tarea.nombreEdificio || 'Sin edificio asignado';
            edificioButton.setAttribute('data-selected', tarea.idEdificio || '');
            edificioButton.disabled = true; // SOLO LECTURA
        }

        if (fechaInput && tarea.fecha) {
            const fecha = new Date(tarea.fecha);
            if (!isNaN(fecha.getTime())) {
                fechaInput.value = fecha.toISOString().split('T')[0];
            }
            fechaInput.disabled = true; // SOLO LECTURA
        }

        if (observacionesInput) {
            observacionesInput.value = tarea.observaciones || '';
            observacionesInput.disabled = false; // SOLO ESTE CAMPO SE PUEDE EDITAR
        }

        // Configurar el botón según el estado de la tarea
        configurarBotonSegunEstado(estadoTarea);

        // NO cargar dropdowns ya que no se pueden editar los otros campos

        // Agregar botón para volver a la lista (si no existe)
        let btnVolverMisLista = document.getElementById('btnVolverMisLista');
        if (!btnVolverMisLista) {
            let btnsContainer = document.getElementById('misBtnsContainer');
            if (!btnsContainer) {
                btnsContainer = document.createElement('div');
                btnsContainer.id = 'misBtnsContainer';
                btnsContainer.className = 'd-flex flex-wrap justify-content-between gap-2 mt-3';

                const btnFinalizar = document.getElementById('btnFinalizarTarea');
                if (btnFinalizar) {
                    btnFinalizar.parentNode.insertBefore(btnsContainer, btnFinalizar);
                } else {
                    const btnComenzar = document.getElementById('btnComenzarTarea');
                    if (btnComenzar) {
                        btnComenzar.parentNode.insertBefore(btnsContainer, btnComenzar);
                    } else {
                        const btnConfirmarCambios = document.getElementById('btnConfirmarCambios');
                        if (btnConfirmarCambios) {
                            btnConfirmarCambios.parentNode.insertBefore(btnsContainer, btnConfirmarCambios);
                        }
                    }
                }
            }

            // Crear y añadir el botón una sola vez
            btnVolverMisLista = document.createElement('button');
            btnVolverMisLista.id = 'btnVolverMisLista';
            btnVolverMisLista.type = 'button';
            btnVolverMisLista.className = 'btn btn-secondary';
            btnVolverMisLista.innerHTML = '← Volver a Mis Tareas';
            btnsContainer.insertBefore(btnVolverMisLista, btnsContainer.firstChild);

            btnVolverMisLista.addEventListener('click', () => {
                volverAMisListaTareas();
            });
        }

        // Muestra el botón de volver
        btnVolverMisLista.style.display = 'inline-block';
    }

// Función para volver a mostrar la lista de "Mis Tareas"
    function volverAMisListaTareas() {
        // Ocultar formulario
        const miFormContainer = document.getElementById('miFormContainer');
        if (miFormContainer) {
            miFormContainer.style.display = 'none';
        }

        // Mostrar list group
        const miListGroupContainer = document.getElementById('miListGroupContainer');
        if (miListGroupContainer) {
            miListGroupContainer.style.display = 'block';
        }

        // ✅ CORRECCIÓN: Mostrar el contenedor de filtros
        const filterOptionsContainer = document.getElementById('filterOptionsContainer');
        if (filterOptionsContainer) {
            filterOptionsContainer.style.display = 'block';
        }
        const filterOptionsContainerEnTareaAsignada = document.getElementById('filterOptionsContainerTareasAsignadas');
        if (filterOptionsContainerEnTareaAsignada){
            filterOptionsContainerEnTareaAsignada.style.display = 'block';
        }

        // Ocultar botón volver
        const btnVolverMisLista = document.getElementById('btnVolverMisLista');
        if (btnVolverMisLista) {
            btnVolverMisLista.style.display = 'none';
        }

        // 🧹 Eliminar contenedor del estado
        const estadoContainer = document.getElementById('miEstadoContainer');
        if (estadoContainer) {
            estadoContainer.remove();
        }
    }



    function configurarBotonesEdicionSegunEstado(estadoTarea) {
        console.log('🔧 Configurando botones para estado:', estadoTarea);

        //const btnEditar = document.getElementById('btnEditar');
        const btnEliminar = document.getElementById('btnEliminar');
        const btnConfirmEdit = document.getElementById('btnConfirmarEdicion');
        const btnFacturar = document.getElementById("btnFacturar");

        /*if (!btnEditar || !btnEliminar || !btnConfirmEdit) {
            console.error('❌ No se encontraron los botones');
            return;
        }*/

        const estado = estadoTarea ? estadoTarea.trim() : 'Pendiente';

        if (estado === 'Pendiente') {
            //btnEditar.style.display = 'inline-block';
            btnEliminar.style.display = 'inline-block';
            btnConfirmEdit.style.display = 'none';
            console.log('✅ Editar/Eliminar habilitados');
        } else {
            if(estado === 'Completado')
            {
                btnEliminar.style.display = 'inline-block';
                btnFacturar.style.display = 'inline-block';
            }else {
                if(estado === 'FACTURADO')
                {
                    /*btnEliminar.style.display = 'none';*/
                    btnFacturar.style.display = 'none';
                }else {
                    //btnEditar.style.display = 'none';
                    btnConfirmEdit.style.display = 'none';
                    btnEliminar.style.display = 'none';
                    console.log('🚫 Botones de edición deshabilitados');
                }
            }

        }
    }


    // Configura los botones y el campo observaciones según el estado
    // Configura los botones y el campo observaciones según el estado
    function configurarBotonSegunEstado(estadoTarea) {
        const btnComenzar = document.getElementById('btnComenzarTarea');
        const btnConfirmarCambios = document.getElementById('btnConfirmarCambios');
        const btnFinalizar = document.getElementById('btnFinalizarTarea');
        const observacionesInput = document.getElementById('VerCommentsByMe');

        if (!btnComenzar || !btnConfirmarCambios || !btnFinalizar || !observacionesInput) {
            console.error("No se encontraron todos los elementos del DOM. Asegúrate de que los botones existan.");
            return;
        }

        // Ocultar todos los botones por defecto
        btnComenzar.style.display = 'none';
        btnConfirmarCambios.style.display = 'none';
        btnFinalizar.style.display = 'none';

        // --- ESTADO: PENDIENTE ---
        if (estadoTarea === 'Pendiente') {
            observacionesInput.disabled = true;
            btnComenzar.style.display = 'inline-block';

            // --- ESTADO: EN PROGRESO ---
        } else if (estadoTarea === 'En Progreso') {
            observacionesInput.disabled = false;
            /*btnEliminar.style.display = 'none';*/
            btnConfirmarCambios.style.display = 'inline-block';
            btnFinalizar.style.display = 'inline-block';

            // --- ESTADO: COMPLETADO / FINALIZADO ---
        } else if (estadoTarea === 'Completado' || estadoTarea === 'Finalizado') {
            observacionesInput.disabled = true;
            btnFacturar.style.display = 'inline-block';

            // --- ESTADO: FACTURADO ---
        } else if (estadoTarea === 'FACTURADO') {
            observacionesInput.disabled = true;

        }
    }


    // Inicia la tarea → cambia estado a "En Proceso"
    async function iniciarTarea() {
        try {
            if (!tareaSeleccionada[0]) throw new Error("No hay tarea seleccionada");
            const idServicioXUsuario = tareaSeleccionada[0].idUsuarioXActividad;

            const datos = { id: idServicioXUsuario, newStatus: "En Proceso" };
            const response = await fetch(`${API_BASE_URL}/api/SIE/Editar-estado-servicioxusuario`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(datos)
            });

            if (!response.ok) throw new Error(`Error: ${response.status}`);
            tareaSeleccionada[0].estado = "En Proceso";

            abrirDetalleMiTarea(tareaSeleccionada[0], 0, '');
            showToast("✅ Tarea iniciada y ahora está en proceso.",'success');
        } catch (err) {
            console.error("❌ Error al iniciar tarea:", err);
            showToast("Error al iniciar tarea: " + err.message,'warning');
        }
    }
    // Confirma cambios de observaciones
    // ✅ FUNCIÓN MODIFICADA
    async function confirmarCambiosMisTareas() {
        try {
            if (!tareaSeleccionada[0]) {
                throw new Error("No hay tarea seleccionada");
            }
            const idServicioXUsuario = tareaSeleccionada[0].idUsuarioXActividad;
            const observacionesInput = document.getElementById('VerCommentsByMe');
            const nuevasObservaciones = observacionesInput.value.trim();

            const datos = {
                idServicioXUsuario: idServicioXUsuario,
                observaciones: nuevasObservaciones
            };

            const response = await fetch(`${API_BASE_URL}/api/SIE/Editar-observaciones-servicioxusuario`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(datos)
            });

            if (!response.ok) {
                throw new Error(`Error: ${response.status}`);
            }

            // 1. Actualiza el elemento de la lista para mostrar los nuevos datos.
            const listItem = document.querySelector(`.tarea-item[data-tarea-id="${idServicioXUsuario}"]`);
            if (listItem) {
                const observacionesElement = listItem.querySelector('small.text-muted:last-of-type');
                if (observacionesElement) {
                    observacionesElement.textContent = `📝 ${nuevasObservaciones || "Sin observaciones"}`;
                }
            }

            // ✅ 2. BÚSQUEDA Y ACTUALIZACIÓN EN EL ARRAY ORIGINAL
            const tareaEnArrayOriginal = originalTareas.find(t => t.idUsuarioXActividad === idServicioXUsuario);
            if (tareaEnArrayOriginal) {
                tareaEnArrayOriginal.observaciones = nuevasObservaciones;
            }

            showToast("✅ Observaciones actualizadas correctamente.",'success');

        } catch (err) {
            console.error("❌ Error al confirmar cambios:", err);
            showToast("Error al confirmar cambios: " + err.message,'danger');

        } finally {
            // 3. Esta línea se ejecutará siempre, asegurando que vuelvas a la lista.
            volverAMisListaTareas();
        }
    }

    // Finaliza la tarea → cambia estado a "Finalizado"
    async function finalizarTarea() {
        try {
            if (!tareaSeleccionada[0]) throw new Error("No hay tarea seleccionada");
            const idServicioXUsuario = tareaSeleccionada[0].idUsuarioXActividad;

            const datos = { id: idServicioXUsuario, newStatus: "Finalizado" };
            const response = await fetch(`${API_BASE_URL}/api/SIE/Editar-estado-servicioxusuario`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(datos)
            });

            if (!response.ok) throw new Error(`Error: ${response.status}`);
            tareaSeleccionada[0].estado = "Finalizado";

            abrirDetalleMiTarea(tareaSeleccionada[0], 0, '');
            showToast("✅ Tarea finalizada correctamente.",'success');
        } catch (err) {
            console.error("❌ Error al finalizar tarea:", err);
            showToast("Error al finalizar tarea: " + err.message,'warning');
        }
    }

// MODIFICAR la función misTareas() existente para usar el modal correcto:
    async function misTareas() {
        try {
            /*const password = sessionStorage.getItem('admin_password');
            const response = await fetch(`${API_BASE_URL}/api/SIE/Obtener-usuario-por-contrasena`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(password)
            });

            if (!response.ok) {
                showToast("No tienes tareas asignadas",'danger');
                return;
            }

            const userData = await response.json();
            const empleadoInfo = {
                id: userData.idUsuario || 'N/A',
                nombre: userData.nombre || 'Sin nombre',
                dni: userData.nicknameDni || 'Sin DNI'
            };

            empleadosSeleccionados = [empleadoInfo];*/
            const empleadoSeleccionado = empleadosSeleccionados[0];

            const modalVerMisTasks = document.getElementById('modal-VerMisTasks');
            const inputUser = document.getElementById('verMiTareaByUser');
            if (!modalVerMisTasks || !inputUser) return;
            inputUser.value = empleadoSeleccionado.nombre;
            inputUser.disabled = true;
            modalVerMisTasks.style.display = 'flex';
            showLoadingMisTareas();

            const response2 = await fetch(`${API_BASE_URL}/api/SIE/Obtener-servicioXusuario-por-usuario?userId=${empleadoSeleccionado.id}`);
            if (!response2.ok) throw new Error(`HTTP error! status: ${response2.status}`);

            const taskData = await response2.json();
            hideLoadingMisTareas();

            if (Array.isArray(taskData) && taskData.length > 0) {
                originalTareas = taskData; // ✅ Guardar una copia de las tareas originales
                mostrarMisListGroupTareas(originalTareas, empleadoSeleccionado.nombre);
            } else {
                showToast("No tienes tareas asignadas",'danger');
                originalTareas = []; // Limpiar la lista si no hay tareas
            }

        } catch (error) {
            console.error('Error en misTareas:', error);
            hideLoadingMisTareas();
            showToast('Error al cargar tus tareas: ' + error.message,'danger');
        }
    }


// Agregar event listener para cerrar el modal "Mis Tareas"
    const closeVerMisTaskModalBtn = document.getElementById('closeVerMisTaskModalBtn');
    if (closeVerMisTaskModalBtn) {
        closeVerMisTaskModalBtn.addEventListener('click', () => {

            // ✅ CORRECCIÓN: Llama a la función de limpieza antes de cerrar el modal
            volverAMisListaTareas();

            // Luego, cierra el modal
            tareaSeleccionada = [];
            empleadosSeleccionados = [];
            document.getElementById('modal-VerMisTasks').style.display = "none";
        });
    }





    const btnComenzar = document.getElementById('btnComenzarTarea');
    if (btnComenzar) {
        btnComenzar.addEventListener('click', async () => {
            try {
                if(confirm('Desea Comenzar esta Tarea?'))
                {
                    const idServicioXUsuario = tareaSeleccionada[0].idUsuarioXActividad;
                    const response = await fetch(`${API_BASE_URL}/api/SIE/Editar-estado-servicioxusuario`, {
                        method: "PUT",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({ id: idServicioXUsuario, newStatus: "En Progreso" })
                    });

                    if (!response.ok) throw new Error("Error al actualizar estado");
                    tareaSeleccionada[0].estado = "En Progreso";

                    // Refrescar el badge y los botones
                    const spanEstado = document.getElementById("estadoTarea");
                    if (spanEstado) {
                        spanEstado.innerHTML = '<span class="badge rounded-pill bg-warning">En Progreso</span>';
                    }
                    configurarBotonSegunEstado("En Progreso");

                    // Actualizar el elemento en el listGroup
                    const listItem = document.querySelector(`.tarea-item[data-tarea-id="${idServicioXUsuario}"]`);
                    if (listItem) {
                        listItem.style.borderLeft = `4px solid #ffc107`;
                        const estadoDiv = listItem.querySelector('.text-end');
                        if(estadoDiv) {
                            estadoDiv.innerHTML = `<span class="badge rounded-pill bg-warning">En Progreso</span><br>`;
                        }
                    }
                    showToast("✅ Tarea iniciada y ahora está en progreso.",'success');
                }

            } catch (error) {
                console.error("❌ Error al iniciar tarea:", error);
                showToast("Error al iniciar tarea: " + error.message,'warning');
            }
        });
    }

    const btnFinalizar = document.getElementById('btnFinalizarTarea');
    if (btnFinalizar) {
        btnFinalizar.addEventListener('click', async () => {
            try {
                if(confirm('Desea Finalizar esta Tarea?'))
                {
                    const idServicioXUsuario = tareaSeleccionada[0].idUsuarioXActividad;
                    const response = await fetch(`${API_BASE_URL}/api/SIE/Editar-estado-servicioxusuario`, {
                        method: "PUT",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({ id: idServicioXUsuario, newStatus: "Completado" })
                    });

                    if (!response.ok) throw new Error("Error al actualizar estado");
                    tareaSeleccionada[0].estado = "Completado";

                    const spanEstado = document.getElementById("estadoTarea");
                    if (spanEstado) {
                        spanEstado.innerHTML = '<span class="badge rounded-pill bg-success">Completado</span>';
                    }
                    configurarBotonSegunEstado("Completado");

                    const listItem = document.querySelector(`.tarea-item[data-tarea-id="${idServicioXUsuario}"]`);
                    if (listItem) {
                        listItem.style.borderLeft = `4px solid #198754`;
                        const estadoDiv = listItem.querySelector('.text-end');
                        if(estadoDiv) {
                            estadoDiv.innerHTML = `<span class="badge rounded-pill bg-success">Completado</span><br>`;
                        }
                    }
                    showToast("✅ Tarea finalizada correctamente.",'success');
                }

            } catch (error) {
                console.error("❌ Error al finalizar tarea:", error);
                showToast("Error al finalizar tarea: " + error.message,'danger');
            }
        });
    }

    const btnConfirmarCambios = document.getElementById('btnConfirmarCambios');
    if (btnConfirmarCambios) {
        btnConfirmarCambios.addEventListener('click', async () => {
            await confirmarCambiosMisTareas();
        });
    }

    const btnFacturar = document.getElementById('btnFacturar');
    if (btnFacturar) {
        btnFacturar.addEventListener('click', async () => {
            try {
                if(confirm('Desea FACTURAR esta Tarea?'))
                {
                    const idServicioXUsuario = tareaSeleccionada[0].idUsuarioXActividad;
                    const response = await fetch(`${API_BASE_URL}/api/SIE/Editar-estado-servicioxusuario`, {
                        method: "PUT",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({ id: idServicioXUsuario, newStatus: "FACTURADO" })
                    });

                    if (!response.ok) throw new Error("Error al actualizar estado");
                    tareaSeleccionada[0].estado = "FACTURADO";

                    // Refrescar el badge y los botones
                    const spanEstado = document.getElementById("estadoTarea");
                    if (spanEstado) {
                        spanEstado.innerHTML = '<span class="badge rounded-pill bg-success">FACTURADO</span>';
                    }
                    configurarBotonesEdicionSegunEstado('FACTURADO')

                    // Actualizar el elemento en el listGroup
                    const listItem = document.querySelector(`.tarea-item[data-tarea-id="${idServicioXUsuario}"]`);
                    if (listItem) {
                        listItem.style.borderLeft = `4px solid #198754`;
                        const estadoDiv = listItem.querySelector('.text-end');
                        if(estadoDiv) {
                            estadoDiv.innerHTML = `<span class="badge rounded-pill bg-success">FACTURADO</span><br>`;
                        }
                    }
                    showToast("✅ Tarea FACTURADA",'success');
                }

            } catch (error) {
                console.error("❌ Error al facturar la tarea:", error);
                showToast("Error al facturar la tarea: " + error.message,'warning');
            }
        });
    }

    const limpiarBtn = document.getElementById('limpiarFiltrosBtn');
    if (limpiarBtn) {
        limpiarBtn.addEventListener('click', limpiarFiltros);
        console.log('✅ Botón limpiar filtros conectado');
    }



    if(btnVerMisTasks){
        btnVerMisTasks.addEventListener('click', async () => {
            if (empleadosSeleccionados.length === 0) {
                showToast("Por favor selecciona un empleado.",'warning');
                return;
            }

            await misTareas();
            initializeFiltersMisTareas(); // ✅ Llamar a la función de inicialización aquí
        });
    }


    btnNewTask.addEventListener('click', async () => {
        if (empleadosSeleccionados.length === 0) {
            showToast("Por favor selecciona al menos un empleado.",'warning');
            return;
        }

        // Pasar todos los seleccionados al modal
        openModalNewTask(empleadosSeleccionados);
    })

    /*btnVerTask.addEventListener('click', async () => {

        verTareas();
    })*/

    if (btnConfirm) {
        btnConfirm.addEventListener('click', handleFormSubmit);
    }

    if (searchNameInput) {
        searchNameInput.addEventListener('input', e => {
            filtrarUsuariosPorNombre(e.target.value);
        });
    }

    try {
        loadAllUsers();
    } finally {
        if(loadingSpinner){
            loadingSpinner.classList.add('d-none');
        }
    }

});
// ===================================
// FUNCIONES ESPECÍFICAS PARA LA APLICACIÓN
// ===================================

/**
 * Maneja el loading del botón de búsqueda
 */


/**
 * Maneja el loading del botón de nueva tarea
 */
async function handleNewTaskButton() {
    await executeWithLoading('btnNewTask', async () => {
        // Aquí va tu lógica para abrir modal de nueva tarea
        console.log('Abriendo modal de nueva tarea...');
        // Simular carga de datos
        await new Promise(resolve => setTimeout(resolve, 800));
    }, 'Abriendo...');
}

/**
 * Maneja el loading del botón de ver tareas
 */
/*async function handleVerTaskButton() {
    await executeWithLoading('btnVerTask', async () => {
        // Aquí va tu lógica para ver tareas
        console.log('Cargando tareas asignadas...');
        // Simular carga de datos
        await new Promise(resolve => setTimeout(resolve, 1200));
    }, 'Cargando tareas...');
}

/**
 * Maneja el loading del botón de confirmar
 */
async function handleConfirmarButton() {
    await executeWithLoading('btnConfirmar', async () => {
        // Aquí va tu lógica para confirmar tarea
        console.log('Guardando tarea...');
        // Simular guardado
        await new Promise(resolve => setTimeout(resolve, 1500));
    }, 'Guardando...');
}

// ===================================
// EXPORTAR FUNCIONES PARA USO GLOBAL
// ===================================

// Exponer funciones al objeto window para que el HTML pueda verlas
// Exponer funciones al objeto global window

// Si estás usando módulos ES6
// export { setButtonLoading, removeButtonLoading, executeWithLoading };

// Para uso global (sin módulos)
window.ButtonLoading = {
    set: setButtonLoading,
    remove: removeButtonLoading,
    executeWith: executeWithLoading,
    /*handleSearch: handleSearchButton,*/
    handleNewTask: handleNewTaskButton,
    handleConfirmar: handleConfirmarButton
};