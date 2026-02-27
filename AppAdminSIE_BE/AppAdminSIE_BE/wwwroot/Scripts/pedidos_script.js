    // ===================================
    // VARIABLES GLOBALES DE FILTROS
    // ===================================
    let currentFilterType = null; // 'fecha' | 'estado' | null
    let originalPedidos = []; // Para guardar los pedidos originales
    let pedidosFiltradosActuales = [];


    // ===================================
    // FUNCIONES GLOBALES DE FILTROS Y UTILIDADES
    // ===================================
    
    
    // Función para mostrar Toast con tipo (success, error, warning, info)
    function showToast(message, type = "info") {
        const toastLive = document.getElementById('liveToast');
        const toastBody = document.getElementById('toast-message');
    
        if (toastBody && toastLive) {
            toastBody.innerHTML = message;
    
            // Resetear clases de color
            toastLive.className = "toast align-items-center border-0";
    
            // Aplicar color según el tipo
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



    // Función GLOBAL para limpiar todos los filtros
    function limpiarFiltros() {
        console.log('🗑️ Limpiando filtros...');

        const fechaInput = document.getElementById('fechaFiltrada');
        const estadoDropdown = document.getElementById('pedidoFiltradoByEstado');
        const periodoDropdown = document.getElementById('pedidoFiltradoByPeriodo');

        if (!fechaInput || !estadoDropdown || !periodoDropdown) {
            console.error('❌ No se encontraron los elementos de filtro');
            return;
        }

        // Resetear valores visuales
        fechaInput.value = '';
        estadoDropdown.textContent = 'Seleccionar Estado';
        periodoDropdown.textContent = 'Seleccionar Periodo';

        // Rehabilitar todos los controles
        enableFechaInput();
        enableEstadoDropdown();
        enablePeriodoDropdown();

        // Resetear tipo de filtro
        currentFilterType = null;

        // Mostrar todos los pedidos nuevamente
        mostrarTodosPedidos();

        console.log('✅ Filtros limpiados correctamente');
    }


    // Funciones de habilitación/deshabilitación
    function enableEstadoDropdown() {
        const estadoDropdown = document.getElementById('pedidoFiltradoByEstado');
        const estadoDropdownItems = document.querySelectorAll('#modalPedidos .dropdown-menu a');
    
        if (estadoDropdown) {
            estadoDropdown.disabled = false;
            estadoDropdown.classList.remove('disabled');
            estadoDropdown.style.pointerEvents = 'auto';
            estadoDropdown.style.opacity = '1';
        }
    
        estadoDropdownItems.forEach(item => {
            item.style.pointerEvents = 'auto';
            item.style.opacity = '1';
        });
    }
    
    function enableFechaInput() {
        const fechaInput = document.getElementById('fechaFiltrada');
        if (fechaInput) {
            fechaInput.disabled = false;
            fechaInput.classList.remove('disabled');
            fechaInput.style.pointerEvents = 'auto';
            fechaInput.style.opacity = '1';
        }
    }
    function enablePeriodoDropdown() {
        const periodoDropdown = document.getElementById('pedidoFiltradoByPeriodo');
        const periodoDropdownItems = document.querySelectorAll('#periodoColumna .dropdown-item');

        if (periodoDropdown) {
            periodoDropdown.disabled = false;
            periodoDropdown.classList.remove('disabled');
            periodoDropdown.style.pointerEvents = 'auto';
            periodoDropdown.style.opacity = '1';
        }

        periodoDropdownItems.forEach(item => {
            item.style.pointerEvents = 'auto';
            item.style.opacity = '1';
        });
    }

    function disableEstadoDropdown() {
        const estadoDropdown = document.getElementById('pedidoFiltradoByEstado');
        const estadoDropdownItems = document.querySelectorAll('#modalPedidos .dropdown-menu a');
    
        if (estadoDropdown) {
            estadoDropdown.disabled = true;
            estadoDropdown.classList.add('disabled');
            estadoDropdown.style.pointerEvents = 'none';
            estadoDropdown.style.opacity = '0.5';
        }
    
        estadoDropdownItems.forEach(item => {
            item.style.pointerEvents = 'none';
            item.style.opacity = '0.5';
        });
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
    
    // Funciones de estado (movidas fuera para uso global)
    // Funciones de estado (movidas fuera para uso global)
    function obtenerEstadoHtml(estadoPedido) {
        let texto = '';
        let claseColor = '';

    
        switch (estadoPedido) {
            case 'Entregado - Sin Facturar': // Nuevo caso
            case 'Entregado':
                texto = 'Entregado - Sin Facturar';
                claseColor = 'bg-warning';
                break;
            case 'Facturado':
                texto = 'Facturado';
                claseColor = 'bg-success';
                break;
            case 'Pendiente - Entregar': // Nuevo caso
                texto = 'Pendiente - Entregar';
                claseColor = 'bg-danger';
                break;
            case 'Pendiente - Preparar': // Nuevo caso
                texto = 'Pendiente - Preparar';
                claseColor = 'bg-info';
                break;
            default:
                texto = estadoPedido; // O un valor por defecto
                claseColor = 'bg-secondary';
        }
        return `<span class="badge rounded-pill ${claseColor}">${texto}</span>`;
    }
    
    function obtenerEstadoProductoHtml(estadoProducto,estadoPedido = null) {
        let texto = '';
        let claseColor = '';

        // Condición especial: si es 'No Entregado' y el pedido está en 'Pendiente - Preparar'
        if (estadoProducto === 'No Entregado' && estadoPedido === 'Pendiente - Preparar') {
            return '<span class="text-muted">-</span>';
        }
    
        switch (estadoProducto) {
            case 'Entregado':
                texto = 'Sí';
                claseColor = 'bg-success';
                break;
            case 'Facturado':
                texto = 'Sí';
                claseColor = 'bg-success';
                break;
            case 'No Entregado':
            default:
                texto = 'No';
                claseColor = 'bg-danger';
        }
        return `<span class="badge rounded-pill ${claseColor}">${texto}</span>`;
    }
    
    // Funciones de filtrado
    async function filtrarPorFecha(fecha) {
        const loadingElement = document.getElementById('loadingPedidos');
        const listaPedidos = document.getElementById('listaPedidos');
    
        try {
            if (loadingElement) loadingElement.classList.remove('d-none');
            if (listaPedidos) listaPedidos.innerHTML = '';
    
            console.log('🔍 Filtrando por fecha:', fecha);
    
            const [respPedidosProductos, respPedidos] = await Promise.all([
                fetch(`${API_BASE_URL}/api/SIE/Obtener-todos-los-pedidoxproducto-por-fecha?fecha=${encodeURIComponent(fecha)}`, {
                    method: 'GET',
                    headers: { 'Content-Type': 'application/json' }
                }),
                fetch(`${API_BASE_URL}/api/SIE/Obtener-todos-los-pedidos`, {
                    method: 'GET',
                    headers: { 'Content-Type': 'application/json' }
                })
            ]);
    
            if (!respPedidosProductos.ok) throw new Error(`HTTP error! status: ${respPedidosProductos.status}`);
            if (!respPedidos.ok) throw new Error(`HTTP error! status: ${respPedidos.status}`);
    
            const pedidosProductos = await respPedidosProductos.json();
            const pedidos = await respPedidos.json();
    
            const pedidosMap = {};
            pedidos.forEach(pedido => {
                pedidosMap[pedido.idPedido] = pedido;
            });
    
            const pedidosProductosConFecha = pedidosProductos.map(pedidoProducto => {
                const pedidoInfo = pedidosMap[pedidoProducto.idPedido];
                return {
                    ...pedidoProducto,
                    fechaEntrega: pedidoInfo ? pedidoInfo.fechaEntrega : null,
                    fechaActividad: pedidoInfo ? pedidoInfo.fechaEntrega : null
                };
            });
    
            console.log('✅ Pedidos obtenidos por fecha:', pedidosProductosConFecha);
    
            if (loadingElement) loadingElement.classList.add('d-none');
            pedidosFiltradosActuales = pedidosProductosConFecha;
            mostrarPedidosFiltrados(pedidosFiltradosActuales);


        } catch (error) {
            console.error('❌ Error al filtrar por fecha:', error);
            if (loadingElement) loadingElement.classList.add('d-none');
            mostrarErrorFiltrado('Error al cargar pedidos por fecha: ' + error.message);
        }
    }
    
    async function filtrarPorEstado(estado) {
        const loadingElement = document.getElementById('loadingPedidos');
        const listaPedidos = document.getElementById('listaPedidos');
    
        try {
            if (loadingElement) loadingElement.classList.remove('d-none');
            if (listaPedidos) listaPedidos.innerHTML = '';
    
            console.log('🔍 Filtrando por estado:', estado);
    
            const [respPedidosProductos, respPedidos] = await Promise.all([
                fetch(`${API_BASE_URL}/api/SIE/Obtener-todos-los-pedidoxproducto-por-estado?estado=${encodeURIComponent(estado)}`, {
                    method: 'GET',
                    headers: { 'Content-Type': 'application/json' }
                }),
                fetch(`${API_BASE_URL}/api/SIE/Obtener-todos-los-pedidos`, {
                    method: 'GET',
                    headers: { 'Content-Type': 'application/json' }
                })
            ]);
    
            if (!respPedidosProductos.ok) throw new Error(`HTTP error! status: ${respPedidosProductos.status}`);
            if (!respPedidos.ok) throw new Error(`HTTP error! status: ${respPedidos.status}`);
    
            const pedidosProductos = await respPedidosProductos.json();
            const pedidos = await respPedidos.json();
    
            const pedidosMap = {};
            pedidos.forEach(pedido => {
                pedidosMap[pedido.idPedido] = pedido;
            });
    
            const pedidosProductosConFecha = pedidosProductos.map(pedidoProducto => {
                const pedidoInfo = pedidosMap[pedidoProducto.idPedido];
                return {
                    ...pedidoProducto,
                    fechaEntrega: pedidoInfo ? pedidoInfo.fechaEntrega : null,
                    fechaActividad: pedidoInfo ? pedidoInfo.fechaEntrega : null
                };
            });
    
            console.log('✅ Pedidos obtenidos por estado:', pedidosProductosConFecha);
    
            if (loadingElement) loadingElement.classList.add('d-none');
            pedidosFiltradosActuales = pedidosProductosConFecha
            mostrarPedidosFiltrados(pedidosFiltradosActuales);
    
        } catch (error) {
            console.error('❌ Error al filtrar por estado:', error);
            if (loadingElement) loadingElement.classList.add('d-none');
            mostrarErrorFiltrado('Error al cargar pedidos por estado: ' + error.message);
        }
    }

    function filtrarPorNombreEdificio() {
        const edificioFiltro = document.getElementById("edificioFiltrado")?.value
            ?.toLowerCase()
            ?.trim();

        // 👉 si ya hay filtros aplicados, usamos esos
        const base = pedidosFiltradosActuales.length > 0
            ? pedidosFiltradosActuales
            : originalPedidos;

        const pedidosFiltrados = base.filter(p => {
            if (!edificioFiltro) return true;

            return (
                p.edificio &&
                p.edificio.toLowerCase().includes(edificioFiltro)
            );
        });

        mostrarPedidosFiltrados(pedidosFiltrados);
    }


    function filtrarPorPeriodoLocal(periodo) {

        console.log("🔍 Filtrando por periodo (local):", periodo);

        const base = pedidosFiltradosActuales.length > 0
            ? pedidosFiltradosActuales
            : originalPedidos;

        pedidosFiltradosActuales = base.filter(p => {
            if (!p.periodo) return false;

            return p.periodo.toUpperCase() === periodo.toUpperCase();
        });

        mostrarPedidosFiltrados(pedidosFiltradosActuales);
    }







    function mostrarPedidosFiltrados(pedidos) {
        console.log("🔍 Datos recibidos en mostrarPedidosFiltrados:", pedidos);
        console.log("🔍 Tipo de datos:", typeof pedidos);
        console.log("🔍 Es array:", Array.isArray(pedidos));
        if (pedidos && pedidos.length > 0) {
            console.log("🔍 Primer elemento:", pedidos[0]);
            console.log("🔍 Propiedades del primer elemento:", Object.keys(pedidos[0]));
        }
    
        const listaPedidos = document.getElementById('listaPedidos');
    
        if (!listaPedidos) {
            console.error('❌ No se encontró el elemento listaPedidos');
            return;
        }
    
        if (!pedidos || pedidos.length === 0) {
            listaPedidos.innerHTML = `
                <div class="text-center p-4">
                    <h6 class="text-muted">📭 Sin resultados</h6>
                    <p class="small text-muted">No se encontraron pedidos con los filtros aplicados.</p>
                </div>
            `;
            return;
        }
    
        listaPedidos.innerHTML = '';
    
        const pedidosAgrupados = {};
        pedidos.forEach(pedidoProducto => {
            const idPedido = pedidoProducto.idPedido;
            if (!pedidosAgrupados[idPedido]) {
                pedidosAgrupados[idPedido] = {
                    id: idPedido,
                    fechaEntrega: pedidoProducto.fechaEntrega || pedidoProducto.fechaActividad,
                    periodo: pedidoProducto.periodo,
                    edificio: pedidoProducto.edificio,
                    observaciones: pedidoProducto.observaciones,
                    productos: []
                };
    
                console.log("🔍 Debug - Objeto creado para pedido", idPedido, ":", pedidosAgrupados[idPedido]);
                console.log("🔍 Debug - pedidoProducto original:", pedidoProducto);
            }
            pedidosAgrupados[idPedido].productos.push(pedidoProducto);
        });
    
        Object.values(pedidosAgrupados).forEach(pedido => {
            let estadoGeneral = 'Pendiente - Preparar';
            const todosFacturados = pedido.productos.every(p => p.estadoPedido === 'Facturado' || p.estado === 'Facturado');
            const todosEntregadosSinFacturar = pedido.productos.every(p => p.estadoPedido === 'Entregado - Sin Facturar' || p.estado === 'Entregado');
            const todosPendientesEntregar = pedido.productos.every(p => p.estadoPedido === 'Pendiente - Entregar' || p.estado === 'No Entregado');
            const todosPendientesPreparar = pedido.productos.every(p => p.estadoPedido === 'Pendiente - Preparar' || p.estado === 'No Preparado');
    
            if (todosFacturados) {
                estadoGeneral = 'Facturado';
            } else if (todosEntregadosSinFacturar) {
                estadoGeneral = 'Entregado - Sin Facturar';
            } else if (todosPendientesPreparar) {
                estadoGeneral = 'Pendiente - Preparar';
            } else if (todosPendientesEntregar) {
                estadoGeneral = 'Pendiente - Entregar';
            }
    
            let colorBorde;
            let badgeColor;
            switch (estadoGeneral) {
                case 'Entregado - Sin Facturar':
                    colorBorde = '#ffc107';
                    badgeColor = 'bg-warning';
                    break;
                case 'Facturado':
                    colorBorde = '#198754';
                    badgeColor = 'bg-success';
                    break;
                case 'Pendiente - Entregar':
                    colorBorde = '#dc3545';
                    badgeColor = 'bg-danger';
                    break;
                case 'Pendiente - Preparar':
                default:
                    colorBorde = '#005488';
                    badgeColor = 'bg-info';
                    break;
            }
    
            const cantidadProductos = pedido.productos.length;
            const fechaDelPedido = pedido.fechaEntrega;
            console.log("🔍 Debug - Objeto pedido completo:", pedido);
            console.log("🔍 Debug - fechaEntrega específico:", pedido.fechaEntrega);
            console.log("🔍 Debug - tipo de fechaEntrega:", typeof pedido.fechaEntrega);
    
            let fechaFormateada = "Sin fecha";
            if (fechaDelPedido && typeof fechaDelPedido === "string") {
                try {
                    const dateObj = new Date(fechaDelPedido);
                    if (!isNaN(dateObj)) {
                        fechaFormateada = dateObj.toLocaleDateString("es-ES", {
                            year: "numeric",
                            month: "2-digit",
                            day: "2-digit"
                        });
                    }
                } catch (e) {
                    console.error("Error al parsear fecha:", e);
                    fechaFormateada = fechaDelPedido;
                }
            }
    
            const listItem = document.createElement('li');
            listItem.className = 'list-group-item d-flex justify-content-between align-items-start pedido-item flex-wrap';
            listItem.setAttribute('data-pedido-id', pedido.id);
            listItem.setAttribute('data-estado-general', estadoGeneral);
            listItem.style.cursor = 'pointer';
            listItem.style.borderLeft = `4px solid ${colorBorde}`;
    
            listItem.innerHTML = `
                <div class="ms-2 me-auto">
                    <div class="fw-bold">Pedido #${pedido.id}</div>
                    <div><strong>📅 Fecha de Entrega:</strong> ${fechaFormateada}</div>
                    <div><strong>📅 Periodo:</strong> ${pedido.periodo || "Sin Periodo de Fecha"}</div>
                    <div><strong>🏢 Entregar en Edificio:</strong> ${pedido.edificio || "Sin edificio"}</div>
                    <small class="text-muted">📦 ${cantidadProductos} producto(s)</small>
                    <br>
                    <small class="text-muted">📝 ${pedido.observaciones || "Sin observaciones"}</small>
                </div>
                <div class="text-end">
                    <span class="badge ${badgeColor} rounded-pill">${estadoGeneral}</span>
                    <br>
                </div>
            `;
    
            listItem.addEventListener('click', function() {
                if (pedido && mostrarDetallesPedido) {
                    mostrarDetallesPedido(pedido, estadoGeneral);
                    console.log('✅ Abriendo detalle para pedido:', pedido.id);
                } else {
                    console.error('❌ No se encontró el pedido con ID:', pedido.id);
                    console.error('❌ Objeto pedido:', pedido);
                    console.error('❌ Función disponible:', !!mostrarDetallesPedido);
                    alert('Error: No se pudo cargar el detalle del pedido');
                }
            });
    
            listaPedidos.appendChild(listItem);
        });
    
        console.log(`✅ Mostrados ${pedidos.length} pedidos filtrados`);
    }

    function mostrarDetallesPedido(pedido, estadoGeneral) {
        console.log('🔍 INICIO mostrarDetallesPedido');
        console.log('🔍 Pedido recibido:', pedido);
        console.log('🔍 Estado general:', estadoGeneral);

        const modalPedidos = bootstrap.Modal.getInstance(document.getElementById('modalPedidos'));
        if (modalPedidos) {
            console.log('🔍 Cerrando modal de pedidos');
            modalPedidos.hide();
        }

        const modalDetalles = document.getElementById('modalDetallesPedido');
        console.log('🔍 Modal de detalles encontrado:', !!modalDetalles);

        if (!modalDetalles) {
            console.error("❌ El modal de detalles no existe en el DOM");
            alert("Error: Modal de detalles no encontrado en la página");
            return;
        }

        const titleElement = document.getElementById('modalDetallesPedidoLabel');
        const infoDiv = document.getElementById('detallesPedidoInfo');
        const tablaBody = document.getElementById('tablaDetallesProductos');
        const modalFooter = modalDetalles.querySelector('.modal-footer');

        console.log('🔍 Elementos encontrados:');
        console.log('  - Title:', !!titleElement);
        console.log('  - Info div:', !!infoDiv);
        console.log('  - Tabla body:', !!tablaBody);
        console.log('  - Modal footer:', !!modalFooter);

        if (!titleElement || !infoDiv || !tablaBody || !modalFooter) {
            console.error("❌ Algunos elementos del modal no existen");
            console.error("IDs esperados: modalDetallesPedidoLabel, detallesPedidoInfo, tablaDetallesProductos");
            alert("Error: Elementos del modal no encontrados");
            return;
        }

        modalFooter.innerHTML = '';
        const btnVolver = document.createElement('button');
        btnVolver.type = 'button';
        btnVolver.className = 'btn btn-secondary';
        btnVolver.textContent = '← Volver';

        btnVolver.addEventListener('click', () => {
            const modalDetallesInstance = bootstrap.Modal.getInstance(modalDetalles);
            if (modalDetallesInstance) modalDetallesInstance.hide();

            setTimeout(() => {
                const modalPedidosInstance = new bootstrap.Modal(document.getElementById('modalPedidos'));
                modalPedidosInstance.show();
            }, 300);
        });

        modalFooter.appendChild(btnVolver);

        const isPendienteEntrega = estadoGeneral === 'Pendiente - Entregar';
        const isPendientePreparar = estadoGeneral === 'Pendiente - Preparar';
        const isEntregadoSinFacturar = estadoGeneral === 'Entregado - Sin Facturar';

        let fechaFormateada = "Sin fecha";
        if (pedido.fechaEntrega) {
            try {
                const fecha = new Date(pedido.fechaEntrega);
                fechaFormateada = fecha.toLocaleDateString('es-ES', { year: 'numeric', month: 'long', day: 'numeric' });
            } catch (e) {
                fechaFormateada = pedido.fechaEntrega;
            }
        }

        if (titleElement) titleElement.textContent = `📦 Pedido #${pedido.id}`;
        if (infoDiv) {
            const estadoGeneralHTML = obtenerEstadoHtml(estadoGeneral);
            infoDiv.innerHTML = `
            <div class="card">
                <div class="card-body">
                    <div class="row">
                        <div class="col-md-6">
                            <p class="mb-2"><strong>📅 Fecha de Entrega:</strong> ${fechaFormateada}</p>
                            <p class="mb-2"><strong>📅 Periodo:</strong> ${pedido.periodo || 'Sin Periodo'}</p>
                            <p class="mb-2"><strong>🏢 Entregar en Edificio:</strong> ${pedido.edificio || 'Sin especificar'}</p>
                        </div>
                        <div class="col-md-6">
                            <p class="mb-2"><strong>📦 Total productos:</strong> ${pedido.productos.length}</p>
                            <p class="mb-2"><strong>📋 Estado:</strong> ${estadoGeneralHTML}</p>
                        </div>
                        <div class="col-12 mt-2">
                            <p class="mb-0"><strong>📝 Observaciones:</strong> ${pedido.observaciones || 'Sin observaciones'}</p>
                        </div>
                    </div>
                </div>
            </div>
        `;
        }

        // --- AGREGAR EL CAMPO DE OBSERVACIONES ADICIONALES SI CORRESPONDE ---
        if (isPendienteEntrega) {
            const observacionesExtrasHTML = `
            <div class="card mt-3">
                <div class="card-body">
                    <h6 class="fw-bold">Agregar Observaciones de la Entrega:</h6>
                    <div class="mb-3">
                        <label for="observacionesExtras" class="form-label small">Observaciones adicionales:</label>
                        <textarea class="form-control" id="observacionesExtras" rows="3">${pedido.observaciones || ''}</textarea>
                    </div>
                </div>
            </div>
        `;
            if (infoDiv) {
                infoDiv.innerHTML += observacionesExtrasHTML;
            }
        }

        // --- LÓGICA DE LOS BOTONES ---
        if (isPendientePreparar) {
            const btnPedidoArmado = document.createElement('button');
            btnPedidoArmado.type = 'button';
            btnPedidoArmado.className = 'btn btn-primary';
            btnPedidoArmado.textContent = 'PEDIDO ARMADO';
            btnPedidoArmado.addEventListener('click', async () => {
                if (confirm("¿Confirmas que este pedido ha sido armado y está listo para entregar?")) {
                    if (window.spinner) window.spinner.classList.remove('d-none');
                    btnPedidoArmado.disabled = true;
                    let resultado = await window.cambiarEstado(pedido.id, 'Pendiente - Entregar');
                    if (window.spinner) window.spinner.classList.add('d-none');
                    btnPedidoArmado.disabled = false;
                    if (resultado) {
                        showToast('📦 Pedido armado y listo para ser entregado !', "success");
                    } else {
                        showToast('❌ Ocurrió un error al cambiar el estado del pedido', "error");
                    }
                    setTimeout(() => { btnVolver.click(); }, 500);
                }
            });
            modalFooter.appendChild(btnPedidoArmado);
        } else if (isEntregadoSinFacturar) {
            const btnFacturar = document.createElement('button');
            btnFacturar.type = 'button';
            btnFacturar.className = 'btn btn-success';
            btnFacturar.textContent = 'FACTURAR';
            btnFacturar.addEventListener('click', async () => {
                if (confirm("¿Estás seguro de que deseas facturar este pedido?")) {
                    if (window.spinner) window.spinner.classList.remove('d-none');
                    btnFacturar.disabled = true;
                    let resultado = await window.cambiarEstado(pedido.id, 'Facturado');
                    if (window.spinner) window.spinner.classList.add('d-none');
                    btnFacturar.disabled = false;
                    if (resultado) {
                        showToast('🧾 Pedido Facturado !', "success");
                    } else {
                        showToast('❌ Ocurrió un error al cambiar el estado del pedido', "error");
                    }
                    setTimeout(() => { btnVolver.click(); }, 500);
                }
            });
            modalFooter.appendChild(btnFacturar);
        } else if (isPendienteEntrega) {
            const btnPendienteEntrega = document.createElement('button');
            btnPendienteEntrega.type = 'button';
            btnPendienteEntrega.className = 'btn btn-warning';
            btnPendienteEntrega.textContent = 'CONFIRMAR ENTREGA';
            btnPendienteEntrega.addEventListener('click', async () => {
                if (confirm("¿Confirmar entrega de los productos seleccionados?")) {
                    const checkboxes = document.querySelectorAll('#tablaDetallesProductos input[type="checkbox"]:checked');
                    const observacionesInput = document.getElementById('observacionesExtras');
                    const observacionesExtras = observacionesInput ? observacionesInput.value : "";

                    if (checkboxes.length === 0) {
                        showToast('⚠️ Debes seleccionar al menos un producto para confirmar la entrega', "warning");
                        return;
                    }
                    if (window.spinner) window.spinner.classList.remove('d-none');
                    btnPendienteEntrega.disabled = true;
                    const promises = [];
                    const idPedido = pedido.id;
                    checkboxes.forEach(checkbox => {
                        const idProducto = checkbox.getAttribute('data-id-producto');
                        const body = {
                            idPedido: idPedido,
                            idProducto: parseInt(idProducto),
                            observacionesExtras: observacionesExtras,
                            nuevoEstadoProducto: "Entregado"
                        };
                        const promise = fetch(`${API_BASE_URL}/api/SIE/Editar-pedidoxproducto`, {
                            method: 'PUT',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify(body)
                        })
                            .then(response => {
                                if (!response.ok) {
                                    return response.text().then(text => {
                                        throw new Error(`Error al actualizar el producto ${idProducto}: ${text}`);
                                    });
                                }
                                return response.text();
                            });
                        promises.push(promise);
                    });
                    try {
                        await Promise.all(promises);
                        let resultado = await window.cambiarEstado(idPedido, 'Entregado - Sin Facturar');
                        if (window.spinner) window.spinner.classList.add('d-none');
                        btnPendienteEntrega.disabled = false;
                        if (resultado) {
                            showToast('✅ Entrega Confirmada !', "success");
                        } else {
                            showToast('❌ Ocurrió un error al cambiar el estado del pedido', "error");
                        }
                        setTimeout(() => { btnVolver.click(); }, 500);
                    } catch (error) {
                        console.error('❌ Error al actualizar uno o más productos:', error);
                        showToast('❌ Ocurrió un error al confirmar la entrega de los productos', "error");
                        if (window.spinner) window.spinner.classList.add('d-none');
                        btnPendienteEntrega.disabled = false;
                    }
                }
            });
            modalFooter.appendChild(btnPendienteEntrega);
        }

        // --- LÓGICA DE LA TABLA ---
        if (tablaBody) {
            tablaBody.innerHTML = '';
            const tablaHead = document.getElementById('tablaDetallesProductosHead');
            if (tablaHead) {
                tablaHead.innerHTML = `
                <tr>
                    <th scope="col" style="width: 10%;background-color: #0b0a0a">ID</th>
                    <th scope="col" style="width: 40%;background-color: #0b0a0a">Producto</th>
                    <th scope="col" style="width: 15%;background-color: #0b0a0a">Cantidad</th>
                    <th scope="col" style="width: 15%;background-color: #0b0a0a">Unidad</th>
                    ${!isPendienteEntrega && !isPendientePreparar ? '<th scope="col" style="width: 20%;background-color: #0b0a0a">Estado</th>' : ''}
                    ${isPendienteEntrega ? '<th scope="col" style="width: 10%;background-color: #0b0a0a">Entregado</th>' : ''}
                </tr>
            `;
            }
            pedido.productos.forEach(producto => {
                const estadoBadge = obtenerEstadoProductoHtml(producto.estadoProducto);
                const row = document.createElement('tr');
                row.innerHTML = `
                <td><span class="badge bg-secondary">${producto.idProducto || 'N/A'}</span></td>
                <td><strong>${producto.nombreProducto || 'Sin nombre'}</strong></td>
                <td>${producto.cantidad || 'N/A'}</td>
                <td><code>${producto.unidadMedidaProducto || 'Sin unidad'}</code></td>
                ${!isPendienteEntrega && !isPendientePreparar ? `<td>${estadoBadge}</td>` : ''}
                ${isPendienteEntrega ? `<td><input type="checkbox" class="form-check-input" data-id-producto="${producto.idProducto}"></td>` : ''}
            `;
                tablaBody.appendChild(row);
            });
        }

        const modalInstance = bootstrap.Modal.getInstance(modalDetalles) || new bootstrap.Modal(modalDetalles);
        modalInstance.show();
    }
    
    function mostrarErrorFiltrado(mensaje) {
        const listaPedidos = document.getElementById('listaPedidos');
        if (listaPedidos) {
            listaPedidos.innerHTML = `
                <div class="text-center p-4">
                    <h6 class="text-danger">❌ Error</h6>
                    <p class="small text-muted">${mensaje}</p>
                    <button class="btn btn-outline-primary btn-sm" onclick="limpiarFiltros()">
                        🔄 Reintentar
                    </button>
                </div>
            `;
        }
    }
    
    function mostrarTodosPedidos() {
        console.log('📋 Mostrando todos los pedidos...');
        if (originalPedidos.length > 0) {
            mostrarPedidosFiltrados(originalPedidos);
        } else {
            if (window.verPedidosRegistrados) {
                window.verPedidosRegistrados();
            }
        }
    }
    
    function initializeFilters() {
        console.log('🔧 Inicializando filtros...');
    
        const fechaInput = document.getElementById('fechaFiltrada');
        const estadoDropdownItems = document.querySelectorAll('#pedidoFiltradoByEstado + .dropdown-menu .dropdown-item');
        const periodoDropdownItems = document.querySelectorAll('#periodoColumna .dropdown-item');
        const periodoDropdownBtn = document.getElementById('pedidoFiltradoByPeriodo');
    
        if (!fechaInput) {
            console.error('❌ No se encontró el input de fecha');
            return;
        }
    
        if (estadoDropdownItems.length === 0) {
            console.error('❌ No se encontraron los items del dropdown de estado');
            return;
        }
        if (periodoDropdownItems.length === 0) {
            console.error('❌ No se encontraron los items del dropdown de periodo');
            return;
        }
    
        console.log(`✅ Elementos encontrados: input fecha, ${estadoDropdownItems.length} items de dropdown`);
    
        fechaInput.addEventListener('change', function() {
            if (this.value) {
                disableEstadoDropdown();
                currentFilterType = 'fecha';
                filtrarPorFecha(this.value);
            } else {
                enableEstadoDropdown();
                currentFilterType = null;
                mostrarTodosPedidos();
            }
        });
    
        estadoDropdownItems.forEach(item => {
            item.addEventListener('click', function(e) {
                e.preventDefault();
    
                const estadoDropdown = document.getElementById('pedidoFiltradoByEstado');
                if (!estadoDropdown || estadoDropdown.disabled) {
                    console.log('🚫 Dropdown deshabilitado, ignorando click');
                    return;
                }
    
                const estado = this.textContent.trim();
                console.log('🏷️ Estado seleccionado:', estado);
    
                disableFechaInput();
                estadoDropdown.textContent = estado;
                currentFilterType = 'estado';
                filtrarPorEstado(estado);
            });
        });

        periodoDropdownItems.forEach(item => {
            item.addEventListener('click', function(e) {
                e.preventDefault();

                if (!periodoDropdownBtn || periodoDropdownBtn.disabled) {
                    console.log('🚫 Dropdown periodo deshabilitado, ignorando click');
                    return;
                }

                const periodo = this.textContent.trim();
                console.log('📅 Periodo seleccionado:', periodo);

                disableFechaInput();
                disableEstadoDropdown();

                periodoDropdownBtn.textContent = periodo;
                currentFilterType = 'periodo';
                filtrarPorPeriodoLocal(periodo);
            });
        });
    
        addClearFiltersButton();
        console.log('✅ Filtros inicializados correctamente');
    }
    
    function addClearFiltersButton() {
        const estadoCol = document.getElementById('estadoColumna');
        const inputGroup = estadoCol?.querySelector('.input-group');
    
        if (!estadoCol || !inputGroup) {
            console.error('❌ No se encontró la columna o el input-group del estado.');
            return;
        }
    
        if (inputGroup.querySelector('.clear-filters-btn')) {
            console.log('ℹ️ Botón de limpiar filtros ya existe.');
            return;
        }
    
        const clearButton = document.createElement('button');
        clearButton.className = 'btn btn-outline-danger clear-filters-btn';
        clearButton.setAttribute('onclick', 'limpiarFiltros()');
        clearButton.setAttribute('type', 'button');
        clearButton.innerHTML = '🗑️ Borrar Filtros';
        inputGroup.appendChild(clearButton);
    
        console.log('✅ Botón de limpiar filtros agregado al input-group.');
    }

    // 🌍 BASE URL GLOBAL
    window.API_BASE_URL =
        window.location.hostname === 'localhost' ||
        window.location.hostname === '127.0.0.1'
            ? 'http://localhost:5152'
            : 'https://administracionsie.onrender.com';
    
    document.addEventListener('DOMContentLoaded', async function () {
        console.log('🚀 Iniciando pedidos_script.js...');



        const edificioInput = document.getElementById("edificioFiltrado");

        if (edificioInput) {
            edificioInput.addEventListener("input", filtrarPorNombreEdificio);
        }


    
        // Arrays globales
        let productosSeleccionados = [];
        let productosGlobal = [];
        let edificiosDisponibles = [];
        let edificioSeleccionadoId = null;
    
        // Referencias HTML
        window.spinner = document.getElementById('loadingSpinner');
        const saludoSpan = document.querySelector('.navbar-saludo');
        const loadingElement = document.getElementById('loading');
        const errorElement = document.getElementById('error-message');
        const noDataElement = document.getElementById('no-data-message');
        const tableWrapper = document.getElementById('table-wrapper');
        const tableBody = document.getElementById('table-body');
        const errorDetails = document.getElementById('error-details');
        const userCount = document.getElementById('products-count');
        const searchProductInput = document.getElementById('search-product');
    
        // Botones
        const btnSearch = document.getElementById('btnSearch');
        const btnRetry = document.getElementById('btnRetry');
        const btnNewPedido = document.getElementById('btnNewPedido');
        const btnVerPedidos = document.getElementById('btnVerPedidos');
        const btnConfirmarPedidos = document.getElementById('btnConfirmarPedidos');
    
        // Estado inicial
        searchProductInput.disabled = true;
    
    
        // --- 2. MOSTRAR EL SPINNER ---
        if (window.spinner) {
            window.spinner.classList.remove('d-none');
        }
    
    
        // Lógica de autenticación
        try {
            const password = sessionStorage.getItem('admin_password');
            const response = await fetch(`${API_BASE_URL}/api/SIE/Obtener-nombre-de-usuario-por-contrasena`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(password)
            });
    
            saludoSpan.textContent = response.ok ? `Hola, ${await response.text()} !` : 'Hola, Usuario !';
        } catch (error) {
            console.log('⚠️ Error en autenticación admin:', error);
            saludoSpan.textContent = 'Hola, Usuario !';
        }
    
        // Funciones de UI
        function showLoading() {
            loadingElement.classList.remove('d-none');
            errorElement.classList.add('d-none');
            noDataElement.classList.add('d-none');
            tableWrapper.classList.add('d-none');
        }
    
        function showError(msg) {
            loadingElement.classList.add('d-none');
            errorElement.classList.remove('d-none');
            noDataElement.classList.add('d-none');
            tableWrapper.classList.add('d-none');
            errorDetails.textContent = msg;
        }
    
        function showNoData() {
            loadingElement.classList.add('d-none');
            errorElement.classList.add('d-none');
            noDataElement.classList.remove('d-none');
            tableWrapper.classList.add('d-none');
            userCount.textContent = '0';
        }
    
        function showTable(count) {
            loadingElement.classList.add('d-none');
            errorElement.classList.add('d-none');
            noDataElement.classList.add('d-none');
            tableWrapper.classList.remove('d-none');
            userCount.textContent = count;
        }



        function mostrarProductosEnModal() {
            const tablaBody = document.getElementById('tablaProductosBody');
            if (!tablaBody) {
                console.error('No se encontró tablaProductosBody');
                return;
            }

            tablaBody.innerHTML = '';

            if (productosSeleccionados.length === 0) {
                tablaBody.innerHTML = `
            <tr>
                <td colspan="5" class="text-center text-muted">
                    No hay productos seleccionados
                </td>
            </tr>
        `;
                return;
            }

            productosSeleccionados.forEach(producto => {
                const row = document.createElement('tr');
                row.innerHTML = `
                    <td><span class="badge bg-secondary">${producto.id || 'N/A'}</span></td>
                    <td><strong>${producto.nombre || 'Sin nombre'}</strong></td>
                    <td>${producto.cantidad || 1}</td>
                    <td><code>${producto.unidadMedida || 'Sin unidad'}</code></td>
                    <td><span class="text-muted">-</span></td>
                `;
                tablaBody.appendChild(row);
            });
        }


    
        function limpiarSeleccionProductos() {
            productosSeleccionados = [];
            const checks = tableBody.querySelectorAll('input[type="checkbox"]');
            checks.forEach(chk => chk.checked = false);
            const inputs = tableBody.querySelectorAll('input[type="number"]');
            inputs.forEach(inp => inp.value = 1);
            console.log("✅ Productos desmarcados correctamente");
        }
    
        // Cargar todos los productos desde API
        async function loadAllProducts() {
            showLoading();
            try {
                const response = await fetch(`${API_BASE_URL}/api/SIE/Obtener-todos-los-productos`);
                const productos = await response.json();
                if (!Array.isArray(productos)) throw new Error('Formato inválido');
                searchProductInput.disabled = false;
                productosGlobal = productos;
                renderTable(productosGlobal);
            } catch (error) {
                showError("Error al cargar productos: " + error.message);
            }
        }
    
        // Renderizar tabla de productos de la API
        function renderTable(productos) {
            tableBody.innerHTML = '';
            if (productos.length === 0) {
                showNoData();
                return;
            }
            productos.forEach(producto => {
                const tr = document.createElement('tr');
                tr.innerHTML = `
                    <td><span class="badge bg-secondary">${producto.id || 'N/A'}</span></td>
                    <td><strong>${producto.nombre || 'Sin nombre'}</strong></td>
                    <td><code>${producto.iva ?? 'Sin IVA'}</code></td>
                    <td class="cantidad-cell"></td>
                    <td class="acciones-cell"></td>
                `;
    
                const seleccionado = productosSeleccionados.find(p => p.id === producto.id);
                const cantidadInput = document.createElement('input');
                cantidadInput.type = 'number';
                cantidadInput.value = seleccionado ? seleccionado.cantidad : 1;
                cantidadInput.className = 'form-control form-control-sm d-inline-block';
                cantidadInput.style.width = '80px';
                cantidadInput.step = "any";
                cantidadInput.min = 0;
    
                cantidadInput.addEventListener('input', () => {
                    producto.cantidad = parseFloat(cantidadInput.value);
                    const sel = productosSeleccionados.find(p => p.id === producto.id);
                    if (sel) sel.cantidad = producto.cantidad;
                });
    
                const cantidadCell = tr.querySelector('.cantidad-cell');
                cantidadCell.appendChild(cantidadInput);
    
                const unidadSpan = document.createElement('span');
                unidadSpan.className = 'unidad-medida ms-2';
                unidadSpan.textContent = producto.unidadMedida || 'Sin unidad';
                cantidadCell.appendChild(unidadSpan);
    
                const check = document.createElement('input');
                check.type = 'checkbox';
                check.className = 'form-check-input';
                check.checked = !!seleccionado;
    
                check.addEventListener('change', () => {
                    if (check.checked) {
                        producto.cantidad = parseFloat(cantidadInput.value);
                        if (!productosSeleccionados.find(p => p.id === producto.id)) {
                            productosSeleccionados.push({ ...producto });
                        }
                    } else {
                        cantidadInput.value = 1;
                        producto.cantidad = 1;
                        productosSeleccionados = productosSeleccionados.filter(p => p.id !== producto.id);
                    }
                    console.log("Productos seleccionados:", productosSeleccionados);
                });
    
                const accionesCell = tr.querySelector('.acciones-cell');
                accionesCell.appendChild(check);
                tableBody.appendChild(tr);
            });
            showTable(productos.length);
        }
    
        // Buscar producto en memoria
        function searchByName() {
            const nombre = searchProductInput.value.trim().toLowerCase();
    
            if (nombre === '') {
                renderTable(productosGlobal);
                return;
            }
    
            const resultados = productosGlobal.filter(p => p.nombre.toLowerCase().includes(nombre));
    
            if (resultados.length > 0) {
                renderTable(resultados);
            } else {
                showError("Producto no encontrado");
                tableBody.innerHTML = '';
            }
        }
    
        // Funciones de Edificios
        function llenarDropdownEdificios(edificios) {
            const dropdown = document.querySelector('#menuEdificios .dropdown-menu');
            if (!dropdown) {
                console.error('❌ No se encontró el dropdown de edificios');
                return;
            }
            dropdown.innerHTML = '';
            edificios.forEach(edificio => {
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
        }
    
        function seleccionarEdificio(id, nombre) {
            edificioSeleccionadoId = id;
            const botonDropdown = document.getElementById('edificioSelected');
            if (botonDropdown) {
                botonDropdown.textContent = nombre;
                botonDropdown.setAttribute('data-selected', id);
            }
        }
    
        function obtenerIdEdificio() {
            return edificioSeleccionadoId;
        }
    
        async function cargarEdificios() {
            try {
                const response = await fetch(`${API_BASE_URL}/api/SIE/Obtener-todos-los-edificios`);
                if (!response.ok) {
                    const errorText = await response.text();
                    throw new Error(`HTTP error! status: ${response.status}`);
                }
                const edificios = await response.json();
                if (!Array.isArray(edificios)) {
                    throw new Error('Formato de edificios inválido');
                }
                edificiosDisponibles = edificios;
                llenarDropdownEdificios(edificios);
            } catch (error) {
                console.error('❌ Error al cargar edificios:', error);
                alert('Error al cargar edificios: ' + error.message);
            }
        }

        // Obtener elementos
        const periodoBtn = document.getElementById('pedidoFiltradoByPeriodo');
        const periodoItems = document.querySelectorAll('#periodoColumna .dropdown-item');

// Evento click en cada item
        periodoItems.forEach(item => {
            item.addEventListener('click', function(e) {
                e.preventDefault(); // Evita que el link haga scroll al top

                const periodoSeleccionado = this.textContent.trim(); // Obtenemos el texto
                console.log('Periodo seleccionado:', periodoSeleccionado);

                // Cambiamos el texto del botón
                periodoBtn.textContent = periodoSeleccionado;

                // Aquí puedes llamar a tu función de filtrado
                filtrarPorPeriodoLocal(periodoSeleccionado);
            });
        });

        const periodoBtnNew = document.getElementById('periodoSelected');
        const periodoItemsNew = document.querySelectorAll('#periodo .dropdown-item');

// Evento click en cada item
        let periodoSeleccionadoNew = ''; // fuera de cualquier función

        periodoItemsNew.forEach(item => {
            item.addEventListener('click', function(e) {
                e.preventDefault();
                periodoSeleccionadoNew = this.textContent.trim(); // ahora sí accesible globalmente
                console.log('Periodo seleccionado:', periodoSeleccionadoNew);
                periodoBtnNew.textContent = periodoSeleccionadoNew;
            });
        });



        // Funciones de Pedidos
        async function ConfirmarPedido() {
            try {
                const fechaEntrega = document.getElementById('fechaEntrega').value;
                const periodo = periodoSeleccionadoNew;
                const fechaISO = new Date(fechaEntrega).toISOString();
                const observaciones = document.getElementById('observaciones').value;
    
                if (!fechaEntrega) {
                    alert("Por favor seleccione una fecha de entrega");
                    return;
                }
    
                const responsePedido = await fetch(`${API_BASE_URL}/api/SIE/Crear-pedido`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        fechaEntrega: fechaISO,
                        periodo: periodo
                    })

                });
                if (!responsePedido.ok) throw new Error(`Error al crear pedido: ${responsePedido.status}`);
                const pedidoId = await responsePedido.json();
    
                const edificioId = obtenerIdEdificio();
                const edificioNombre = document.getElementById('edificioSelected').textContent;
    
                for (const producto of productosSeleccionados) {
                    const bodyPedidoProducto = {
                        idPedido: pedidoId,
                        idProducto: producto.id,
                        cantidad: producto.cantidad,
                        idEdificio: edificioId,
                        observaciones: observaciones || "",
                        edificio: edificioNombre || "Sin especificar",
                        estadoPedido: "No Entregado",
                        nombreProducto: producto.nombre || "Sin nombre",
                        unidadMedidaProducto: producto.unidadMedida || "Sin unidad",
                        periodo: periodoSeleccionadoNew,
                        estadoProducto: "No Entregado"
                    };
    
                    const responsePedidoProducto = await fetch(`${API_BASE_URL}/api/SIE/Crear-pedidoxproducto`, {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify(bodyPedidoProducto)
                    });
    
                    if (!responsePedidoProducto.ok) {
                        const errorText = await responsePedidoProducto.text();
                        console.error(`Error al asociar producto ${producto.id}:`, errorText);
                    } else {
                        console.log(`Producto ${producto.nombre} asociado correctamente`);
                    }
                }
    
                alert("Pedido creado exitosamente");
                const modal = bootstrap.Modal.getInstance(document.getElementById("miModal"));
                modal.hide();
                document.getElementById('fechaEntrega').value = '';
                document.getElementById('observaciones').value = '';
                limpiarSeleccionProductos();
                renderTable(productosGlobal);
            } catch (error) {
                console.error('Error al crear pedido:', error);
                alert("Error al crear el pedido: " + error.message);
            }
        }
    
        function ValidarCampos() {
            const errores = [];
            const edificioButton = document.getElementById('edificioSelected');
            const edificioSeleccionado = edificioButton ? edificioButton.getAttribute('data-selected') : null;
            if (!edificioSeleccionado || edificioButton.textContent.trim() === 'Seleccione un edificio') {
                errores.push('Debe seleccionar un edificio');
            }
    
            const fechaInput = document.getElementById('fechaEntrega');
            const fechaSeleccionada = fechaInput ? fechaInput.value : '';
            if (!fechaSeleccionada) {
                errores.push('Debe seleccionar una fecha');
            } else {
                const fechaActual = new Date();
                const fechaActualString = fechaActual.toISOString().split('T')[0];
                if (fechaSeleccionada < fechaActualString) {
                    errores.push('La fecha no puede ser anterior a la fecha actual');
                }
            }
    
            if (errores.length > 0) {
                const mensajeError = 'Por favor corrija los siguientes errores:\n\n' + errores.map((error, index) => `${index + 1}. ${error}`).join('\n');
                alert(mensajeError);
                return false;
            }
            return true;
        }
    
        // Funciones para mostrar y ocultar el spinner de carga de pedidos
        function showLoadingPedidos() {
            const loadingPedidos = document.getElementById('loadingPedidos');
            if (loadingPedidos) {
                loadingPedidos.classList.remove('d-none');
            }
            const listaPedidos = document.getElementById('listaPedidos');
            if (listaPedidos) {
                listaPedidos.classList.add('d-none');
            }
        }
    
        function hideLoadingPedidos() {
            const loadingPedidos = document.getElementById('loadingPedidos');
            if (loadingPedidos) {
                loadingPedidos.classList.add('d-none');
            }
            const listaPedidos = document.getElementById('listaPedidos');
            if (listaPedidos) {
                listaPedidos.classList.remove('d-none');
            }
        }
    
        async function verPedidosRegistrados() {
            const lista = document.getElementById("listaPedidos");
            lista.innerHTML = "";
            showLoadingPedidos();
    
            try {
                const [respPedidosProductos, respPedidos] = await Promise.all([
                    fetch(`${API_BASE_URL}/api/SIE/Obtener-todos-los-pedidoxproducto`),
                    fetch(`${API_BASE_URL}/api/SIE/Obtener-todos-los-pedidos`)
                ]);
    
                const pedidosProductos = await respPedidosProductos.json();
                const pedidos = await respPedidos.json();
    
                // Crear un mapa de pedidos por ID para acceso rápido
                const pedidosMap = {};
                pedidos.forEach(pedido => {
                    pedidosMap[pedido.idPedido] = pedido;
                });
                // Combinar los datos: agregar fechaEntrega a cada pedidoProducto
                const pedidosProductosConFecha = pedidosProductos.map(pedidoProducto => {
                    const pedidoInfo = pedidosMap[pedidoProducto.idPedido];
                    return {
                        ...pedidoProducto,
                        fechaEntrega: pedidoInfo ? pedidoInfo.fechaEntrega : null,
                        fechaActividad: pedidoInfo ? pedidoInfo.fechaEntrega : null // Para compatibilidad
                    };
                });
    
                console.log('🔍 Datos combinados:', pedidosProductosConFecha[0]);
    
                // Guardar la lista original con las fechas
                originalPedidos = pedidosProductosConFecha;
    
                // Mostrar los pedidos con las fechas
                mostrarPedidosFiltrados(originalPedidos);
    
            } catch (error) {
                console.error('❌ Error al cargar pedidos registrados:', error);
                mostrarErrorFiltrado("Error al cargar pedidos. Por favor, reintente.");
            } finally {
                hideLoadingPedidos();
            }
        }
    
        // Función para facturar un pedido
        window.cambiarEstado = async function (pedidoId, nuevoEstado) {
            let result = true;
            try {
                const data = {
                    idPedido: pedidoId,
                    nuevoEstado: nuevoEstado
                }
                const response = await fetch(`${API_BASE_URL}/api/SIE/Editar-estado-pedido`, {
                    method: 'PUT',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(data)
                });
    
                if (response.ok) {
                    // Solo actualiza la lista de pedidos después de un cambio exitoso
                    await verPedidosRegistrados();
                    return result;
                } else {
                    // En caso de error, solo devuelve 'false'. El toast se maneja fuera
                    console.error('Error al cambiar estado:', response.status, await response.text());
                    return false;
                }
            } catch (error) {
                // En caso de error de conexión, solo devuelve 'false'.
                console.error('Error de conexión:', error);
                return false;
            }
        }
    
    
    
    
    
        // Event listeners
        searchProductInput.addEventListener('input', searchByName);
        btnRetry.addEventListener('click', loadAllProducts);
        btnNewPedido.addEventListener('click', () => {
            if (productosSeleccionados.length === 0) {
                showToast('Debe seleccionar al menos un producto antes de crear el pedido','warning');
                return;
            }

            const modal = new bootstrap.Modal(document.getElementById('miModal'));
            modal.show();
            cargarEdificios();
            mostrarProductosEnModal(); // Agregar esta línea
        });
        btnVerPedidos.addEventListener('click', () => {
            const myModal = new bootstrap.Modal(document.getElementById('modalPedidos'));
            myModal.show();
            verPedidosRegistrados();
        });
        btnConfirmarPedidos.addEventListener('click', () => {
            if (ValidarCampos()) {
                ConfirmarPedido();
            }
        });


        // Variable para controlar si el cierre es por el botón Volver
        let cierreManual = false;

// Event listener para el botón Volver
        const btnVolver = document.getElementById('btnVolver');
        if (btnVolver) {
            btnVolver.addEventListener('click', function() {
                cierreManual = true;
                const modal = bootstrap.Modal.getInstance(document.getElementById('miModal'));
                if (modal) {
                    modal.hide();
                }
            });
        }

// Event listener para limpiar cuando se cierra el modal
        const modalElement = document.getElementById('miModal');
        if (modalElement) {
            modalElement.addEventListener('hidden.bs.modal', function () {
                if (!cierreManual) {
                    console.log('Modal cerrado automáticamente - limpiando selección');
                    limpiarSeleccionProductos();
                    document.getElementById('fechaEntrega').value = '';
                    document.getElementById('observaciones').value = '';
                    const edificioButton = document.getElementById('edificioSelected');
                    if (edificioButton) {
                        edificioButton.textContent = 'Seleccione un edificio';
                        edificioButton.removeAttribute('data-selected');
                    }
                    edificioSeleccionadoId = null;
                    renderTable(productosGlobal);
                } else {
                    console.log('Modal cerrado por botón Volver - manteniendo selección');
                }
                cierreManual = false;
            });
        }
    
        // Hacer funciones globales para acceso desde fuera del DOM
        window.verPedidosRegistrados = verPedidosRegistrados;
    
        // Inicialización
        await cargarEdificios();
        initializeFilters();
        try {
            loadAllProducts();
        } finally {
            // --- 4. OCULTAR EL SPINNER ---
            // El spinner se oculta una vez que la llamada a la API ha terminado (éxito o error)
            if (window.spinner) {
                window.spinner.classList.add('d-none');
            }
        }
    });