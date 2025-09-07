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





})