document.addEventListener('DOMContentLoaded', async function () {
    console.log('🚀 Iniciando pedidos_script.js...');

    

    // Arrays globales
    let productosSeleccionados = [];
    let productosGlobal = [];
    // 🔹 Array global para almacenar edificios
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
    const tabla = document.getElementById("tablaBody");

    // Botones
    const btnSearch = document.getElementById('btnSearch');
    const btnRetry = document.getElementById('btnRetry');
    const btnNewPedido = document.getElementById('btnNewPedido');
    const btnVerPedidos = document.getElementById('btnVerPedidos');
    const btnConfirmarPedidos = document.getElementById('btnConfirmarPedidos');

    // Modal
    const formProducto = document.getElementById("formProducto");
    const modalNewPedido = document.getElementById("miModal");

    // 🔹 Estado inicial
    searchProductInput.disabled = true;

    // 📌 Funciones UI
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

            // Input de cantidad
            const cantidadInput = document.createElement('input');
            cantidadInput.type = 'number';
            cantidadInput.value = 1;
            cantidadInput.className = 'form-control form-control-sm d-inline-block';
            cantidadInput.style.width = '80px';
            cantidadInput.step = "any";
            cantidadInput.min = 0;

            cantidadInput.addEventListener('input', () => {
                producto.cantidad = parseFloat(cantidadInput.value);
                const seleccionado = productosSeleccionados.find(p => p.id === producto.id);
                if (seleccionado) seleccionado.cantidad = producto.cantidad;
            });

            // Agregar primero el input y después el texto de unidad de medida
            const cantidadCell = tr.querySelector('.cantidad-cell');
            cantidadCell.appendChild(cantidadInput);

            // Agregar el texto de unidad de medida después del input
            const unidadSpan = document.createElement('span');
            unidadSpan.className = 'unidad-medida ms-2';
            unidadSpan.textContent = producto.unidadMedida || 'Sin unidad';
            cantidadCell.appendChild(unidadSpan);

            // Checkbox
            const check = document.createElement('input');
            check.type = 'checkbox';
            check.className = 'form-check-input';

            check.addEventListener('change', () => {
                if (check.checked) {
                    // Producto seleccionado - tomar el valor actual del input
                    producto.cantidad = parseFloat(cantidadInput.value);
                    if (!productosSeleccionados.find(p => p.id === producto.id)) {
                        productosSeleccionados.push({ ...producto });
                    }
                } else {
                    // Producto deseleccionado - resetear input a 1 y remover de seleccionados
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
        if (!nombre) {
            renderTable(productosGlobal);
            return;
        }

        const resultados = productosGlobal.filter(p =>
            p.nombre.toLowerCase().includes(nombre)
        );

        if (resultados.length === 0) {
            showError("Producto no encontrado");
            tableBody.innerHTML = '';
            return;
        }

        renderTable(resultados);
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



    async function ConfirmarPedido(){
        try {
            const fechaEntrega = document.getElementById('fechaEntrega').value;
            const fechaISO = new Date(fechaEntrega).toISOString();
            const observaciones = document.getElementById('observaciones').value;

            // Validar que haya fecha
            if (!fechaEntrega) {
                alert("Por favor seleccione una fecha de entrega");
                return;
            }

            // 1. Crear el pedido principal (solo fecha)

            const responsePedido = await fetch('https://administracionsie.onrender.com/api/SIE/Crear-pedido', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(fechaISO)
            });

            if (!responsePedido.ok) {
                throw new Error(`Error al crear pedido: ${responsePedido.status}`);
            }

            const pedidoId = await responsePedido.json();

            // 2. Crear los PedidoXProducto para cada producto seleccionado
            for (const producto of productosSeleccionados) {
                const bodyPedidoProducto = {
                    idPedido: pedidoId,
                    idProducto: producto.id,
                    idEdificio: obtenerIdEdificio(),
                    cantidad: producto.cantidad,
                    estadoPedido: 'No Entregado',
                    nombreProducto: producto.nombre,
                    unidadMedidaProducto: producto.unidadMedida,
                    observaciones: observaciones || ""
                };

                const responsePedidoProducto = await fetch('https://administracionsie.onrender.com/api/SIE/Crear-pedidoxproducto', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(bodyPedidoProducto)
                });

                if (!responsePedidoProducto.ok) {
                    console.error(`Error al asociar producto ${producto.id} al pedido`);
                }
            }

            alert("Pedido creado exitosamente");

            // Cerrar modal y limpiar datos
            const modal = bootstrap.Modal.getInstance(document.getElementById("miModal"));
            modal.hide();

            // Limpiar formulario
            document.getElementById('fechaEntrega').value = '';
            document.getElementById('observaciones').value = '';
            productosSeleccionados = [];

            // Resetear tabla
            renderTable(productosGlobal);

        } catch (error) {
            console.error('Error al crear pedido:', error);
            alert("Error al crear el pedido: " + error.message);
        }
    }


    function ValidarCampos()
    {
        console.log('Validando formulario de nuevo pedido...');

        const errores = [];

        const edificioButton = document.getElementById('edificioSelected');
        const edificioSeleccionado = edificioButton ? edificioButton.getAttribute('data-selected') : null;

        if (!edificioSeleccionado || edificioButton.textContent.trim() === 'Seleccione un edificio') {
            errores.push('Debe seleccionar un edificio');
            console.log('Error: No se seleccionó edificio');
        } else {
            console.log('Edificio seleccionado:', edificioSeleccionado);
        }

        // 3. Validar que la fecha no sea menor a la fecha actual
        const fechaInput = document.getElementById('fechaEntrega');
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

    // Mostrar Modal Para Ver Pedidos Registrados

    async function verPedidosRegistrados(){
        const lista = document.getElementById("listaPedidos");

        try {
            const resp = await fetch("https://administracionsie.onrender.com/api/SIE/Obtener-todos-los-pedidoxproducto");
            const data = await resp.json();

            console.log("Datos recibidos:", data); // Para debug

            lista.innerHTML = ""; // limpiar lista antes de renderizar

            if (!data || data.length === 0) {
                lista.innerHTML = `<li class="list-group-item text-muted">📭 No hay pedidos registrados</li>`;
                return;
            }

            // 🔹 AGRUPAR por idPedido para evitar duplicados
            const pedidosAgrupados = {};

            data.forEach(pedidoProducto => {
                const idPedido = pedidoProducto.idPedido;

                if (!pedidosAgrupados[idPedido]) {
                    // Primera vez que vemos este pedido - crear entrada
                    pedidosAgrupados[idPedido] = {
                        id: idPedido,
                        fecha: pedidoProducto.fecha,
                        edificio: pedidoProducto.edificio,
                        observaciones: pedidoProducto.observaciones,
                        productos: []
                    };
                }

                // Agregar este producto al pedido
                pedidosAgrupados[idPedido].productos.push(pedidoProducto);
            });

            console.log("Pedidos agrupados:", pedidosAgrupados); // Para debug

            // 🔹 RENDERIZAR cada pedido agrupado
            Object.values(pedidosAgrupados).forEach(pedido => {
                // Determinar estado general del pedido (todos entregados o no)
                const todosEntregados = pedido.productos.every(p => p.estadoPedido === "Entregado");
                const estadoBadge = todosEntregados
                    ? `<span class="badge rounded-pill bg-success">Entregado</span>`
                    : `<span class="badge rounded-pill bg-danger">Pendiente</span>`;

                const cantidadProductos = pedido.productos.length;

                // Formatear fecha si existe
                let fechaFormateada = "Sin fecha";
                if (pedido.fecha) {
                    try {
                        const fecha = new Date(pedido.fecha);
                        fechaFormateada = fecha.toLocaleDateString('es-ES');
                    } catch (e) {
                        fechaFormateada = pedido.fecha;
                    }
                }

                let item = `
                <li class="list-group-item d-flex justify-content-between align-items-start pedido-item" 
                    data-pedido-id="${pedido.id}" 
                    style="cursor: pointer; border-left: 4px solid ${todosEntregados ? '#198754' : '#dc3545'};">
                    <div class="ms-2 me-auto">
                        <div class="fw-bold">Pedido #${pedido.id}</div>
                        <div><strong>Fecha:</strong> ${fechaFormateada}</div>
                        <div><strong>Edificio:</strong> ${pedido.edificio || "Sin edificio"}</div>
                        <small class="text-muted">${cantidadProductos} producto(s)</small>
                        <br>
                        <small class="text-muted">Observaciones: ${pedido.observaciones || "Sin observaciones"}</small>
                    </div>
                    <div class="text-end">
                        ${estadoBadge}
                        <br>
                    </div>
                </li>
            `;
                lista.innerHTML += item;
            });

            // 🔹 AGREGAR event listeners para mostrar detalles
            document.querySelectorAll('.pedido-item').forEach(item => {
                item.addEventListener('click', function() {
                    const pedidoId = this.getAttribute('data-pedido-id');
                    const pedidoSeleccionado = pedidosAgrupados[pedidoId];
                    mostrarDetallesPedido(pedidoSeleccionado);
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

        // Crear modal dinámico
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
                            <table class="table table-striped table-hover">
                                <thead class="table-dark">
                                    <tr>
                                        <th style="width: 10%;">ID</th>
                                        <th style="width: 40%;">Producto</th>
                                        <th style="width: 15%;">Cantidad</th>
                                        <th style="width: 15%;">Unidad</th>
                                        <th style="width: 20%;">Estado</th>
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
        if (pedido.fecha) {
            try {
                const fecha = new Date(pedido.fecha);
                fechaFormateada = fecha.toLocaleDateString('es-ES', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                });
            } catch (e) {
                fechaFormateada = pedido.fecha;
            }
        }

        // Actualizar título
        document.getElementById('modalDetallesTitle').textContent = `📦 Pedido #${pedido.id}`;

        // Actualizar información general
        const infoDiv = document.getElementById('detallesPedidoInfo');
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

        // Llenar tabla de productos
        const tablaBody = document.getElementById('tablaDetallesProductos');
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
        });

        // Cerrar modal de pedidos si está abierto
        const modalPedidos = bootstrap.Modal.getInstance(document.getElementById('modalPedidos'));
        if (modalPedidos) {
            modalPedidos.hide();
        }

        // Mostrar modal de detalles
        const modal = new bootstrap.Modal(modalDetalles);
        modal.show();
    }





    // ✅ Eventos
    if (btnSearch) btnSearch.addEventListener('click', loadAllProducts);
    btnNewPedido.addEventListener("click", function () {
        console.table(productosSeleccionados);
        const tablaBody = document.getElementById("tablaProductosBody");
        tablaBody.innerHTML = ""; // limpiar antes de cargar

        if (productosSeleccionados.length === 0) {
            alert("⚠️ No hay productos seleccionados.");
            return;
        }

        productosSeleccionados.forEach(prod => {
            const tr = document.createElement("tr");

            tr.innerHTML = `
            <td>${prod.id}</td>
            <td>${prod.nombre}</td>
            <td>${prod.cantidad ?? 1}</td>
            <td>${prod.unidadMedida ?? "-"}</td>
            <td>-</td>
        `;

            tablaBody.appendChild(tr);
        });

        const edificioButton = document.getElementById('edificioSelected');
        if (edificioButton) {
            edificioButton.textContent = 'Seleccione un edificio';
            edificioButton.removeAttribute('data-selected');
        }
        // Limpiar fecha
        const fechaInput = document.getElementById('fechaEntrega');
        if (fechaInput) {
            fechaInput.value = '';
        }

        // Limpiar observaciones
        const observacionesTextPedido = document.getElementById('observaciones');
        if (observacionesTextPedido) {
            observacionesTextPedido.value = '';
        }

        // Mostrar modal
        const modal = new bootstrap.Modal(document.getElementById("miModal"));
        modal.show();
        // Cargar las actividades Y edificios después de mostrar el modal
        setTimeout(async () => {
            await cargarEdificios();
        },100);
    });

    searchProductInput.addEventListener("input", () => {
        clearTimeout(this.debounceTimer);
        this.debounceTimer = setTimeout(searchByName, 300);
    });


    btnConfirmarPedidos.addEventListener("click", function () {
        console.table(productosSeleccionados);
        const isValid = ValidarCampos();
        if(isValid)
        {
            console.log('Formulario válido - procediendo con el envío...');
            ConfirmarPedido();
        }

    })

    btnVerPedidos.addEventListener("click", function () {
        verPedidosRegistrados();

        // abrir modal después de cargar lista
        const modalPedidos = new bootstrap.Modal(document.getElementById("modalPedidos"));
        modalPedidos.show();
    })
});
