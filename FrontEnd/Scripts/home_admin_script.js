// JavaScript para el menú desplegable
document.addEventListener('DOMContentLoaded', function() {


    const navbarToggle = document.querySelector('.navbar-toggle');
    const navbarMenu = document.querySelector('.navbar-menu');

    navbarToggle.addEventListener('click', function() {
        navbarMenu.classList.toggle('active');
    });

    // Cerrar menú al hacer clic fuera de él
    document.addEventListener('click', function(event) {
        if (!navbarToggle.contains(event.target) && !navbarMenu.contains(event.target)) {
            navbarMenu.classList.remove('active');
        }
    });

    const botonBuscar = document.getElementById('botonBuscar');
    const coordinatesDisplay = document.getElementById('coordinates-display');
    const locationMap = document.getElementById('location-map');
    const modalOverlayLocation = document.getElementById('modal-overlay-location');

    botonBuscar.addEventListener('click', () => {
        const userIdInput = document.getElementById('userIdInput').value.trim();
        // Usa el ID para construir las claves de localStorage
        const latitudKey = 'latitud_User_Active_' + userIdInput;
        const longitudKey = 'longitud_User_Active_' + userIdInput;

        console.log(userIdInput);
        console.log(latitudKey);
        console.log(longitudKey);

        const latitud = localStorage.getItem('latitudKey');
        const longitud = localStorage.getItem('longitudKey');

        console.log(longitud);
        console.log(latitud);
        if (userIdInput) {

            if (latitud && longitud) {
                const location = { lat: parseFloat(latitud), lon: parseFloat(longitud) };
                showLocationModal(location); // Tu función para mostrar el modal
            } else {
                alert(`No se encontró la ubicación para el usuario con DNI: ${userIdInput}`);
            }
        } else {
            alert("Por favor, ingrese un DNI de usuario.");
        }
    });

    function showLocationModal(location) {
        currentLocation = location;

        // Actualizar información de coordenadas
        coordinatesDisplay.textContent = `📍 Lat: ${location.lat.toFixed(6)}, Lon: ${location.lon.toFixed(6)}`;

        // Configurar mapa embebido
        const mapUrl = `https://maps.google.com/maps?q=${location.lat},${location.lon}&z=15&output=embed`;
        locationMap.src = mapUrl;

        // Mostrar modal
        modalOverlayLocation.style.display = 'flex';
    }
});