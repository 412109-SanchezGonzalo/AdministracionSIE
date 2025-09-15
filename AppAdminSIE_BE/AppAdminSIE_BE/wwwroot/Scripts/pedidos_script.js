document.addEventListener('DOMContentLoaded', async function () {
    console.log('🚀 Iniciando pedidos_script.js...');

    // Arrays globales
    let productosSeleccionados = [];
    let productosGlobal = [];
    let edificiosDisponibles = [];
    let edificioSeleccionadoId = null;

    // Referencias HTML
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

    // 🔹 Estado inicial
    searchProductInput.disabled = true;

    // 🎨 Funciones de estado
    function obtenerEstadoHtml(estadoPedido) {
        let texto = '';
        let claseColor = '';

        switch (estadoPedido) {
            case 'Entregado':
                texto = 'Entregado - Sin Facturar';
                claseColor = 'bg-warning';
                break;
            case 'No Entregado':
                texto = 'No entregado';
                claseColor = 'bg-danger';
                break;
            case 'Facturado':
                texto = 'Entregado - Facturado';
                claseColor = 'bg-success';
                break;
            default:
                texto = estadoPedido;
                claseColor = 'bg-secondary';
        }
        return `<span class="badge rounded-pill ${claseColor}">${texto}</span>`;
    }

    function obtenerEstadoProductoHtml(estadoProducto) {
        let texto = '';
        let claseColor = '';

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

    // 🌐 Lógica de autenticación
    try {
        const password = localStorage.getItem('admin_password');
        const response = await fetch('https://administracionsie.onrender.com/api/SIE/Obtener-nombre-de-usuario-por-contrasena', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(password)
        });

        saludoSpan.textContent = response.ok ? `Hola, ${await response.text()} !` : 'Hola, Usuario !';
    } catch (error) {
        console.log('⚠️ Error en autenticación admin:', error);
        saludoSpan.textContent = 'Hola, Usuario !';
    }

    // 📌 Funciones de UI
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

    function limpiarSeleccionProductos() {
        productosSeleccionados = [];
        const checks = tableBody.querySelectorAll('input[type="checkbox"]');
        checks.forEach(chk => chk.checked = false);
        const inputs = tableBody.querySelectorAll('input[type="number"]');
        inputs.forEach(inp => inp.value = 1);
        console.log("✅ Productos desmarcados correctamente");
    }

    // ✅ Cargar todos los productos desde API
    async function loadAllProducts() {
        showLoading();
        try {
            const response = await fetch('https://administracionsie.onrender.com/api/SIE/Obtener-todos-los-productos');
            const productos = await response.json();
            if (!Array.isArray(productos)) throw new Error('Formato inválido');
            searchProductInput.disabled = false;
            productosGlobal = productos;
            renderTable(productosGlobal);
        } catch (error) {
            showError("Error al cargar productos: " + error.message);
        }
    }

    // ✅ Renderizar tabla de productos de la API
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

    // 🔍 Buscar producto en memoria
    function searchByName() {
        const nombre = searchProductInput.value.trim().toLowerCase();

        // Si el campo de búsqueda está vacío, muestra todos los productos
        if (nombre === '') {
            renderTable(productosGlobal);
            return;
        }

        // Filtra los productos que coincidan con la búsqueda
        const resultados = productosGlobal.filter(p => p.nombre.toLowerCase().includes(nombre));

        // Renderiza la tabla con los resultados
        if (resultados.length > 0) {
            renderTable(resultados);
        } else {
            showError("Producto no encontrado");
            tableBody.innerHTML = '';
        }
    }

    // 🔹 Funciones de Edificios
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
            const response = await fetch('https://administracionsie.onrender.com/api/SIE/Obtener-todos-los-edificios');
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

    // 📝 Funciones de Pedidos
    async function ConfirmarPedido() {
        try {
            const fechaEntrega = document.getElementById('fechaEntrega').value;
            const fechaISO = new Date(fechaEntrega).toISOString();
            const observaciones = document.getElementById('observaciones').value;

            if (!fechaEntrega) {
                alert("Por favor seleccione una fecha de entrega");
                return;
            }

            const responsePedido = await fetch('https://administracionsie.onrender.com/api/SIE/Crear-pedido', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(fechaISO)
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
                    estadoProducto: "No Entregado"
                };

                const responsePedidoProducto = await fetch('https://administracionsie.onrender.com/api/SIE/Crear-pedidoxproducto', {
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

    // 🆕 Funciones para mostrar y ocultar el spinner de carga de pedidos
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
                fetch("https://administracionsie.onrender.com/api/SIE/Obtener-todos-los-pedidoxproducto"),
                fetch("https://administracionsie.onrender.com/api/SIE/Obtener-todos-los-pedidos")
            ]);

            const pedidosProductos = await respPedidosProductos.json();
            const pedidos = await respPedidos.json();

            if (!pedidosProductos || pedidosProductos.length === 0) {
                lista.innerHTML = `<li class="list-group-item text-muted">📭 No hay pedidos registrados</li>`;
                return;
            }

            const pedidosMap = {};
            pedidos.forEach(pedido => {
                pedidosMap[pedido.idPedido] = pedido;
            });

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

            Object.values(pedidosAgrupados).forEach(pedido => {
                let estadoGeneral = 'No Entregado';
                const todosFacturados = pedido.productos.every(p => p.estadoPedido === 'Facturado');
                const todosEntregados = pedido.productos.every(p => p.estadoPedido === 'Entregado');

                if (todosFacturados) {
                    estadoGeneral = 'Facturado';
                } else if (todosEntregados) {
                    estadoGeneral = 'Entregado';
                }

                let colorBorde;
                switch (estadoGeneral) {
                    case 'Entregado':
                        colorBorde = '#ffc107';
                        break;
                    case 'Facturado':
                        colorBorde = '#198754';
                        break;
                    case 'No Entregado':
                    default:
                        colorBorde = '#dc3545';
                        break;
                }

                const cantidadProductos = pedido.productos.length;
                let fechaFormateada = "Sin fecha";
                if (pedido.fechaEntrega) {
                    try {
                        const fecha = new Date(pedido.fechaEntrega);
                        fechaFormateada = fecha.toLocaleDateString('es-ES', { year: 'numeric', month: '2-digit', day: '2-digit' });
                    } catch (e) {
                        fechaFormateada = pedido.fechaEntrega;
                    }
                }

                const estadoHtml = obtenerEstadoHtml(estadoGeneral);

                // 🆕 SE HA AÑADIDO `flex-wrap` A LA LISTA
                let item = `
                    <li class="list-group-item d-flex justify-content-between align-items-start pedido-item flex-wrap"
                        data-pedido-id="${pedido.id}"
                        data-estado-general="${estadoGeneral}"
                        style="cursor: pointer; border-left: 4px solid ${colorBorde};">
                        <div class="ms-2 me-auto">
                            <div class="fw-bold">Pedido #${pedido.id}</div>
                            <div><strong>📅 Fecha:</strong> ${fechaFormateada}</div>
                            <div><strong>🏢 Edificio:</strong> ${pedido.edificio || "Sin edificio"}</div>
                            <small class="text-muted">📦 ${cantidadProductos} producto(s)</small>
                            <br>
                            <small class="text-muted">📝 ${pedido.observaciones || "Sin observaciones"}</small>
                        </div>
                        <div class="text-end">
                            ${estadoHtml}
                            <br>
                        </div>
                    </li>
                `;
                lista.innerHTML += item;
            });

            document.querySelectorAll('.pedido-item').forEach(item => {
                item.addEventListener('click', async function() {
                    const pedidoId = this.getAttribute('data-pedido-id');
                    const estadoGeneral = this.getAttribute('data-estado-general');
                    const pedidoDetalle = Object.values(pedidosAgrupados).find(p => p.id == pedidoId);
                    if (pedidoDetalle) {
                        mostrarDetallesPedido(pedidoDetalle, estadoGeneral);
                    } else {
                        console.error('No se encontró el pedido con ID:', pedidoId);
                        alert('Error: No se pudo cargar el detalle del pedido');
                    }
                });
            });

        } catch (error) {
            console.error("Error cargando pedidos:", error);
            lista.innerHTML = `<li class="list-group-item text-danger">⚠️ Error cargando pedidos: ${error.message}</li>`;
        } finally {
            hideLoadingPedidos();
        }
    }

    function mostrarDetallesPedido(pedido, estadoGeneral) {
        // CERRAR EL MODAL DE PEDIDOS
        const modalPedidos = bootstrap.Modal.getInstance(document.getElementById('modalPedidos'));
        if (modalPedidos) {
            modalPedidos.hide();
        }

        const modalDetalles = document.getElementById('modalDetallesPedido');
        if (!modalDetalles) {
            console.error("El modal de detalles no existe.");
            return;
        }

        const titleElement = document.getElementById('modalDetallesPedidoLabel');
        const infoDiv = document.getElementById('detallesPedidoInfo');
        const tablaBody = document.getElementById('tablaDetallesProductos');
        const modalFooter = modalDetalles.querySelector('.modal-footer');

        // Limpiar el footer y recrear el botón volver
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
                                <p class="mb-2"><strong>📅 Fecha:</strong> ${fechaFormateada}</p>
                                <p class="mb-2"><strong>🏢 Edificio:</strong> ${pedido.edificio || 'Sin especificar'}</p>
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

        if (tablaBody) {
            tablaBody.innerHTML = '';
            pedido.productos.forEach(producto => {
                const estadoBadge = obtenerEstadoProductoHtml(producto.estadoProducto);
                const row = document.createElement('tr');
                row.innerHTML = `
                    <td><span class="badge bg-secondary">${producto.idProducto || 'N/A'}</span></td>
                    <td><strong>${producto.nombreProducto || 'Sin nombre'}</strong></td>
                    <td>${producto.cantidad || 'N/A'}</td>
                    <td><code>${producto.unidadMedidaProducto || 'Sin unidad'}</code></td>
                    <td>${estadoBadge}</td>
                `;
                tablaBody.appendChild(row);
            });
        }

        if (estadoGeneral === 'Entregado') {
            const btnFacturar = document.createElement('button');
            btnFacturar.type = 'button';
            btnFacturar.className = 'btn btn-success ms-2';
            btnFacturar.textContent = 'FACTURAR';
            btnFacturar.addEventListener('click', () => {
                if (confirm("¿Estás seguro de que deseas facturar este pedido?")) {
                    facturarPedido(pedido.id);
                }
            });
            modalFooter.appendChild(btnFacturar);
        }

        const modalInstance = new bootstrap.Modal(modalDetalles);
        modalInstance.show();
    }

    // 🚀 Función para facturar un pedido
    async function facturarPedido(pedidoId) {
        try {
            const data = {
                idPedido: pedidoId,
                nuevoEstado: 'Facturado'
            }
            const response = await fetch(`https://administracionsie.onrender.com/api/SIE/Editar-estado-pedido`, {
                method: 'PUT',
                // 🆕 Agregamos el encabezado Content-Type
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(data)
            });

            if (response.ok) {
                alert(`✅ Pedido #${pedidoId} facturado correctamente.`);
                const modalDetalles = bootstrap.Modal.getInstance(document.getElementById('modalDetallesPedido'));
                if(modalDetalles) modalDetalles.hide();
                await verPedidosRegistrados();
            } else {
                const errorText = await response.text();
                alert(`❌ Error al facturar pedido: ${errorText}`);
                console.error('Error al facturar pedido:', response.status, errorText);
            }
        } catch (error) {
            alert('❌ Error de conexión al intentar facturar el pedido.');
            console.error('Error de conexión:', error);
        }
    }

    // 🔌 Eventos
    searchProductInput.addEventListener('input', searchByName);
    btnRetry.addEventListener('click', loadAllProducts);
    btnNewPedido.addEventListener('click', () => {
        cargarEdificios();
        limpiarSeleccionProductos();
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

    // Iniciar la carga de productos al cargar la página
    loadAllProducts();
});