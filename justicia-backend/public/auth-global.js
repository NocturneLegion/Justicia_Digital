// 🔒 AUTENTICACIÓN GLOBAL - SISTEMA JUDICIAL - SESIONES NUNCA SE CIERRAN
// Este script se ejecuta en todas las páginas para manejar la autenticación

(function() {
    'use strict';
    
    // Cargar configuración de backend
    if (typeof BACKEND_URL === 'undefined') {
        alert('No se encontró config.js o la variable BACKEND_URL. Verifica la configuración.');
    }
    // console.log('🔍 [AUTH-GLOBAL.JS] Iniciando script de autenticación global - SESIONES NUNCA SE CIERRAN...');
    
    // Verificar si el usuario está autenticado
    const checkAuth = async () => {
        // console.log('🔍 [AUTH-GLOBAL.JS] Ejecutando checkAuth...');
        
        const token = sessionStorage.getItem('token');
        const currentPage = window.location.pathname;
        const isIndexPage = currentPage.includes('index.html') || currentPage === '/' || currentPage.endsWith('/');
        
        // console.log('🔍 [AUTH-GLOBAL.JS] Token encontrado:', !!token);
        // console.log('🔍 [AUTH-GLOBAL.JS] Página actual:', currentPage);
        // console.log('🔍 [AUTH-GLOBAL.JS] Es página index:', isIndexPage);
        
        // Si estamos en index.html, no verificar autenticación aquí
        if (isIndexPage) {
            // console.log('🔍 [AUTH-GLOBAL.JS] Es página index, no verificando autenticación aquí...');
            return;
        }
        
        // Si no hay token, redirigir a login
        if (!token) {
            // console.log('🚨 [AUTH-GLOBAL.JS] No hay token, redirigiendo a login...');
            window.location.href = 'index.html';
            return;
        }
        
        // console.log('🔍 [AUTH-GLOBAL.JS] Verificando token con el servidor...');
        
        try {
            // Verificar que el token sea válido
            const response = await fetch(`${BACKEND_URL}/api/auth/verify`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            
            // console.log('🔍 [AUTH-GLOBAL.JS] Respuesta del servidor:', response.status, response.statusText);
            
            if (!response.ok) {
                // console.log('🚨 [AUTH-GLOBAL.JS] Token inválido, COMENTADO - no se limpia sesión...');
                // sessionStorage.clear(); // COMENTADO: No limpiar sesión automáticamente
                window.location.href = 'index.html';
                return;
            }
            
            const data = await response.json();
            // console.log('✅ [AUTH-GLOBAL.JS] Usuario autenticado:', data.user);
            
            // Verificar permisos según la página
            const userRole = data.user?.rol;
            // console.log('🔍 [AUTH-GLOBAL.JS] Rol del usuario:', userRole);
            
            // Los usuarios pueden VER procedimientos, solo no pueden editarlos
            // Los usuarios con rol 'usuario' pueden acceder a procedimientos en modo lectura
            
            // console.log('✅ [AUTH-GLOBAL.JS] Autenticación y permisos verificados correctamente');
            
        } catch (error) {
            // console.error('🚨 [AUTH-GLOBAL.JS] Error verificando autenticación:', error);
            // sessionStorage.clear(); // COMENTADO: No limpiar sesión automáticamente
            window.location.href = 'index.html';
        }
    };
    
    // Función para cerrar sesión - COMENTADA
    window.logout = () => {
        // console.log('🔍 [AUTH-GLOBAL.JS] Logout COMENTADO - no se limpia sesión');
        // sessionStorage.clear(); // COMENTADO: No limpiar sesión
        window.location.href = 'index.html';
    };
    
    // Verificar autenticación cuando se carga la página
    document.addEventListener('DOMContentLoaded', checkAuth);
    
})();