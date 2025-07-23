// 🔒 SISTEMA JUDICIAL - AUTENTICACIÓN OBLIGATORIA
document.addEventListener('DOMContentLoaded', function() {
    // console.log('🔍 [SCRIPT.JS] Iniciando script principal...');
    
    // 🔐 VERIFICAR SI ESTAMOS EN LA PÁGINA PRINCIPAL
    const currentPage = window.location.pathname;
    const isIndexPage = currentPage.includes('index.html') || currentPage === '/' || currentPage.endsWith('/');
    
    // console.log('🔍 [SCRIPT.JS] Página actual:', currentPage);
    // console.log('🔍 [SCRIPT.JS] Es página index:', isIndexPage);
    
    // Solo aplicar lógica de autenticación en index.html
    if (!isIndexPage) {
        // console.log('🔍 [SCRIPT.JS] No es página index, saliendo...');
        return;
    }
    
    // console.log('🔍 [SCRIPT.JS] Aplicando lógica de autenticación en index...');
    
    // 🎯 Configuración para sistema judicial
    const setupJudicialAuth = () => {
        // Forzar login modal en index.html
        if (currentPage.includes('index.html') || currentPage === '/') {
            const loginModal = document.getElementById('login-modal');
            if (loginModal) {
                loginModal.classList.add('show');
                document.body.style.overflow = 'hidden';
            }
        }
    };
    
    // 🔐 Configuración del login
    const setupLogin = () => {
        const loginForm = document.getElementById('login-form');
        if (!loginForm) return;
        
        loginForm.addEventListener('submit', async function(e) {
            e.preventDefault();
            
            const username = document.getElementById('username').value.trim();
            const password = document.getElementById('password').value.trim();
            
            if (!username || !password) {
                showLoginError('Todos los campos son obligatorios');
                return;
            }
            
            try {
                // console.log('🔍 [SCRIPT.JS] Enviando credenciales al servidor...');
                const response = await fetch('http://localhost:5000/api/auth/login', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ username, password })
                });
                
                // console.log('🔍 [SCRIPT.JS] Respuesta del servidor:', response.status, response.statusText);
                const data = await response.json();
                // console.log('🔍 [SCRIPT.JS] Datos recibidos:', data);
                
                if (response.ok) {
                    // console.log('✅ [SCRIPT.JS] Login exitoso, guardando sesión...');
                    // Guardar sesión temporal (solo para esta sesión de navegador)
                    sessionStorage.setItem('token', data.token);
                    sessionStorage.setItem('currentUser', JSON.stringify(data.user));
                    
                    // console.log('🔍 [SCRIPT.JS] Token guardado:', data.token.substring(0, 20) + '...');
                    // console.log('🔍 [SCRIPT.JS] Usuario guardado:', data.user);
                    
                    // Cerrar modal antes de redirigir
                    const loginModal = document.getElementById('login-modal');
                    if (loginModal) {
                        loginModal.classList.remove('show');
                        document.body.style.overflow = '';
                        // console.log('🔍 [SCRIPT.JS] Modal cerrado');
                    }
                    
                    // Redirigir según rol inmediatamente
                    // console.log('🔍 [SCRIPT.JS] Redirigiendo según rol:', data.user.rol);
                    redirectByRole(data.user.rol);
                } else {
                    // console.log('🚨 [SCRIPT.JS] Error en login:', data.error);
                    showLoginError(data.error || 'Credenciales inválidas');
                }
            } catch (error) {
                // console.error('🚨 [SCRIPT.JS] Error de conexión:', error);
                showLoginError('Error de conexión con el servidor');
            }
        });
    };
    
    // 🎯 Redirección según rol
    const redirectByRole = (rol) => {
        // console.log('🔍 [SCRIPT.JS] Ejecutando redirectByRole con rol:', rol);
        switch(rol) {
            case 'admin':
            case 'abogado':
                // console.log('🔍 [SCRIPT.JS] Redirigiendo a procedimientos.html...');
                window.location.href = 'procedimientos.html';
                break;
            case 'usuario':
                // console.log('🔍 [SCRIPT.JS] Redirigiendo a actividades.html...');
                window.location.href = 'actividades.html';
                break;
            default:
                // console.log('🔍 [SCRIPT.JS] Rol no reconocido, redirigiendo a index.html...');
                window.location.href = 'index.html';
        }
    };
    
    // ❌ Mostrar errores
    const showLoginError = (message) => {
        const existingError = document.querySelector('.login-error');
        if (existingError) existingError.remove();
        
        const errorDiv = document.createElement('div');
        errorDiv.className = 'login-error text-danger mt-2';
        errorDiv.textContent = message;
        
        const loginForm = document.getElementById('login-form');
        loginForm.appendChild(errorDiv);
        
        setTimeout(() => errorDiv.remove(), 5000);
    };
    
    // 🔄 Configurar cierre automático
    const setupAutoLogout = () => {
        // console.log('🔍 [SCRIPT.JS] Auto logout DESHABILITADO - sesiones nunca se cierran');
        // COMENTADO: El manejo de sesión ahora se hace en session-manager.js
        // COMENTADO: No necesitamos configurar nada aquí
        // COMENTADO: Las sesiones nunca se cerrarán automáticamente
    };
    
    // 🚀 Inicializar
    setupLogin();
    setupAutoLogout();
    
    if (window.location.pathname.includes('index.html') || window.location.pathname === '/') {
        setupJudicialAuth();
    }
});