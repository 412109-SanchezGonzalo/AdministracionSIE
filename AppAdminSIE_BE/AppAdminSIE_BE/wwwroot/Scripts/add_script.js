document.addEventListener('DOMContentLoaded', async function () {

    const API_BASE_URL = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
        ? 'http://localhost:5152'  // Local
        : 'https://administracionsie.onrender.com';  // Producción

    const navbarToggle = document.querySelector('.navbar-toggle');
    const navbarMenu = document.querySelector('.navbar-menu');
    const saludoSpan = document.querySelector('.navbar-saludo');


    const loadingSpinner = document.getElementById('loadingSpinner');

    const loadingElement = document.getElementById('loading');

    const btnNewUser = document.getElementById('btnNewUser');
    const btnNewProduct = document.getElementById('btnNewProduct');
    const btnNewEdificio = document.getElementById('btnNewEdificio');

    const selectRol = document.getElementById('selectedRol');
    const selectUnit = document.getElementById('selectedUnit');
    const containerEdificios = document.getElementById('container-edificios-asociados');
    const edificiosList = document.getElementById('edificios-list');

    const btnCloseNewUser = document.getElementById("closeNewUserModalBtn");
    const btnCloseNewProduct = document.getElementById("closeNewProductModalBtn");
    const btnCloseNewEdificio = document.getElementById("closeNewEdificioModalBtn");

    if(loadingSpinner) {
        loadingSpinner.classList.remove('d-none');
    }

    try {
        const password = sessionStorage.getItem('admin_password');
        console.log('🔐 Admin password:', password);

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
    } finally {
        if (loadingSpinner) {
            loadingSpinner.classList.add('d-none');
        }
    }


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




    // -------------------- CREAR NUEVO USUARIO --------------------------- //

    btnNewUser.addEventListener('click', async () => {

        openModalNewUser();

    })

    if (btnCloseNewUser) {
        btnCloseNewUser.addEventListener('click', () => {
            // 1. Limpiamos todos los inputs de texto, email y número
            document.getElementById('Name-New-User').value = '';
            document.getElementById('LastName-New-User').value = '';
            document.getElementById('Nickname-New-User').value = '';
            document.getElementById('Password-New-User').value = '';
            document.getElementById('Email-New-User').value = '';
            document.getElementById('NumberPhone-New-User').value = '';

            // 2. Ponemos el Rol en value 1 (Administrador)
            // Usamos el selector
            if (selectRol) {
                selectRol.value = "1";
            }

            // 3. Cerrar modal

            document.getElementById('modal-NewUser').style.display = "none";
        });
    }

    function openModalNewUser() {

        if(loadingSpinner) {
            loadingSpinner.classList.remove('d-none');
        }
        try{
            const modalNewUser = document.getElementById("modal-NewUser");

            modalNewUser.style.display = 'flex';
        } finally {
            if (loadingSpinner) {
                loadingSpinner.classList.add('d-none');
            }
        }


    }

    selectRol.addEventListener('change', async (e) => {
        if (e.target.value === "2") { // "2" es Usuario
            containerEdificios.style.display = 'block';
            await cargarEdificios();
        } else {
            containerEdificios.style.display = 'none';
            edificiosList.innerHTML = ''; // Limpiar si vuelve a Admin
        }
    });

    // 3. Función para traer datos de la API y crear los radio buttons
    async function cargarEdificios() {
        if(loadingSpinner) {
            loadingSpinner.classList.remove('d-none');
        }
        try {
            const response = await fetch(`${API_BASE_URL}/api/SIE/Obtener-todos-los-edificios`);
            const edificios = await response.json();

            console.log('Edificios recibidos de la API:', edificios); // Debug

            const edificiosList = document.getElementById('edificios-list');
            edificiosList.innerHTML = '';

            edificios.forEach(edificio => {
                console.log('Procesando edificio:', edificio.id_Edificio, edificio.nombre); // Debug

                const col = document.createElement('div');
                col.className = 'col-12 col-md-6';

                // CORRECCIÓN: Crear elementos del DOM en lugar de innerHTML
                const formCheck = document.createElement('div');
                formCheck.className = 'form-check';

                const checkbox = document.createElement('input');
                checkbox.className = 'form-check-input';
                checkbox.type = 'checkbox';
                checkbox.name = 'edificiosAsociados';
                checkbox.value = edificio.id_Edificio; // Asignar directamente
                checkbox.id = `edificio-${edificio.id_Edificio}`;

                const label = document.createElement('label');
                label.className = 'form-check-label text-truncate';
                label.htmlFor = `edificio-${edificio.id_Edificio}`;
                label.textContent = edificio.nombre;

                formCheck.appendChild(checkbox);
                formCheck.appendChild(label);
                col.appendChild(formCheck);
                edificiosList.appendChild(col);

                console.log('Checkbox creado con value:', checkbox.value); // Debug
            });
        } catch (error) {
            console.error("Error cargando edificios:", error);
            document.getElementById('edificios-list').innerHTML = '<div class="col-12 text-danger">Error al cargar edificios</div>';
        } finally {
            if (loadingSpinner) {
                loadingSpinner.classList.add('d-none');
            }
        }
    }

    document.getElementById('btnConfirmarNewUser').addEventListener('click', async () => {
        const selectElement = document.getElementById('selectedRol');
        const rolTexto = selectElement.options[selectElement.selectedIndex].text;

        // Capturamos los valores de los inputs
        const emailInput = document.getElementById('Email-New-User').value.trim();
        const telefonoInput = document.getElementById('NumberPhone-New-User').value.trim();

        // Lógica de reemplazo para campos vacíos
        const emailFinal = emailInput === "" ? "-" : emailInput;
        const telefonoFinal = telefonoInput === "" ? "0" : parseInt(telefonoInput);

        // Armamos la lista de objetos según tu modelo EdificioXUsuario
        const edificiosSeleccionados = [];

        // CORRECCIÓN: Verificar que el rol sea "Usuario" (exactamente como aparece en el select)
        console.log('Rol seleccionado:', rolTexto); // Para debug

        if (rolTexto === "Usuario") {
            // CORRECCIÓN: Buscar los checkboxes correctamente
            const checks = document.querySelectorAll('#edificios-list input[type="checkbox"]:checked');

            console.log('Checkboxes encontrados:', checks.length); // Para debug

            checks.forEach(cb => {
                const valorNumerico = Number(cb.value);
                const nombreEdificio = cb.nextElementSibling?.textContent || '';

                console.log('Edificio seleccionado ID:', valorNumerico); // Para debug

                if (!isNaN(valorNumerico)) {
                    edificiosSeleccionados.push({
                        IdEdificio: valorNumerico,
                        NombreEdificio: nombreEdificio.trim()
                    });
                }
            });
        }

        console.log('Edificios a enviar:', edificiosSeleccionados); // Para debug

        const payload = {
            Nombre: document.getElementById('Name-New-User').value,
            Apellido: document.getElementById('LastName-New-User').value,
            NicknameDni: document.getElementById('Nickname-New-User').value,
            Contraseña: document.getElementById('Password-New-User').value,
            Email: emailFinal,
            Telefono: String(telefonoFinal),
            Rol: rolTexto,
            EdificiosAsociados: edificiosSeleccionados
        };

        console.log('Payload completo:', JSON.stringify(payload, null, 2)); // Para debug

        try {
            const response = await fetch(`${API_BASE_URL}/api/SIE/Crear-usuario`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });

            if (response.ok) {
                const resText = await response.text();
                showToast("✅ Usuario Creado",'success');
                console.log('Edificios enviados:', edificiosSeleccionados);

                // Cerramos modal y limpiamos formulario
                document.getElementById('modal-NewUser').style.display = 'none';
                if(btnCloseNewUser){
                    btnCloseNewUser.click();
                }
            } else {
                const errorText = await response.text();
                showToast("❌ Error",'danger');
            }
        } catch (error) {
            console.error("Error en la petición:", error);
            showToast("No se pudo conectar con el servidor.",'warning');
        }
    });

    // -------------------- CREAR NUEVO PRODUCTO --------------------------- //

    btnNewProduct.addEventListener('click', async () => {

        openModalNewProduct();

    })

    if (btnCloseNewProduct) {
        btnCloseNewProduct.addEventListener('click', () => {
            // 1. Limpiamos todos los inputs
            document.getElementById('Name-New-Product').value = '';
            document.getElementById('IVA-New-Product').value = '';
            // 2. Ponemos la Unidad Medida en value 1 (LITROS)
            // Usamos el selector
            if (selectUnit) {
                selectUnit.value = "1";
            }

            // 3. Cerrar modal

            document.getElementById('modal-NewProduct').style.display = "none";
        });
    }

    function openModalNewProduct() {

        if(loadingSpinner) {
            loadingSpinner.classList.remove('d-none');
        }
        try{
            const modalNewProduct = document.getElementById("modal-NewProduct");

            document.getElementById('IVA-New-Product').value = '21';

            modalNewProduct.style.display = 'flex';
        } finally {
            if (loadingSpinner) {
                loadingSpinner.classList.add('d-none');
            }
        }


    }

    document.getElementById('btnConfirmarNewProduct').addEventListener('click', async () => {

        if(loadingSpinner) {
            loadingSpinner.classList.remove('d-none');
        }

        const unidadMedidaTexto = selectUnit.options[selectUnit.selectedIndex].text;

        // Capturar valores
        const nombreProducto = document.getElementById('Name-New-Product').value.trim();
        const ivaProducto = document.getElementById('IVA-New-Product').value.trim();

        // Validaciones básicas
        if (nombreProducto === "") {
            alert("⚠️ El nombre del producto es obligatorio");
            return;
        }

        if (ivaProducto === "") {
            alert("⚠️ El IVA es obligatorio");
            return;
        }

        const ivaNumerico = parseInt(ivaProducto);
        if (isNaN(ivaNumerico) || ivaNumerico < 0) {
            alert("⚠️ El IVA debe ser un número válido mayor o igual a 0");
            return;
        }

        const payload = {
            Nombre: nombreProducto,
            Iva: ivaNumerico,
            UnidadMedida: unidadMedidaTexto
        };

        console.log('Payload del producto:', JSON.stringify(payload, null, 2));

        try {
            const response = await fetch(`${API_BASE_URL}/api/SIE/Crear-producto`, {
                method: 'POST',
                headers: {'Content-Type': 'application/json'},
                body: JSON.stringify(payload)
            });

            if (response.ok) {
                const resText = await response.text();
                showToast("✅ Producto creado",'success');

                // Cerrar modal y limpiar formulario
                document.getElementById('modal-NewProduct').style.display = 'none';
                if (btnCloseNewProduct) {
                    btnCloseNewProduct.click();
                }
            } else {
                const errorText = await response.text();
                showToast("❌ Error",'danger');
            }
        } catch (error) {
            console.error("Error en la petición:", error);
            showToast("No se pudo conectar con el servidor.",'warning');
        } finally {
            if (loadingSpinner) {
                loadingSpinner.classList.add('d-none');
            }
        }
    });

    // -------------------- CREAR NUEVO EDIFICIO --------------------------- //

    btnNewEdificio.addEventListener('click', async () => {
        openModalNewEdificio();
    });

    if (btnCloseNewEdificio) {
        btnCloseNewEdificio.addEventListener('click', () => {
            // Limpiar todos los inputs
            document.getElementById('Name-New-Edificio').value = '';
            document.getElementById('Street-New-Edificio').value = '';
            document.getElementById('Number-New-Edificio').value = '';

            // Cerrar modal
            document.getElementById('modal-NewEdificio').style.display = "none";
        });
    }

    function openModalNewEdificio() {
        if(loadingSpinner) {
            loadingSpinner.classList.remove('d-none');
        }
        try {
            const modalNewEdificio = document.getElementById("modal-NewEdificio");
            modalNewEdificio.style.display = 'flex';
        } finally {
            if (loadingSpinner) {
                loadingSpinner.classList.add('d-none');
            }
        }
    }

    document.getElementById('btnConfirmarNewEdificio').addEventListener('click', async () => {
        if(loadingSpinner) {
            loadingSpinner.classList.remove('d-none');
        }

        // Capturar valores
        const nombreEdificio = document.getElementById('Name-New-Edificio').value.trim();
        const calleEdificio = document.getElementById('Street-New-Edificio').value.trim();
        const numeroEdificio = document.getElementById('Number-New-Edificio').value.trim();

        // Validaciones básicas
        if (nombreEdificio === "") {
            alert("⚠️ El nombre del edificio es obligatorio");
            return;
        }

        if (calleEdificio === "") {
            alert("⚠️ La calle es obligatoria");
            return;
        }

        if (numeroEdificio === "") {
            alert("⚠️ La numeración es obligatoria");
            return;
        }

        const payload = {
            Nombre: nombreEdificio,
            Calle: calleEdificio,
            Numeracion: numeroEdificio
        };

        console.log('Payload del edificio:', JSON.stringify(payload, null, 2));

        try {
            const response = await fetch(`${API_BASE_URL}/api/SIE/Crear-edificio`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });

            if (response.ok) {
                const resText = await response.text();
                showToast("✅ Edificio Creado",'success');

                // Cerrar modal y limpiar formulario
                document.getElementById('modal-NewEdificio').style.display = 'none';
                if(btnCloseNewEdificio) {
                    btnCloseNewEdificio.click();
                }
            } else {
                const errorText = await response.text();
                showToast("❌ Error",'danger');
            }
        } catch (error) {
            console.error("Error en la petición:", error);
            showToast("No se pudo conectar con el servidor.",'warning');
        }finally {
            if (loadingSpinner) {
                loadingSpinner.classList.add('d-none');
            }
        }

    });

});