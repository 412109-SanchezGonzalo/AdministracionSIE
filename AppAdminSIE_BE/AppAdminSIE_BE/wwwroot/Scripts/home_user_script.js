document.addEventListener('DOMContentLoaded', async function () {

    const navbarToggle = document.querySelector('.navbar-toggle');
    const navbarMenu = document.querySelector('.navbar-menu');
    const saludoSpan = document.querySelector('.navbar-saludo');


    let tareaSeleccionada = [];
    let idPedidoSeleccionado;


    const btnPendingTasks = document.getElementById('btnTareasPendientes');
    const btnPedidos = document.getElementById('btnPedidos');

    // 🔐 Autenticación y bienvenida
    try {
        const password = localStorage.getItem('user_password');
        const response = await fetch('https://administracionsie.onrender.com/api/SIE/Obtener-nombre-de-usuario-por-contrasena', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(password)
        });
        saludoSpan.textContent = response.ok
            ? `Hola, ${await response.text()} !`
            : 'Hola, Usuario !';
    } catch (error) {
        console.error('⚠️ Error en autenticación:', error);
        saludoSpan.textContent = 'Hola, Usuario !';
    }

    navbarToggle.addEventListener('click', () => {
        window.location.href = "https://administracionsie.onrender.com/Pages/Login_page.html";
    });

    // ----------------------------------------------------
    //                 TAREAS PENDIENTES
    // ----------------------------------------------------

    async function verTareas() {
        try {
            const password = localStorage.getItem('user_password');
            const response = await fetch('https://administracionsie.onrender.com/api/SIE/Obtener-id-usuario-por-contrasena', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(password)
            });
            const employeeId = await response.text();
            await openModalVerTask(employeeId);
        } catch (error) {
            console.error('Error al obtener ID de usuario:', error);
            alert('Error al cargar tareas.');
        }
    }

    async function openModalVerTask(employeeId) {
        try {
            const response = await fetch(`https://administracionsie.onrender.com/api/SIE/Obtener-servicioXusuario-por-usuario?userId=${employeeId}`);
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const data = await response.json();
            const modalVerTask = document.getElementById('modal-VerTask');

            if (!modalVerTask) {
                console.error('Modal no encontrado');
                return;
            }

            if (Array.isArray(data) && data.length > 0) {
                if (data.length === 1) {
                    mostrarTareaEnModal(data[0]);
                } else {
                    mostrarListGroupTareas(data);
                }
                modalVerTask.style.display = 'flex';
            } else {
                alert('No tienes tareas asignadas.');
            }
        } catch (error) {
            console.error('Error al obtener datos de la API:', error);
            alert('Error al cargar las tareas del empleado: ' + error.message);
        }
    }

    function mostrarTareaEnModal(tarea) {
        tareaSeleccionada = [tarea];
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
    }

    function mostrarListGroupTareas(tareas) {
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
                abrirDetalleTarea(tarea, index);
            });
            listGroup.appendChild(listItem);
        });
    }

    function abrirDetalleTarea(tarea, index) {
        const listGroupContainer = document.getElementById('listGroupContainer');
        if (listGroupContainer) listGroupContainer.style.display = 'none';
        const formContainer = document.getElementById('formContainer');
        if (formContainer) formContainer.style.display = 'block';
        mostrarTareaEnModal(tarea);

        let btnVolver = document.getElementById('btnVolverLista');
        if (!btnVolver) {
            btnVolver = document.createElement('button');
            btnVolver.id = 'btnVolverLista';
            btnVolver.type = 'button';
            btnVolver.className = 'btn btn-secondary';
            btnVolver.innerHTML = '← Volver a la Lista';
            btnVolver.addEventListener('click', () => {
                tareaSeleccionada = [];
                document.getElementById('modal-VerTask').style.display = 'none';
                verTareas();
                volverAListaTareas();
            });
            document.querySelector('#modal-VerTask .modal-content-location').appendChild(btnVolver);
        }
        btnVolver.style.display = 'inline-block';
        const modalTitle = document.querySelector('#modal-VerTask .modal-header-container h2');
        if (modalTitle) modalTitle.innerHTML = `📝 Tarea ${index + 1}: ${tarea.nombreServicio || 'Sin nombre'}`;
    }

    function volverAListaTareas() {
        const formContainer = document.getElementById('formContainer');
        if (formContainer) formContainer.style.display = 'none';
        const listGroupContainer = document.getElementById('listGroupContainer');
        if (listGroupContainer) listGroupContainer.style.display = 'block';
        const btnVolver = document.getElementById('btnVolverLista');
        if (btnVolver) btnVolver.style.display = 'none';
        const modalTitle = document.querySelector('#modal-VerTask .modal-header-container h2');
        if (modalTitle) modalTitle.innerHTML = '📝 Tareas Asignadas';
    }

    const closeVerTaskModalBtn = document.getElementById('closeVerTaskModalBtn');
    if (closeVerTaskModalBtn) {
        closeVerTaskModalBtn.addEventListener('click', () => {
            tareaSeleccionada = [];
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
            const [respPedidosProductos, respPedidos] = await Promise.all([
                fetch("https://administracionsie.onrender.com/api/SIE/Obtener-todos-los-pedidoxproducto"),
                fetch("https://administracionsie.onrender.com/api/SIE/Obtener-todos-los-pedidos")
            ]);

            const pedidosProductos = await respPedidosProductos.json();
            const pedidos = await respPedidos.json();

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
                        alert('Error: No se pudo cargar el detalle del pedido');
                    }
                });
            });

        } catch (error) {
            console.error("Error cargando pedidos:", error);
            lista.innerHTML = `<li class="list-group-item text-danger">⚠️ Error cargando pedidos: ${error.message}</li>`;
        }
    }

    // ----------------------------------------------------
    //                  DETALLES DE PEDIDO
    // ----------------------------------------------------

    function mostrarDetallesPedido(pedido) {
        idPedidoSeleccionado = pedido.id;
        let modalDetalles = document.getElementById('modalDetallesPedido');

        // Código para crear el modal si no existe (ya lo tienes en tu HTML, por lo que esto no se ejecutará)
        if (!modalDetalles) {
            // Este bloque se omite porque el modal ya está en el HTML
        }

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

        // 🚨 Obtén el campo de observaciones desde el HTML, ya que no se crea dinámicamente aquí
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

    // 🚨 Este event listener ya no es necesario si se usa el botón de volver en el modal de detalles
    // const btnVolverAVerPedidos = document.getElementById('btnVolverAPedidosRegistrados');
    // btnVolverAVerPedidos.addEventListener('click', async function () {
    //     verPedidosRegistrados();
    //     const modalPedidos = new bootstrap.Modal(document.getElementById("modalPedidos"));
    //     modalPedidos.show();
    // });

    const btnVolverAVerPedidos = document.getElementById('btnVolverAPedidosRegistrados');
    btnVolverAVerPedidos.addEventListener('click', () => {
        const modalDetalles = bootstrap.Modal.getInstance(document.getElementById('modalDetallesPedido'));
        if (modalDetalles) modalDetalles.hide();

        setTimeout(() => {
            const modalPedidos = new bootstrap.Modal(document.getElementById("modalPedidos"));
            modalPedidos.show();
        }, 300);
    });

    const btnConfirmarEntrega = document.getElementById('btnConfirmarEntrega');
    btnConfirmarEntrega.addEventListener('click', () => {
        const productosAEntregar = [];
        document.querySelectorAll(".entregado-checkbox").forEach(chk => {
            if (chk.checked && !chk.disabled) {
                productosAEntregar.push({
                    idProducto: parseInt(chk.getAttribute("data-producto-id"))
                });
            }
        });

        // ⭐ La corrección del error
        const observacionesNuevas = document.getElementById('observacionesExtras');

        actualizarEstadoProductos(productosAEntregar, idPedidoSeleccionado, observacionesNuevas);
    });

    async function actualizarEstadoProductos(productosSeleccionados, idPedido, observaciones) {
        if (!productosSeleccionados || productosSeleccionados.length === 0) {
            alert("No hay productos seleccionados para actualizar.");
            return;
        }

        let todosActualizadosConExito = true;

        for (const producto of productosSeleccionados) {
            const datosFetch = {
                idPedido: idPedido,
                idProducto: producto.idProducto,
                observacionesExtras: observaciones.value,
                nuevoEstadoProducto: "Entregado"
            };

            try {
                const response = await fetch('https://administracionsie.onrender.com/api/SIE/Editar-pedidoxproducto', {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(datosFetch)
                });

                if (!response.ok) {
                    todosActualizadosConExito = false;
                    const errorText = await response.text();
                    console.error(`❌ Error al actualizar el producto #${producto.idProducto}:`, errorText);
                    alert(`❌ Error al actualizar un producto.`);
                } else {
                    console.log(`✅ Producto #${producto.idProducto} del pedido #${idPedido} actualizado.`);
                }
            } catch (error) {
                todosActualizadosConExito = false;
                console.error(`❌ Fallo en la conexión para el producto #${producto.idProducto}:`, error);
            }
        }

        if (todosActualizadosConExito) {
            try {
                const responsePedidoEstado = await fetch('https://administracionsie.onrender.com/api/SIE/Editar-estado-pedido', {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(idPedido)
                });

                if (responsePedidoEstado.ok) {
                    alert("✅ ¡Entrega Confirmada!");
                    console.log(`✅ Estado del Pedido #${idPedido} actualizado correctamente.`);
                    // Opcional: Recargar la lista de pedidos después de la confirmación
                    const modalDetalles = bootstrap.Modal.getInstance(document.getElementById('modalDetallesPedido'));
                    if (modalDetalles) modalDetalles.hide();
                    await verPedidosRegistrados();
                    const modalPedidos = new bootstrap.Modal(document.getElementById("modalPedidos"));
                    modalPedidos.show();
                } else {
                    const errorText = await responsePedidoEstado.text();
                    console.error(`❌ Error al actualizar el estado del pedido #${idPedido}:`, errorText);
                    alert("❌ Ocurrió un error al confirmar la entrega del pedido.");
                }
            } catch (error) {
                console.error(`❌ Fallo en la conexión al actualizar el estado del pedido #${idPedido}:`, error);
                alert("❌ Fallo en la conexión al actualizar el estado del pedido.");
            }
        } else {
            alert("⚠️ Algunos productos no pudieron ser actualizados. Por favor, revisa la consola.");
        }
    }
});