
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

    /*  BOTON PÉDIDOS */


    async function verPedidosRegistrados(){
        const lista = document.getElementById("listaPedidos");

        try {
            // Obtener datos de ambas tablas
            console.log("Obteniendo datos de ambas tablas...");

            const [respPedidosProductos, respPedidos] = await Promise.all([
                fetch("https://administracionsie.onrender.com/api/SIE/Obtener-todos-los-pedidoxproducto"),
                fetch("https://administracionsie.onrender.com/api/SIE/Obtener-todos-los-pedidos")
            ]);

            const pedidosProductos = await respPedidosProductos.json();
            const pedidos = await respPedidos.json();

            console.log("PedidosXProductos:", pedidosProductos);
            console.log("Pedidos:", pedidos);

            lista.innerHTML = ""; // limpiar lista antes de renderizar

            if (!pedidosProductos || pedidosProductos.length === 0) {
                lista.innerHTML = `<li class="list-group-item text-muted">📭 No hay pedidos registrados</li>`;
                return;
            }

            // CREAR un mapa de pedidos por ID para acceso rápido a las fechas
            const pedidosMap = {};
            pedidos.forEach(pedido => {
                pedidosMap[pedido.idPedido] = pedido;
            });

            // AGRUPAR PedidosXProductos por idPedido
            const pedidosAgrupados = {};

            pedidosProductos.forEach(pedidoProducto => {
                const idPedido = pedidoProducto.idPedido;

                if (!pedidosAgrupados[idPedido]) {
                    const pedidoPrincipal = pedidosMap[idPedido];

                    pedidosAgrupados[idPedido] = {
                        id: idPedido,
                        fechaEntrega: pedidoPrincipal ? pedidoPrincipal.fechaEntrega : null,
                        edificio: pedidoProducto.edificio,
                        observaciones: pedidoProducto.observaciones,
                        productos: []
                    };
                }

                pedidosAgrupados[idPedido].productos.push(pedidoProducto);
            });

            console.log("Pedidos agrupados con fechas:", pedidosAgrupados);

            // RENDERIZAR cada pedido agrupado
            Object.values(pedidosAgrupados).forEach(pedido => {
                const todosEntregados = pedido.productos.every(p => p.estadoPedido === "Entregado");
                const estadoBadge = todosEntregados
                    ? `<span class="badge rounded-pill bg-success">Entregado</span>`
                    : `<span class="badge rounded-pill bg-danger">Pendiente</span>`;

                const cantidadProductos = pedido.productos.length;

                // Formatear fecha correctamente
                let fechaFormateada = "Sin fecha";
                if (pedido.fechaEntrega) {
                    try {
                        const fecha = new Date(pedido.fechaEntrega);
                        fechaFormateada = fecha.toLocaleDateString('es-ES', {
                            year: 'numeric',
                            month: '2-digit',
                            day: '2-digit'
                        });
                    } catch (e) {
                        fechaFormateada = pedido.fechaEntrega;
                    }
                }

                let item = `
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
                    <div class="text-end">
                        ${estadoBadge}
                        <br>
                    </div>
                </li>
            `;
                lista.innerHTML += item;
            });

            // ⭐ AGREGAR event listeners para mostrar detalles al hacer clic
            document.querySelectorAll('.pedido-item').forEach(item => {
                item.addEventListener('click', async function() {
                    const pedidoId = this.getAttribute('data-pedido-id');
                    console.log('Clic en pedido ID:', pedidoId);

                    try {
                        // Buscar el pedido específico en los datos ya cargados
                        const pedidoDetalle = Object.values(pedidosAgrupados).find(p => p.id == pedidoId);

                        if (pedidoDetalle) {
                            mostrarDetallesPedido(pedidoDetalle);
                        } else {
                            console.error('No se encontró el pedido con ID:', pedidoId);
                            alert('Error: No se pudo cargar el detalle del pedido');
                        }
                    } catch (error) {
                        console.error('Error al mostrar detalles del pedido:', error);
                        alert('Error al cargar detalles del pedido');
                    }
                });
            });

        } catch (error) {
            console.error("Error cargando pedidos:", error);
            lista.innerHTML = `<li class="list-group-item text-danger">⚠️ Error cargando pedidos: ${error.message}</li>`;
        }
    }


    // 🔹 AGREGAR esta nueva función después de verPedidosRegistrados():

    function mostrarDetallesPedido(pedido) {
        console.log('Mostrando detalles del pedido:', pedido);

        // Buscar modal existente o crearlo
        let modalDetalles = document.getElementById('modalDetallesPedido');

        if (!modalDetalles) {
            // Crear modal si no existe
            modalDetalles = document.createElement('div');
            modalDetalles.className = 'modal fade';
            modalDetalles.id = 'modalDetallesPedido';
            modalDetalles.setAttribute('tabindex', '-1');
            modalDetalles.innerHTML = `
            <div class="modal-dialog modal-lg modal-dialog-centered">
                <div class="modal-content">
                    <div class="modal-header" style="background-color: #212529; color: white;">
                        <h5 class="modal-title" id="modalDetallesTitle">📦 Detalles del Pedido</h5>
                        <button type="button" class="btn-close btn-close-white" data-bs-dismiss="modal"></button>
                    </div>
                    <div class="modal-body">
                        <div id="detallesPedidoInfo" class="mb-4"></div>
                        <h6 class="fw-bold mb-3">📋 Productos del Pedido:</h6>
                        <div class="table-responsive">
                            <table class="table table-striped table-hover compact-table">
                                <thead class="table-dark">
                                    <tr>
                                        <th scope="col" style="width: 15%;">ID</th>
                                        <th scope="col" style="width: 40%;">Producto</th>
                                        <th scope="col" style="width: 15%;">Cantidad</th>
                                        <th scope="col" style="width: 20%;">Unidad</th>
                                        <th scope="col" style="width: 40%;">Entregado</th>
                                    </tr>
                                </thead>
                                <tbody id="tablaDetallesProductos">
                                </tbody>
                            </table>
                        </div>
                    </div>
                    <div class="modal-footer">
                        <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">
                            ← Volver
                        </button>
                    </div>
                </div>
            </div>
        `;
            document.body.appendChild(modalDetalles);
        }

        // Formatear fecha
        let fechaFormateada = "Sin fecha";
        if (pedido.fechaEntrega) {
            try {
                const fecha = new Date(pedido.fechaEntrega);
                fechaFormateada = fecha.toLocaleDateString('es-ES', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                });
            } catch (e) {
                fechaFormateada = pedido.fechaEntrega;
            }
        }

        // CORREGIR: Buscar el título DESPUÉS de asegurar que el modal existe
        const titleElement = document.getElementById('modalDetallesTitle');
        if (titleElement) {
            titleElement.textContent = `📦 Pedido #${pedido.id}`;
        } else {
            console.error('❌ Elemento modalDetallesTitle no encontrado después de crear el modal');
        }

        // Actualizar información general
        const infoDiv = document.getElementById('detallesPedidoInfo');
        if (infoDiv) {
            const todosEntregados = pedido.productos.every(p => p.estadoPedido === "Entregado");
            const estadoGeneral = todosEntregados ?
                `<span class="badge bg-success fs-6">✅ Completado</span>` :
                `<span class="badge bg-danger fs-6">⏳ Pendiente</span>`;

            infoDiv.innerHTML = `
            <div class="card">
                <div class="card-body">
                    <div class="row">
                        <div class="col-md-6">
                            <p class="mb-2"><strong>📅 Fecha:</strong> ${fechaFormateada}</p>
                            <p class="mb-2"><strong>🏢 Edificio:</strong> ${pedido.edificio || 'Sin especificar'}</p>
                        </div>
                        <div class="col-md-6">
                            <p class="mb-2"><strong>📦 Total productos:</strong> ${pedido.productos.length}</p>
                            <p class="mb-2"><strong>📋 Estado:</strong> ${estadoGeneral}</p>
                        </div>
                        <div class="col-12 mt-2">
                            <p class="mb-0"><strong>📝 Observaciones:</strong> ${pedido.observaciones || 'Sin observaciones'}</p>
                        </div>
                    </div>
                </div>
            </div>
        `;
        }

        // Llenar tabla de productos
        const tablaBody = document.getElementById('tablaDetallesProductos');
        if (tablaBody) {
            tablaBody.innerHTML = '';

            pedido.productos.forEach(producto => {
                const estadoBadge = producto.estadoPedido === "Entregado"
                    ? `<span class="badge bg-success">✅ Entregado</span>`
                    : `<span class="badge bg-warning text-dark">⏳ Pendiente</span>`;

                const row = document.createElement('tr');
                row.innerHTML = `
                <td><span class="badge bg-secondary">${producto.idProducto || 'N/A'}</span></td>
                <td><strong>${producto.nombreProducto || 'Sin nombre'}</strong></td>
                <td>${producto.cantidad || 'N/A'}</td>
                <td><code>${producto.unidadMedidaProducto || 'Sin unidad'}</code></td>
                <td>${estadoBadge}</td>
            `;
                tablaBody.appendChild(row);

                const observacionesExtras = document.getElementById('observacionesExtras');
                if (observacionesExtras) {
                    observacionesExtras.textContent = pedido.observaciones;
                }
            });
        }

        // Cerrar modal de pedidos si está abierto
        const modalPedidosElement = document.getElementById('modalPedidos');
        if (modalPedidosElement) {
            const modalPedidos = bootstrap.Modal.getInstance(modalPedidosElement);
            if (modalPedidos) {
                modalPedidos.hide();
            }
        }

        // Mostrar modal de detalles con un pequeño delay para asegurar que el modal anterior se cierre
        setTimeout(() => {
            const modal = new bootstrap.Modal(modalDetalles);
            modal.show();
        }, 300);
    }





    const btnPedidos = document.getElementById('btnPedidos');

    btnPedidos.addEventListener('click', (e) => {
        verPedidosRegistrados();

        // abrir modal después de cargar lista
        const modalPedidos = new bootstrap.Modal(document.getElementById("modalPedidos"));
        modalPedidos.show();
    })

    const btnVolverAVerPedidos = document.getElementById('btnVolverAPedidosRegistrados');
    btnVolverAVerPedidos.addEventListener('click', async function () {
        verPedidosRegistrados();

        // abrir modal después de cargar lista
        const modalPedidos = new bootstrap.Modal(document.getElementById("modalPedidos"));
        modalPedidos.show();
    })


    // Selecciono el botón de la X (cerrar modal)
    const btnCerrar = document.querySelector('#miModal .btn-close');

    btnCerrar.addEventListener('click', () => {
        limpiarSeleccionProductos();
        renderTable(productosGlobal); // refrescar tabla para sacar los checks
    });




});
