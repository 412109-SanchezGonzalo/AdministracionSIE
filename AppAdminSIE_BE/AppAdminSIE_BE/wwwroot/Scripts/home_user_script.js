document.addEventListener('DOMContentLoaded', async function () {

    const navbarToggle = document.querySelector('.navbar-toggle');
    const navbarMenu = document.querySelector('.navbar-menu');
    const saludoSpan = document.querySelector('.navbar-saludo');

    let tareaSeleccionada = [];
    let idPedidoSeleccionado;

    const btnPendingTasks = document.getElementById('btnTareasPendientes');
    const btnPedidos = document.getElementById('btnPedidos');

    // Base URL para la API
    const BASE_URL = 'https://administracionsie.onrender.com/api/SIE';

    // ----------------------------------------------------
    //              FUNCIONES UTILITY GLOBALES
    // ----------------------------------------------------

    // Función para manejar errores de fetch
    const safeFetch = async (url, options = {}) => {
        try {
            console.log(`🔄 Realizando petición a: ${url}`);
            const response = await fetch(url, {
                ...options,
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json',
                    ...options.headers
                }
            });

            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }

            return response;
        } catch (error) {
            console.error(`❌ Error en fetch a ${url}:`, error);
            throw error;
        }
    };

    // Función para mostrar mensajes de error globales
    const showErrorMessage = (message, type = 'warning') => {
        const alertClass = type === 'success' ? 'alert-success' : 'alert-warning';
        const errorDiv = document.createElement('div');
        errorDiv.className = `alert ${alertClass} alert-dismissible fade show`;
        errorDiv.style.position = 'fixed';
        errorDiv.style.top = '20px';
        errorDiv.style.right = '20px';
        errorDiv.style.zIndex = '9999';
        errorDiv.innerHTML = `
            ${message}
            <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
        `;
        document.body.appendChild(errorDiv);

        // Auto-remover después de 5 segundos
        setTimeout(() => {
            if (errorDiv.parentNode) {
                errorDiv.parentNode.removeChild(errorDiv);
            }
        }, 5000);
    };

    // ----------------------------------------------------
    //         FUNCIONES ESPECÍFICAS DEL MODAL DE TAREAS
    // ----------------------------------------------------

    // Función para mostrar estado de carga en el modal de tareas
    const mostrarCargandoTareas = () => {
        const modalContent = document.querySelector('#modal-VerTask .modal-content-location');
        if (!modalContent) return;

        // NUEVO: Ocultar botones de navegación
        ocultarBotonesNavegacion();

        // Ocultar formulario y lista existentes
        const formContainer = document.getElementById('formContainer');
        const listGroupContainer = document.getElementById('listGroupContainer');
        if (formContainer) formContainer.style.display = 'none';
        if (listGroupContainer) listGroupContainer.style.display = 'none';

        // Crear o actualizar contenedor de carga
        let loadingContainer = document.getElementById('loadingTareasContainer');
        if (!loadingContainer) {
            loadingContainer = document.createElement('div');
            loadingContainer.id = 'loadingTareasContainer';
            loadingContainer.className = 'text-center p-4';
            modalContent.appendChild(loadingContainer);
        }

        loadingContainer.innerHTML = `
        <div class="d-flex flex-column align-items-center gap-3">
            <div class="spinner-border text-primary" role="status">
                <span class="visually-hidden">Cargando...</span>
            </div>
            <p class="text-muted mb-0">🔄 Cargando tareas asignadas...</p>
        </div>
    `;
        loadingContainer.style.display = 'block';
    };

    // Función para mostrar error en el modal de tareas
    const mostrarErrorTareas = (mensaje) => {
        const modalContent = document.querySelector('#modal-VerTask .modal-content-location');
        if (!modalContent) return;

        // Ocultar otros contenedores
        const formContainer = document.getElementById('formContainer');
        const listGroupContainer = document.getElementById('listGroupContainer');
        const loadingContainer = document.getElementById('loadingTareasContainer');

        if (formContainer) formContainer.style.display = 'none';
        if (listGroupContainer) listGroupContainer.style.display = 'none';
        if (loadingContainer) loadingContainer.style.display = 'none';

        // Crear o actualizar contenedor de error
        let errorContainer = document.getElementById('errorTareasContainer');
        if (!errorContainer) {
            errorContainer = document.createElement('div');
            errorContainer.id = 'errorTareasContainer';
            errorContainer.className = 'text-center p-4';
            modalContent.appendChild(errorContainer);
        }

        errorContainer.innerHTML = `
            <div class="d-flex flex-column align-items-center gap-3">
                <div class="text-danger">
                    <i class="bi bi-exclamation-triangle" style="font-size: 2rem;"></i>
                </div>
                <p class="text-muted mb-2">⚠️ ${mensaje}</p>
                <button class="btn btn-outline-primary btn-sm" onclick="document.getElementById('btnTareasPendientes').click()">
                    🔄 Reintentar
                </button>
            </div>
        `;
        errorContainer.style.display = 'block';
    };

    // Función para ocultar estados de carga/error
    const ocultarEstadosCargaTareas = () => {
        const loadingContainer = document.getElementById('loadingTareasContainer');
        const errorContainer = document.getElementById('errorTareasContainer');

        if (loadingContainer) loadingContainer.style.display = 'none';
        if (errorContainer) errorContainer.style.display = 'none';
    };

    // ----------------------------------------------------
    //                   AUTENTICACIÓN
    // ----------------------------------------------------

    // 🔐 Autenticación y bienvenida
    try {
        const password = localStorage.getItem('user_password');
        if (!password) {
            console.warn('⚠️ No se encontró password en localStorage');
            saludoSpan.textContent = 'Hola, Usuario !';
        } else {
            const response = await safeFetch(`${BASE_URL}/Obtener-nombre-de-usuario-por-contrasena`, {
                method: 'POST',
                body: JSON.stringify(password)
            });

            const userName = await response.text();
            saludoSpan.textContent = `Hola, ${userName} !`;
        }
    } catch (error) {
        console.error('⚠️ Error en autenticación:', error);
        saludoSpan.textContent = 'Hola, Usuario !';
        showErrorMessage('Error de conexión. Verificando servidor...');
    }

    navbarToggle.addEventListener('click', () => {
        window.location.href = "https://administracionsie.onrender.com/Pages/Login_page.html";
    });

    // ----------------------------------------------------
    //                 TAREAS PENDIENTES
    // ----------------------------------------------------

    // Función para limpiar/ocultar botones de navegación
    function ocultarBotonesNavegacion() {
        const btnVolver = document.getElementById('btnVolverLista');
        const btnGuardarCambios = document.getElementById('btnGuardarCambios');

        if (btnVolver) {
            btnVolver.style.display = 'none';
        }
        if (btnGuardarCambios) {
            btnGuardarCambios.style.display = 'none';
        }
    }
    // Función para mostrar botones de navegación
    function mostrarBotonesNavegacion() {
        const btnVolver = document.getElementById('btnVolverLista');
        const btnGuardarCambios = document.getElementById('btnGuardarCambios');

        if (btnVolver) {
            btnVolver.style.display = 'inline-block';
        }
        if (btnGuardarCambios) {
            btnGuardarCambios.style.display = 'inline-block';
        }
    }

    async function verTareas() {
        // Mostrar el modal inmediatamente con indicador de carga
        const modalVerTask = document.getElementById('modal-VerTask');
        if (modalVerTask) {
            // Limpiar contenido previo y mostrar loading
            mostrarCargandoTareas();
            modalVerTask.style.display = 'flex';
        }

        try {
            const password = localStorage.getItem('user_password');
            if (!password) {
                throw new Error('No se encontró la contraseña del usuario');
            }

            const response = await safeFetch(`${BASE_URL}/Obtener-id-usuario-por-contrasena`, {
                method: 'POST',
                body: JSON.stringify(password)
            });

            const employeeId = await response.text();
            await openModalVerTask(employeeId);
        } catch (error) {
            console.error('Error al obtener ID de usuario:', error);
            mostrarErrorTareas('Error al cargar tareas. Verificando conexión...');
            showErrorMessage('Error al cargar tareas. Verificando conexión...');
        }
    }

    async function openModalVerTask(employeeId) {
        try {
            const response = await safeFetch(`${BASE_URL}/Obtener-servicioXusuario-por-usuario?userId=${employeeId}`);
            const data = await response.json();
            const modalVerTask = document.getElementById('modal-VerTask');

            if (!modalVerTask) {
                console.error('Modal no encontrado');
                return;
            }

            // Ocultar estados de carga/error
            ocultarEstadosCargaTareas();

            if (Array.isArray(data) && data.length > 0) {
                if (data.length === 1) {
                    mostrarTareaEnModal(data[0]);
                } else {
                    mostrarListGroupTareas(data);
                }
            } else {
                mostrarErrorTareas('No tienes tareas asignadas en este momento.');
            }
        } catch (error) {
            console.error('Error al obtener datos de la API:', error);
            mostrarErrorTareas('Error al cargar las tareas. Verifica tu conexión.');
        }
    }

    function mostrarTareaEnModal(tarea) {
        // DEBUG: Ver qué datos tenemos
        console.log('🔍 Datos de la tarea recibida:', tarea);
        console.log('🔍 Propiedades de la tarea:', Object.keys(tarea));

        tareaSeleccionada = [tarea];

        // Ocultar estados de carga/error
        ocultarEstadosCargaTareas();

        // NUEVO: Ocultar botones de navegación (no se necesitan para una sola tarea)
        ocultarBotonesNavegacion();

        const listGroupContainer = document.getElementById('listGroupContainer');
        if (listGroupContainer) {
            listGroupContainer.style.display = 'none';
        }
        const formContainer = document.getElementById('formContainer');
        if (formContainer) {
            formContainer.style.display = 'block';
        }

        const activityButton = document.getElementById('activitySelectedByUser');
        const edificioButton = document.getElementById('edificioSelectedByUser');
        const fechaInput = document.getElementById('verDateActivityByUser');
        const observacionesInput = document.getElementById('VerCommentsByUser');

        if (activityButton) activityButton.textContent = tarea.nombreServicio || 'Sin actividad asignada';
        if (edificioButton) edificioButton.textContent = tarea.nombreEdificio || 'Sin edificio asignado';
        if (fechaInput && tarea.fecha) fechaInput.value = new Date(tarea.fecha).toISOString().split('T')[0];
        if (observacionesInput) observacionesInput.value = tarea.observaciones || '';

        // NUEVO: Restablecer título del modal para una sola tarea
        const modalTitle = document.querySelector('#modal-VerTask .modal-header-container h2');
        if (modalTitle) modalTitle.innerHTML = `📝 ${tarea.nombreServicio || 'Tarea sin nombre'}`;
    }

    function mostrarListGroupTareas(tareas) {
        // Ocultar estados de carga/error
        ocultarEstadosCargaTareas();

        // NUEVO: Ocultar botones de navegación cuando se muestra la lista
        ocultarBotonesNavegacion();

        const formContainer = document.getElementById('formContainer');
        if (formContainer) {
            formContainer.style.display = 'none';
        }

        let listGroupContainer = document.getElementById('listGroupContainer');
        if (!listGroupContainer) {
            listGroupContainer = document.createElement('div');
            listGroupContainer.id = 'listGroupContainer';
            listGroupContainer.className = 'mb-3';
            const modalContent = document.querySelector('#modal-VerTask .modal-content-location');
            if (modalContent) {
                const headerContainer = modalContent.querySelector('.modal-header-container');
                modalContent.insertBefore(listGroupContainer, headerContainer.nextSibling || modalContent.firstChild);
            }
        }
        listGroupContainer.innerHTML = `<label class="form-label"><strong>Tareas Asignadas (${tareas.length})</strong></label><div class="list-group" id="tareasListGroup"></div>`;
        listGroupContainer.style.display = 'block';

        const listGroup = document.getElementById('tareasListGroup');
        if (!listGroup) return;

        tareas.forEach((tarea, index) => {
            const listItem = document.createElement('a');
            listItem.href = '#';
            listItem.className = 'list-group-item list-group-item-action';
            let fechaFormateada = tarea.fecha ? new Date(tarea.fecha).toLocaleDateString('es-ES') : 'Sin fecha';
            listItem.innerHTML = `
            <div class="d-flex w-100 justify-content-between">
                <h6 class="mb-1">${tarea.nombreServicio || 'Actividad sin nombre'}</h6>
                <small class="text-muted">${fechaFormateada}</small>
            </div>
            <p class="mb-1"><strong>Edificio:</strong> ${tarea.nombreEdificio || 'Sin edificio'}</p>
            <small class="text-muted">${tarea.observaciones || 'Sin observaciones'}</small>
        `;
            listItem.addEventListener('click', (e) => {
                e.preventDefault();
                abrirDetalleTarea(tarea, index, tareas); // CAMBIO: Pasar todas las tareas
            });
            listGroup.appendChild(listItem);
        });

        // NUEVO: Restablecer título del modal
        const modalTitle = document.querySelector('#modal-VerTask .modal-header-container h2');
        if (modalTitle) modalTitle.innerHTML = '📝 Tareas Asignadas';
    }

    function abrirDetalleTarea(tarea, index, todasLasTareas) {
        const listGroupContainer = document.getElementById('listGroupContainer');
        if (listGroupContainer) listGroupContainer.style.display = 'none';
        const formContainer = document.getElementById('formContainer');
        if (formContainer) formContainer.style.display = 'block';
        mostrarTareaEnModal(tarea);

        // Deshabilitar campos
        document.getElementById('activitySelectedByUser').disabled = true;
        document.getElementById('edificioSelectedByUser').disabled = true;
        document.getElementById('verDateActivityByUser').disabled = true;
        document.getElementById('VerCommentsByUser').disabled = false; // Asegúrate de que este esté habilitado

        // Crea el botón "Volver" si no existe
        let btnVolver = document.getElementById('btnVolverLista');
        if (!btnVolver) {
            btnVolver = document.createElement('button');
            btnVolver.id = 'btnVolverLista';
            btnVolver.type = 'button';
            btnVolver.className = 'btn btn-secondary';
            btnVolver.innerHTML = '← Volver a la Lista';
            document.querySelector('#modal-VerTask .modal-content-location').appendChild(btnVolver);
        }
        // Asegúrate de que el event listener del botón "Volver" esté actualizado
        btnVolver.onclick = () => volverAListaTareas(todasLasTareas);

        // Crea el botón "Guardar Cambios" si no existe
        let btnGuardarCambios = document.getElementById('btnGuardarCambios');
        if (!btnGuardarCambios) {
            btnGuardarCambios = document.createElement('button');
            btnGuardarCambios.id = 'btnGuardarCambios';
            btnGuardarCambios.type = 'button';
            btnGuardarCambios.className = 'btn btn-secondary btn-sm';
            btnGuardarCambios.style.backgroundColor = '#2e7700';
            btnGuardarCambios.style.width = 'auto';
            btnGuardarCambios.style.padding = '4px 12px';
            btnGuardarCambios.style.marginLeft = '10px';
            btnGuardarCambios.innerHTML = 'Guardar Cambios';
            document.querySelector('#modal-VerTask .modal-content-location').appendChild(btnGuardarCambios);
        }

        // **CORRECCIÓN CLAVE**
        // Remueve cualquier event listener anterior para evitar duplicaciones
        btnGuardarCambios.replaceWith(btnGuardarCambios.cloneNode(true));
        btnGuardarCambios = document.getElementById('btnGuardarCambios');

        // Agrega el event listener con la tarea correcta
        btnGuardarCambios.addEventListener('click', () => {
            GuardarCambiosTarea(todasLasTareas[index]);
        });

        // ... (código para mostrar los botones y actualizar el título del modal)
        mostrarBotonesNavegacion();
        const modalTitle = document.querySelector('#modal-VerTask .modal-header-container h2');
        if (modalTitle) modalTitle.innerHTML = `📝 Tarea ${index + 1}: ${tarea.nombreServicio || 'Sin nombre'}`;
    }


    function volverAListaTareas(tareasActualizadas) {
        const formContainer = document.getElementById('formContainer');
        if (formContainer) formContainer.style.display = 'none';
        const listGroupContainer = document.getElementById('listGroupContainer');
        if (listGroupContainer) listGroupContainer.style.display = 'block';

        mostrarListGroupTareas(tareasActualizadas);
        // NUEVO: Ocultar botones al volver a la lista
        ocultarBotonesNavegacion();

        const modalTitle = document.querySelector('#modal-VerTask .modal-header-container h2');
        if (modalTitle) modalTitle.innerHTML = '📝 Tareas Asignadas';
    }

    async function GuardarCambiosTarea(tareaAActualizar) {
        try {
            console.log('🔍 Intentando guardar cambios para tarea:', tareaAActualizar);

            if (!tareaAActualizar) {
                alert('❌ No hay tarea seleccionada');
                return;
            }

            let idServicio = tareaAActualizar.idUsuarioXActividad;

            if (!idServicio) {
                console.error('❌ No se encontró ID de servicio. Propiedades disponibles:', Object.keys(tareaAActualizar));
                alert('❌ Error: No se pudo identificar la tarea');
                return;
            }

            const observacionesInput = document.getElementById('VerCommentsByUser');
            const observacionesExtras = observacionesInput ? observacionesInput.value : '';

            const data = {
                idServicioXUsuario: idServicio,
                observaciones: observacionesExtras
            };

            const btnGuardar = document.getElementById('btnGuardarCambios');
            const textoOriginal = btnGuardar ? btnGuardar.textContent : '';
            if (btnGuardar) {
                btnGuardar.textContent = 'Guardando...';
                btnGuardar.disabled = true;
            }

            const response = await safeFetch(`${BASE_URL}/Editar-observaciones-servicioxusuario`, {
                method: 'PUT',
                body: JSON.stringify(data)
            });

            if (btnGuardar) {
                btnGuardar.textContent = textoOriginal;
                btnGuardar.disabled = false;
            }

            if (!response.ok) {
                const errorText = await response.text();
                console.error('❌ Error del servidor:', errorText);
                alert('❌ No se pudieron guardar los cambios');
                return;
            }

            // CAMBIO CRÍTICO: Actualizar el objeto original en memoria
            tareaAActualizar.observaciones = observacionesExtras;

            alert('✅ Cambios Guardados');
            console.log('✅ Cambios guardados exitosamente');

        } catch (error) {
            console.error('❌ Error al guardar cambios:', error);
            const btnGuardar = document.getElementById('btnGuardarCambios');
            if (btnGuardar) {
                btnGuardar.textContent = 'Guardar Cambios';
                btnGuardar.disabled = false;
            }
            alert('❌ Error al guardar los cambios. Verifica tu conexión.');
            showErrorMessage('Error al guardar cambios. Verifica tu conexión.');
        }
    }

    const closeVerTaskModalBtn = document.getElementById('closeVerTaskModalBtn');
    if (closeVerTaskModalBtn) {
        closeVerTaskModalBtn.addEventListener('click', () => {
            tareaSeleccionada = [];
            // Ocultar botones al cerrar
            ocultarBotonesNavegacion();
            // Limpiar estados de carga/error al cerrar
            ocultarEstadosCargaTareas();
            document.getElementById('modal-VerTask').style.display = "none";
        });
    }

    btnPendingTasks.addEventListener('click', verTareas);

    // ----------------------------------------------------
    //                 PEDIDOS REGISTRADOS
    // ----------------------------------------------------

    async function verPedidosRegistrados() {
        const lista = document.getElementById("listaPedidos");
        lista.innerHTML = `<li class="list-group-item text-muted">Cargando pedidos...</li>`;

        try {
            console.log('🔄 Cargando pedidos...');

            const [respPedidosProductos, respPedidos] = await Promise.all([
                safeFetch(`${BASE_URL}/Obtener-todos-los-pedidoxproducto`),
                safeFetch(`${BASE_URL}/Obtener-todos-los-pedidos`)
            ]);

            const pedidosProductos = await respPedidosProductos.json();
            const pedidos = await respPedidos.json();

            console.log('✅ Pedidos cargados:', { pedidosProductos, pedidos });

            lista.innerHTML = "";

            if (!pedidosProductos || pedidosProductos.length === 0) {
                lista.innerHTML = `<li class="list-group-item text-muted">📭 No hay pedidos registrados</li>`;
                return;
            }

            const pedidosMap = {};
            pedidos.forEach(p => pedidosMap[p.idPedido] = p);
            const pedidosAgrupados = {};

            pedidosProductos.forEach(p => {
                const idPedido = p.idPedido;
                if (!pedidosAgrupados[idPedido]) {
                    const pedidoPrincipal = pedidosMap[idPedido];
                    pedidosAgrupados[idPedido] = {
                        id: idPedido,
                        fechaEntrega: pedidoPrincipal ? pedidoPrincipal.fechaEntrega : null,
                        edificio: p.edificio,
                        observaciones: p.observaciones,
                        productos: []
                    };
                }
                pedidosAgrupados[idPedido].productos.push(p);
            });

            Object.values(pedidosAgrupados).forEach(pedido => {
                const todosEntregados = pedido.productos.every(p => p.estadoPedido === "Entregado");
                const estadoBadge = todosEntregados ? `<span class="badge rounded-pill bg-success">Entregado</span>` : `<span class="badge rounded-pill bg-danger">Pendiente</span>`;
                const cantidadProductos = pedido.productos.length;
                let fechaFormateada = "Sin fecha";
                if (pedido.fechaEntrega) {
                    try {
                        const fecha = new Date(pedido.fechaEntrega);
                        fechaFormateada = fecha.toLocaleDateString('es-ES', { year: 'numeric', month: '2-digit', day: '2-digit' });
                    } catch (e) { fechaFormateada = pedido.fechaEntrega; }
                }

                const item = `
                    <li class="list-group-item d-flex justify-content-between align-items-start pedido-item" 
                        data-pedido-id="${pedido.id}" 
                        style="cursor: pointer; border-left: 4px solid ${todosEntregados ? '#198754' : '#dc3545'};">
                        <div class="ms-2 me-auto">
                            <div class="fw-bold">Pedido #${pedido.id}</div>
                            <div><strong>📅 Fecha:</strong> ${fechaFormateada}</div>
                            <div><strong>🏢 Edificio:</strong> ${pedido.edificio || "Sin edificio"}</div>
                            <small class="text-muted">📦 ${cantidadProductos} producto(s)</small>
                            <br>
                            <small class="text-muted">📝 ${pedido.observaciones || "Sin observaciones"}</small>
                        </div>
                        <div class="text-end">${estadoBadge}<br></div>
                    </li>
                `;
                lista.innerHTML += item;
            });

            document.querySelectorAll('.pedido-item').forEach(item => {
                item.addEventListener('click', async function() {
                    const pedidoId = this.getAttribute('data-pedido-id');
                    const pedidoDetalle = Object.values(pedidosAgrupados).find(p => p.id == pedidoId);
                    if (pedidoDetalle) {
                        mostrarDetallesPedido(pedidoDetalle);
                    } else {
                        showErrorMessage('Error: No se pudo cargar el detalle del pedido');
                    }
                });
            });

        } catch (error) {
            console.error("❌ Error cargando pedidos:", error);
            lista.innerHTML = `<li class="list-group-item text-danger">⚠️ Error cargando pedidos. Verifica tu conexión.</li>`;
            showErrorMessage('Error al cargar pedidos. Verificando servidor...');
        }
    }

    // ----------------------------------------------------
    //                  DETALLES DE PEDIDO
    // ----------------------------------------------------

    function mostrarDetallesPedido(pedido) {
        idPedidoSeleccionado = pedido.id;
        let modalDetalles = document.getElementById('modalDetallesPedido');

        let fechaFormateada = pedido.fechaEntrega ? new Date(pedido.fechaEntrega).toLocaleDateString('es-ES', { year: 'numeric', month: 'long', day: 'numeric' }) : "Sin fecha";

        const titleElement = document.getElementById('modalDetallesPedidoLabel');
        if (titleElement) titleElement.textContent = `📦 Pedido #${pedido.id}`;

        const infoDiv = document.getElementById('detallesPedidoInfo');
        if (infoDiv) {
            const todosEntregados = pedido.productos.every(p => p.estadoPedido === "Entregado");
            const estadoGeneral = todosEntregados ? `<span class="badge bg-success fs-6">✅ Completado</span>` : `<span class="badge bg-danger fs-6">⏳ Pendiente</span>`;
            infoDiv.innerHTML = `
                <div class="card">
                    <div class="card-body">
                        <div class="row">
                            <div class="col-md-6"><p class="mb-2"><strong>📅 Fecha:</strong> ${fechaFormateada}</p></div>
                            <div class="col-md-6"><p class="mb-2"><strong>🏢 Edificio:</strong> ${pedido.edificio || 'Sin especificar'}</p></div>
                            <div class="col-md-6"><p class="mb-2"><strong>📦 Total productos:</strong> ${pedido.productos.length}</p></div>
                            <div class="col-md-6"><p class="mb-2"><strong>📋 Estado:</strong> ${estadoGeneral}</p></div>
                            <div class="col-12 mt-2"><p class="mb-0"><strong>📝 Observaciones:</strong> ${pedido.observaciones || 'Sin observaciones'}</p></div>
                        </div>
                    </div>
                </div>
            `;
        }

        const tablaBody = document.getElementById('tablaDetallesProductos');
        if (tablaBody) {
            tablaBody.innerHTML = '';
            pedido.productos.forEach(producto => {
                const fila = document.createElement("tr");
                const checkbox = `<input type="checkbox" class="form-check-input entregado-checkbox" data-producto-id="${producto.idProducto}" ${producto.estadoPedido === "Entregado" ? "checked disabled" : ""}>`;
                fila.innerHTML = `
                    <td><span class="badge bg-secondary">${producto.idProducto || 'N/A'}</span></td>
                    <td><strong>${producto.nombreProducto || 'Sin nombre'}</strong></td>
                    <td>${producto.cantidad || 'N/A'}</td>
                    <td><code>${producto.unidadMedidaProducto || 'Sin unidad'}</code></td>
                    <td>${checkbox}</td>
                `;
                tablaBody.appendChild(fila);
            });
        }

        const observacionesExtras = document.getElementById('observacionesExtras');
        if (observacionesExtras) {
            observacionesExtras.value = pedido.observaciones || '';
        }

        const modalPedidosElement = document.getElementById('modalPedidos');
        if (modalPedidosElement) {
            const modalPedidos = bootstrap.Modal.getInstance(modalPedidosElement);
            if (modalPedidos) modalPedidos.hide();
        }

        const modalDetallesPedido = new bootstrap.Modal(modalDetalles);
        modalDetallesPedido.show();
    }

    // ----------------------------------------------------
    //                  BOTONES Y EVENTOS
    // ----------------------------------------------------

    btnPedidos.addEventListener('click', () => {
        verPedidosRegistrados();
        const modalPedidos = new bootstrap.Modal(document.getElementById("modalPedidos"));
        modalPedidos.show();
    });

    const btnVolverAVerPedidos = document.getElementById('btnVolverAPedidosRegistrados');
    if (btnVolverAVerPedidos) {
        btnVolverAVerPedidos.addEventListener('click', () => {
            const modalDetalles = bootstrap.Modal.getInstance(document.getElementById('modalDetallesPedido'));
            if (modalDetalles) modalDetalles.hide();

            setTimeout(() => {
                const modalPedidos = new bootstrap.Modal(document.getElementById("modalPedidos"));
                modalPedidos.show();
            }, 300);
        });
    }

    const btnConfirmarEntrega = document.getElementById('btnConfirmarEntrega');
    if (btnConfirmarEntrega) {
        btnConfirmarEntrega.addEventListener('click', () => {
            const productosAEntregar = [];
            document.querySelectorAll(".entregado-checkbox").forEach(chk => {
                if (chk.checked && !chk.disabled) {
                    productosAEntregar.push({
                        idProducto: parseInt(chk.getAttribute("data-producto-id"))
                    });
                }
            });

            const observacionesNuevas = document.getElementById('observacionesExtras')?.value || '';
            actualizarEstadoProductos(productosAEntregar, idPedidoSeleccionado, observacionesNuevas);
        });
    }

    async function actualizarEstadoProductos(productosSeleccionados, idPedido, observaciones) {
        if (!productosSeleccionados || productosSeleccionados.length === 0) {
            showErrorMessage("No hay productos seleccionados para actualizar.");
            return;
        }

        let todosActualizadosConExito = true;

        // Mostrar indicador de carga
        const btnConfirmar = document.getElementById('btnConfirmarEntrega');
        const textoOriginal = btnConfirmar.textContent;
        btnConfirmar.textContent = 'Procesando...';
        btnConfirmar.disabled = true;

        for (const producto of productosSeleccionados) {
            const datosFetch = {
                idPedido: idPedido,
                idProducto: producto.idProducto,
                observacionesExtras: observaciones,
                nuevoEstadoProducto: "Entregado"
            };

            try {
                const response = await safeFetch(`${BASE_URL}/Editar-pedidoxproducto`, {
                    method: 'PUT',
                    body: JSON.stringify(datosFetch)
                });

                console.log(`✅ Producto #${producto.idProducto} del pedido #${idPedido} actualizado.`);
            } catch (error) {
                todosActualizadosConExito = false;
                console.error(`❌ Error al actualizar el producto #${producto.idProducto}:`, error);
                showErrorMessage(`Error al actualizar producto #${producto.idProducto}`);
            }
        }

        // Restaurar botón
        btnConfirmar.textContent = textoOriginal;
        btnConfirmar.disabled = false;

        if (todosActualizadosConExito) {
            try {
                const data = {
                    idPedido: idPedido,
                    nuevoEstado: 'Entregado'
                }
                const responsePedidoEstado = await safeFetch(`${BASE_URL}/Editar-estado-pedido`, {
                    method: 'PUT',
                    body: JSON.stringify(data)
                });

                showErrorMessage("✅ ¡Entrega Confirmada!", 'success');
                console.log(`✅ Estado del Pedido #${idPedido} actualizado correctamente.`);

                // Cerrar modal y recargar lista
                const modalDetalles = bootstrap.Modal.getInstance(document.getElementById('modalDetallesPedido'));
                if (modalDetalles) modalDetalles.hide();

                setTimeout(async () => {
                    await verPedidosRegistrados();
                    const modalPedidos = new bootstrap.Modal(document.getElementById("modalPedidos"));
                    modalPedidos.show();
                }, 500);

            } catch (error) {
                console.error(`❌ Error al actualizar el estado del pedido #${idPedido}:`, error);
                showErrorMessage("Error al confirmar la entrega del pedido.");
            }
        } else {
            showErrorMessage("Algunos productos no pudieron ser actualizados. Revisa la consola para más detalles.");
        }
    }

    // Verificar conectividad al cargar la página
    async function verificarConectividad() {
        try {
            const response = await fetch(`${BASE_URL}/test`, { method: 'HEAD' });
            console.log('✅ Servidor disponible');
        } catch (error) {
            console.warn('⚠️ Problemas de conectividad con el servidor:', error);
            showErrorMessage('Problemas de conectividad. Algunas funciones pueden no estar disponibles.');
        }
    }

    // Ejecutar verificación de conectividad
    verificarConectividad();
});