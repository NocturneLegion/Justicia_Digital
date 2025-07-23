// 🔒 GESTOR DE SESIÓN INTELIGENTE - COMPLETAMENTE DESHABILITADO
(function() {
    'use strict';
    
    // console.log('🔍 [SESSION-MANAGER] DESHABILITADO - Las sesiones nunca se cerrarán automáticamente');
    
    // COMENTADO: Marcar que la aplicación está activa
    const markAppActive = () => {
        sessionStorage.setItem('appActive', 'true');
        sessionStorage.setItem('lastActivity', Date.now().toString());
    };
    
    // COMENTADO: Verificar si la aplicación sigue activa
    const isAppActive = () => {
        return sessionStorage.getItem('appActive') === 'true';
    };
    
    // COMENTADO: Limpiar marcadores de actividad
    const clearActivityMarkers = () => {
        // sessionStorage.removeItem('appActive');
        // sessionStorage.removeItem('lastActivity');
    };
    
    // COMENTADO: Limpiar sesión completa
    const clearSession = () => {
        // console.log('🔍 [SESSION-MANAGER] COMENTADO - No se limpiará la sesión');
        // sessionStorage.clear();
    };
    
    // Marcar actividad al cargar cualquier página (sin efectos de cierre)
    markAppActive();
    
    // COMENTADO: Actualizar actividad en eventos de usuario
    ['mousemove', 'keypress', 'click', 'scroll'].forEach(event => {
        window.addEventListener(event, markAppActive);
    });
    
    // COMENTADO: Manejar cierre de pestaña/navegador
    /*
    window.addEventListener('beforeunload', (e) => {
        console.log('🔍 [SESSION-MANAGER] beforeunload detectado');
        
        // Dar un pequeño delay para permitir navegación interna
        setTimeout(() => {
            // Si después de 100ms la app no está marcada como activa,
            // significa que realmente se está cerrando
            if (!isAppActive()) {
                console.log('🔍 [SESSION-MANAGER] Navegador cerrándose, limpiando sesión...');
                clearSession();
            }
        }, 100);
        
        // Temporalmente marcar como inactiva
        clearActivityMarkers();
    });
    */
    
    // Marcar como activa cuando se carga una nueva página
    window.addEventListener('load', () => {
        // console.log('🔍 [SESSION-MANAGER] Página cargada, marcando como activa...');
        markAppActive();
    });
    
    // COMENTADO: Verificar inactividad cada minuto
    /*
    setInterval(() => {
        const lastActivity = parseInt(sessionStorage.getItem('lastActivity') || '0');
        const now = Date.now();
        const inactiveTime = now - lastActivity;
        
        // Si han pasado más de 2 horas sin actividad
        if (inactiveTime > 2 * 60 * 60 * 1000) {
            console.log('🔍 [SESSION-MANAGER] Sesión expirada por inactividad');
            clearSession();
            window.location.href = 'index.html';
        }
    }, 60000); // Verificar cada minuto
    */
    
    // Exponer funciones globalmente si es necesario
    window.sessionManager = {
        clearSession,
        markAppActive,
        isAppActive
    };
    
})();