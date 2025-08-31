import { db } from "./firebase.js";
import {
    doc,
    setDoc,
    getDoc,
    updateDoc,
    collection,
    addDoc,
    query,
    where,
    getDocs,
    serverTimestamp
} from "https://www.gstatic.com/firebasejs/11.0.1/firebase-firestore.js";

// La función para esperar x tiempo que te proporcioné antes
function esperar(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

document.addEventListener('DOMContentLoaded', async function () {

    const loadingOverlay = document.getElementById('loading-overlay');

    // Muestra el overlay de carga al inicio
    if (loadingOverlay) {
        loadingOverlay.style.display = 'flex';
    }


    let currentLocation = null;
    let userId = null;
    let userDNI = null;
    let timerInterval;
    let startTime;
    let totalSeconds = 0;

    // ===== Usuario logueado desde localStorage =====
    const saludoSpan = document.querySelector('.navbar-saludo');
    const username = localStorage.getItem('user_username');
    const password = localStorage.getItem('user_password');
    const token = localStorage.getItem('user_token');

    if (!username || !token) {
        window.location.href = "/Pages/Login_page.html";
        return;
    }

    // 🔥 Buscar usuario en Firestore por username
    try {
        const q = query(collection(db, "usuarios"), where("username", "==", username));
        const querySnapshot = await getDocs(q);

        if (!querySnapshot.empty) {
            const userDoc = querySnapshot.docs[0];
            const userData = userDoc.data();

            userId = userDoc.id; // ID en Firestore
            userDNI = userData.dni;
            saludoSpan.textContent = `Hola, ${userData.nombre} !`;
        } else {
            saludoSpan.textContent = "Hola, Usuario !";
        }
    } catch (err) {
        console.error("Error obteniendo usuario:", err);
        saludoSpan.textContent = "Hola, Usuario !";
    
    } finally {
        // Pausar la ejecución aquí por 3 segundos
        await esperar(3000);

        // 🔥 Oculta el overlay de carga después de esperar
        if (loadingOverlay) {
            loadingOverlay.style.display = 'none';
        }
    }

    // ===== Geolocalización =====
    function getCurrentLocation() {
        return new Promise((resolve, reject) => {
            if (!navigator.geolocation) {
                reject(new Error("La geolocalización no es compatible."));
                return;
            }

            navigator.geolocation.getCurrentPosition(
                (position) => {
                    resolve({
                        lat: position.coords.latitude,
                        lon: position.coords.longitude,
                        accuracy: position.coords.accuracy
                    });
                },
                (error) => reject(new Error("Error obteniendo ubicación: " + error.message)),
                { enableHighAccuracy: true, timeout: 10000, maximumAge: 60000 }
            );
        });
    }

    // ===== Mostrar mapa =====
    function showLocationModal(location) {
        currentLocation = location;
        const coordinatesDisplay = document.getElementById('coordinates-display');
        const locationMap = document.getElementById('location-map');
        const modalOverlayLocation = document.getElementById('modal-overlay-location');

        coordinatesDisplay.textContent = `📍 Lat: ${location.lat.toFixed(6)}, Lon: ${location.lon.toFixed(6)}`;
        locationMap.src = `https://maps.google.com/maps?q=${location.lat},${location.lon}&z=15&output=embed`;
        modalOverlayLocation.style.display = 'flex';
    }

    // ===== Cronómetro =====
    const startButton = document.getElementById('start-button');
    const endButton = document.getElementById('end-button');
    const timerDisplay = document.getElementById('timer');
    const modalOverlay = document.getElementById('modal-overlay');
    const modalDate = document.getElementById('modal-date');
    const modalStartTime = document.getElementById('modal-start-time');
    const modalEndTime = document.getElementById('modal-end-time');
    const modalDuration = document.getElementById('modal-duration');
    const confirmButton = document.querySelector('.confirm-button');
    const cancelButton = document.querySelector('.cancel-button');
    const closeModal = document.getElementById('close-modal');

    function formatTime(seconds) {
        const h = String(Math.floor(seconds / 3600)).padStart(2, '0');
        const m = String(Math.floor((seconds % 3600) / 60)).padStart(2, '0');
        const s = String(seconds % 60).padStart(2, '0');
        return `${h}:${m}:${s}`;
    }

    function updateTimer() {
        const elapsedTime = Math.floor((Date.now() - startTime) / 1000);
        totalSeconds = elapsedTime;
        timerDisplay.textContent = formatTime(totalSeconds);
    }

    // ===== Iniciar actividad =====
    startButton.addEventListener('click', async function () {
        if (!timerInterval) {
            try {
                startButton.textContent = "Obteniendo ubicación...";
                startButton.disabled = true;

                const location = await getCurrentLocation();
                const lat = location.lat.toFixed(6);
                const lon = location.lon.toFixed(6);

                // 🔥 Guardar ubicación en Firestore
                await updateDoc(doc(db, "usuarios", userId), {
                    estado: "Activo",
                    ultimaUbicacion: { lat, lon, timestamp: serverTimestamp() }
                });

                showLocationModal(location);

                startTime = Date.now();
                timerInterval = setInterval(updateTimer, 1000);

                startButton.textContent = "Iniciar Actividad";
                endButton.disabled = false;
            } catch (err) {
                console.error("Error:", err);
                alert("Error al obtener ubicación.");
            } finally {
                startButton.disabled = false;
            }
        }
    });

    // ===== Finalizar actividad =====
    endButton.addEventListener('click', function () {
        // Al hacer clic en "Finalizar", solo mostramos el modal.
        // El temporizador sigue corriendo en segundo plano.

        const now = new Date();
        modalDate.textContent = now.toLocaleDateString();
        modalStartTime.textContent = new Date(startTime).toLocaleTimeString().substring(0, 5);
        modalEndTime.textContent = now.toLocaleTimeString().substring(0, 5);
        modalDuration.textContent = formatTime(totalSeconds);

        modalOverlay.style.display = 'flex';
    });

    // ===== Confirmar finalización de la actividad =====
    confirmButton.addEventListener('click', async function () {
        // Ahora detenemos el temporizador SOLO si el usuario confirma.
        clearInterval(timerInterval);
        timerInterval = null;

        try {
            // 🔥 Guardar registro en Firestore
            await addDoc(collection(db, "registros"), {
                idUsuario: userId,
                dni: userDNI,
                horaIngreso: modalStartTime.textContent,
                horaSalida: modalEndTime.textContent,
                fecha: new Date().toLocaleDateString(),
                createdAt: serverTimestamp()
            });

            // 🔥 Actualizar estado del usuario
            await updateDoc(doc(db, "usuarios", userId), {
                estado: "Inactivo",
                ultimaUbicacion: null
            });

            alert("Actividad Finalizada y Registrada !");
            alert("Cerrando Sesión ...");
            window.location.href = "/Pages/Login_page.html";
        } catch (err) {
            console.error("Error guardando registro:", err);
            alert("Error guardando registro.");
        }
    });

    // ===== Cancelar finalización de la actividad =====
    cancelButton.addEventListener('click', function () {
        // Si el usuario cancela, simplemente cerramos el modal.
        // El temporizador continúa funcionando en segundo plano.
        modalOverlay.style.display = "none";
        startButton.disabled = true; // El botón de inicio debe permanecer deshabilitado.
        endButton.disabled = false; // El botón de finalización debe permanecer habilitado.
    });

    closeModal.addEventListener('click', function () {
        const modalOverlayLocation = document.getElementById('modal-overlay-location');
        modalOverlayLocation.style.display = "none";    
                
    });
});
