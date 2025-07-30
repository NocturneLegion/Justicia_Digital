// Configuración de IP dinámica para el proyecto
// Este archivo permite cambiar fácilmente la IP del servidor

// Función para detectar automáticamente la IP local (opcional)
function detectLocalIP() {
    // En un entorno de desarrollo, puedes usar localhost
    if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
        return 'http://localhost:5000';
    }
    
    // Para producción o red local, usar la IP configurada
    return 'http://192.168.1.6:5000';
}

// Configuración principal - CAMBIA AQUÍ LA IP CUANDO SEA NECESARIO
const SERVER_CONFIG = {
    // IP actual del servidor
    CURRENT_IP: '192.168.1.6',
    PORT: '5000',
    
    // Función para obtener la URL completa del backend
    getBackendURL: function() {
        return `http://${this.CURRENT_IP}:${this.PORT}`;
    },
    
    // Función para cambiar la IP fácilmente
    setIP: function(newIP) {
        this.CURRENT_IP = newIP;
        // Actualizar BACKEND_URL global
        if (typeof window !== 'undefined') {
            window.BACKEND_URL = this.getBackendURL();
        }
    }
};

// Establecer la URL del backend globalmente
const BACKEND_URL = SERVER_CONFIG.getBackendURL();

// Hacer disponible la configuración globalmente
if (typeof window !== 'undefined') {
    window.SERVER_CONFIG = SERVER_CONFIG;
    window.BACKEND_URL = BACKEND_URL;
}

console.log('🌐 Configuración del servidor cargada:', {
    IP: SERVER_CONFIG.CURRENT_IP,
    Puerto: SERVER_CONFIG.PORT,
    URL_Backend: BACKEND_URL
});