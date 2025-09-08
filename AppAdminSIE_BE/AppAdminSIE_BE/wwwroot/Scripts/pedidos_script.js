document.addEventListener('DOMContentLoaded', async function () {

    console.log('🚀 Iniciando pedidos_script.js...');

    // 🔹 Array global para guardar seleccionados
    let productosSeleccionados = [];
    // 🔹 Array global para almacenar edificios
    let edificiosDisponibles = [];
    let edificioSeleccionadoId = null;

    const navbarToggle = document.querySelector('.navbar-toggle');
    const navbarMenu = document.querySelector('.navbar-menu');
    const saludoSpan = document.querySelector('.navbar-saludo');

    const loadingElement = document.getElementById('loading');
    const errorElement = document.getElementById('error-message');
    const noDataElement = document.getElementById('no-data-message');
    const tableWrapper = document.getElementById('table-wrapper');
    const tableBody = document.getElementById('table-body');
    const errorDetails = document.getElementById('error-details');
    const userCount = document.getElementById('products-count');
    const searchProductInput = document.getElementById('search-product');

    searchProductInput.disabled = true;

    const btnSearch = document.getElementById('btnSearch');
    const btnAll = document.getElementById('btnAll');
    const btnClear = document.getElementById('btnClear');
    const btnRetry = document.getElementById('btnRetry');
    const btnNewTask = document.getElementById('btnNewPedido');
    const btnVerTask = document.getElementById('btnVerPedidos');


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
        searchProductInput.value = '';
        showNoData();
    }


    let productosGlobal = [];
    // ✅ Cargar todos los productos al inicio
    async function loadAllProducts() {
        showLoading();
        try {
            const response = await fetch('https://administracionsie.onrender.com/api/SIE/Obtener-todos-los-productos');
            const productos = await response.json();

            if (!Array.isArray(productos)) throw new Error('Formato inválido');

            searchProductInput.disabled = false;

            productosGlobal = productos; // guardamos todos
            renderTable(productosGlobal); // mostramos todo
        } catch (error) {
            showError("Error al cargar usuarios: " + error.message);
        }
    }

    // Función que renderiza la tabla con la lista de productos y checkboxes
    function renderTable(productos) {
        tableBody.innerHTML = ''; // Limpiar la tabla antes de agregar filas

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
            <td class="cantidad-cell"></td> <!-- columna cantidad -->
            <td class="acciones-cell"></td> <!-- columna acciones (checkbox) -->
        `;

            // ✅ Crear input de cantidad
            const cantidadInput = document.createElement('input');
            cantidadInput.type = 'number';
            cantidadInput.value = 1;
            cantidadInput.min = 1;
            cantidadInput.className = 'form-control form-control-sm d-inline-block';
            cantidadInput.style.width = '80px';

            // ✅ Crear texto con la unidad de medida
            const unidadSpan = document.createElement('span');
            unidadSpan.textContent = ` ${producto.unidadMedida || ''}`;
            unidadSpan.className = 'ms-2';

            // Agregar input + unidad en la celda Cantidad
            const cantidadCell = tr.querySelector('.cantidad-cell');
            cantidadCell.appendChild(cantidadInput);
            cantidadCell.appendChild(unidadSpan);

            // ✅ Crear el checkbox (acciones)
            const check = createCheckboxForProduct(producto);
            const accionesCell = tr.querySelector('.acciones-cell');
            accionesCell.appendChild(check);

            // Agregar fila
            tableBody.appendChild(tr);
        });

        showTable(productos.length);
    }


    // Esta función se utiliza para crear y agregar un checkbox a cada fila (CORREGIDA)
    function createCheckboxForProduct(producto) {
        const check = document.createElement('input');
        check.type = 'checkbox';
        check.className = 'form-check-input selectEmployee'; // ✅ Agregar clase selectEmployee
        check.title = 'Seleccionar producto';

        // Si el producto está en productosSeleccionados, marcar el checkbox
        const productoExistente = productosSeleccionados.find(pro => pro.id === producto.id);
        if (productoExistente) {
            check.checked = true;
        }

        // Evento para manejar el cambio de estado del checkbox
        check.addEventListener('change', () => {
            const productoInfo = {
                id: producto.id || 'N/A',
                nombre: producto.nombre || 'Sin nombre',
                Iva: producto.IVA || 'Sin IVA'
            };

            if (check.checked) {
                // Agregar si no existe
                if (!productosSeleccionados.find(pro => pro.id === productoInfo.id)) {
                    productosSeleccionados.push(productoInfo);
                }
            } else {
                // Quitar si se desmarca
                productosSeleccionados = productosSeleccionados.filter(pro => pro.id !== productosSeleccionados.id);
            }

            console.log("Productods seleccionados:", productosSeleccionados);
        });

        return check;
    }


    function renderTable(productos) {
        tableBody.innerHTML = ''; // Limpiar la tabla antes de agregar filas

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
            <td class="cantidad-cell"></td> <!-- columna cantidad -->
            <td class="acciones-cell"></td> <!-- columna acciones (checkbox) -->
        `;

            // ✅ Crear input de cantidad
            const cantidadInput = document.createElement('input');
            cantidadInput.type = 'number';
            cantidadInput.value = 1;
            cantidadInput.min = 1;
            cantidadInput.className = 'form-control form-control-sm d-inline-block';
            cantidadInput.style.width = '80px';

            // ✅ Crear texto con la unidad de medida
            const unidadSpan = document.createElement('span');
            unidadSpan.textContent = ` ${producto.unidadMedida || ''}`;
            unidadSpan.className = 'ms-2';

            // Agregar input + unidad en la celda Cantidad
            const cantidadCell = tr.querySelector('.cantidad-cell');
            cantidadCell.appendChild(cantidadInput);
            cantidadCell.appendChild(unidadSpan);

            // ✅ Crear el checkbox (acciones)
            const check = createCheckboxForProduct(producto);
            const accionesCell = tr.querySelector('.acciones-cell');
            accionesCell.appendChild(check);

            // Agregar fila
            tableBody.appendChild(tr);
        });

        showTable(productos.length);
    }


    // Eventos
    if(btnSearch) btnSearch.addEventListener('click',loadAllProducts);


})