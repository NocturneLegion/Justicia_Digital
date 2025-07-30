// Configuración centralizada para la API del backend
// IMPORTANTE: Para cambiar la IP, edita el archivo ip-config.js
// Este archivo mantiene compatibilidad con el código existente

// IP actual del servidor - CAMBIA ESTA LÍNEA CUANDO SEA NECESARIO
const CURRENT_SERVER_IP = "192.168.1.6";
const SERVER_PORT = "5000";

// URL del backend construida dinámicamente
const BACKEND_URL = `http://${CURRENT_SERVER_IP}:${SERVER_PORT}`;

// Función para cambiar la IP fácilmente desde la consola del navegador
function changeServerIP(newIP) {
    console.log(`🔄 Cambiando IP del servidor de ${CURRENT_SERVER_IP} a ${newIP}`);
    window.CURRENT_SERVER_IP = newIP;
    window.BACKEND_URL = `http://${newIP}:${SERVER_PORT}`;
    console.log(`✅ Nueva URL del backend: ${window.BACKEND_URL}`);
    console.log('⚠️  Recarga la página para que los cambios surtan efecto');
}

// Hacer disponible globalmente
if (typeof window !== 'undefined') {
    window.BACKEND_URL = BACKEND_URL;
    window.changeServerIP = changeServerIP;
    window.CURRENT_SERVER_IP = CURRENT_SERVER_IP;
    window.SERVER_PORT = SERVER_PORT;
}

console.log('🌐 Configuración cargada:', {
    IP: CURRENT_SERVER_IP,
    Puerto: SERVER_PORT,
    URL_Backend: BACKEND_URL,
    Ayuda: 'Usa changeServerIP("nueva.ip.aqui") para cambiar la IP'
});
