document.addEventListener('DOMContentLoaded', async function () {

    const navbarToggle = document.querySelector('.navbar-toggle');
    const navbarMenu = document.querySelector('.navbar-menu');
    const saludoSpan = document.querySelector('.navbar-saludo');

    let tareaSeleccionada = [];
    let idPedidoSeleccionado;


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


    // --------------------------------------------------------
    //                   CARGAR NUEVO PEDIDO
    // --------------------------------------------------------


    // BOTONES Y MODALES
    const btnPedidos = document.getElementById('btnPedidos');
    const btnContinuar = document.getElementById('btnContinuarRegistro');
    const btnVolver  = document.getElementById('btnVolver');
    const btnConfirmarRegistro = document.getElementById('btnConfirmarPedidos');


    const loadingSpinner = document.getElementById('loadingSpinner');

    // Elementos del DOM de los modales
    const modalRegistrarPedidoEl = document.getElementById('modalRegistrarPedido');
    const miModalEl = document.getElementById('miModal');

    // Instancias de los modales de Bootstrap
    const modalRegistrarPedido = new bootstrap.Modal(modalRegistrarPedidoEl);
    const miModal = new bootstrap.Modal(miModalEl);

    const loadingElement = document.getElementById('loading');
    const errorElement = document.getElementById('error-message');
    const noDataElement = document.getElementById('no-data-message');
    const tableWrapper = document.getElementById('table-wrapper');
    const tableBody = document.getElementById('table-body');
    const errorDetails = document.getElementById('error-details');
    const userCount = document.getElementById('products-count');
    const searchProductInput = document.getElementById('search-product');

    // Nuevo elemento: tabla del segundo modal
    const tablaProductosBody = document.getElementById('tablaProductosBody');

    let productosGlobal = [];
    let productosSeleccionados = [];
    let edificiosDisponibles = [];
    let edificioSeleccionadoId = null;




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
            showToast(mensajeError,'warning');
            return false;
        }
        return true;
    }

    async function ConfirmarPedido() {
        let result = true;
        try {
            const fechaEntrega = document.getElementById('fechaEntrega').value;
            const fechaISO = new Date(fechaEntrega).toISOString();
            const observaciones = document.getElementById('observaciones').value;


            const responsePedido = await fetch('https://administracionsie.onrender.com/api/SIE/Crear-pedido', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(fechaISO)
            });
            if (!responsePedido.ok)
            {
                throw new Error(`Error al crear pedido: ${responsePedido.status}`);
                return false;
            }
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
                    estadoPedido: "Pendiente - Preparar",
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
                    return false;
                } else {
                    console.log(`Producto ${producto.nombre} asociado correctamente`);
                }
            }
            return result;
            const modal = bootstrap.Modal.getInstance(document.getElementById("miModal"));
            modal.hide();
            document.getElementById('fechaEntrega').value = '';
            document.getElementById('observaciones').value = '';
            document.getElementById('edificioSelected').textContent = 'Seleccione un edificio';
            limpiarSeleccionProductos();
            renderTable(productosGlobal);
        } catch (error) {
            return false;
            console.error('Error al crear pedido:', error);
        }
    }

    function limpiarSeleccionProductos() {
        productosSeleccionados = [];
        const checks = tableBody.querySelectorAll('input[type="checkbox"]');
        checks.forEach(chk => chk.checked = false);
        const inputs = tableBody.querySelectorAll('input[type="number"]');
        inputs.forEach(inp => inp.value = 1);
        console.log("✅ Productos desmarcados correctamente");
    }

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

    // Nueva función para llenar la tabla del segundo modal
    function renderSelectedProductsTable() {
        tablaProductosBody.innerHTML = ''; // Limpiar la tabla antes de llenarla
        if (productosSeleccionados.length === 0) {
            // Manejar caso sin productos seleccionados si es necesario
            const tr = document.createElement('tr');
            tr.innerHTML = `<td colspan="5" class="text-center">No hay productos seleccionados.</td>`;
            tablaProductosBody.appendChild(tr);
            return;
        }

        productosSeleccionados.forEach(producto => {
            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td>${producto.nombre}</td>
                <td>${producto.cantidad}</td>
                <td>${producto.unidadMedida}</td>
            `;
            tablaProductosBody.appendChild(tr);
        });
    }

    searchProductInput.addEventListener('input', searchByName);

    btnPedidos.addEventListener('click', () => {
        // Mostrar el modal
        loadAllProducts();
        modalRegistrarPedido.show();
    });

    btnContinuar.addEventListener('click', () => {
        if(productosSeleccionados.length === 0) {
            showToast('Debe seleccionar al menos un producto para continuar','warning');
        }
        else
        {
            // Ocultar el modal actual
            modalRegistrarPedido.hide();
            // Cargar los edificios para el siguiente modal
            cargarEdificios();
            // Llamar a la nueva función para llenar la tabla del modal "Nuevo Pedido"
            renderSelectedProductsTable();
            // Mostrar el nuevo modal
            miModal.show();
        }

    })

    btnConfirmarRegistro.addEventListener('click', () => {
        if(ValidarCampos()) {

            if(loadingSpinner)
            {
                loadingSpinner.classList.remove('d-none');
            }

            btnConfirmarRegistro.disabled = true;

            new Promise(r => setTimeout(r, 2000));

            let resultado = ConfirmarPedido();

            if(loadingSpinner)
            {
                loadingSpinner.classList.add('d-none');
            }

            btnConfirmarRegistro.disabled = false;

            if(resultado)
            {
                showToast('✅ Pedido Registrado !', 'success');
            } else {
                showToast('❌ Ocurrió un error al registrar el pedido', "error");
            }

            // cerrar modal después de un ratito
            setTimeout(() => {
            }, 500);


        }
    })

    btnVolver.addEventListener('click', () => {
        // Mostrar el modal
        loadAllProducts();
        modalRegistrarPedido.show();
    })

});