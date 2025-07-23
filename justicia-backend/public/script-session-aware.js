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
        // Verificar si ya hay una sesión activa antes de mostrar el modal
        const token = sessionStorage.getItem('token');
        const currentUser = sessionStorage.getItem('currentUser');
        
        if (token && currentUser) {
            // Ya hay sesión activa, mostrar mensaje de bienvenida
            try {
                const user = JSON.parse(currentUser);
                showWelcomeBack(user);
            } catch (e) {
                // Si hay error parseando el usuario, mostrar login
                showLoginModal();
            }
        } else {
            // No hay sesión, mostrar modal de login
            showLoginModal();
        }
    };
    
    // Función para mostrar el modal de login
    const showLoginModal = () => {
        if (currentPage.includes('index.html') || currentPage === '/') {
            const loginModal = document.getElementById('login-modal');
            if (loginModal) {
                loginModal.classList.add('show');
                document.body.style.overflow = 'hidden';
            }
        }
    };
    
    // Función para mostrar mensaje de bienvenida cuando ya hay sesión
    const showWelcomeBack = (user) => {
        const existingWelcome = document.querySelector('.welcome-back');
        if (existingWelcome) existingWelcome.remove();
        
        const welcomeDiv = document.createElement('div');
        welcomeDiv.className = 'welcome-back alert alert-info mt-3';
        welcomeDiv.innerHTML = `
            <h4>¡Bienvenido de vuelta, ${user.nombre}!</h4>
            <p>Tu sesión sigue activa como <strong>${translateRole(user.rol)}</strong></p>
            <div class="mt-3">
                <button class="btn btn-primary me-2" onclick="goToProcedimientos()">
                    <i class="fas fa-gavel me-1"></i>Ir a Procedimientos
                </button>
                ${user.rol === 'admin' ? `
                <button class="btn btn-secondary me-2" onclick="goToUsuarios()">
                    <i class="fas fa-users me-1"></i>Gestión de Usuarios
                </button>
                ` : ''}
                <button class="btn btn-outline-danger" onclick="manualLogout()">
                    <i class="fas fa-sign-out-alt me-1"></i>Cerrar Sesión
                </button>
            </div>
        `;
        
        // Insertar en el contenido principal
        const heroSection = document.querySelector('.hero');
        if (heroSection) {
            heroSection.parentNode.insertBefore(welcomeDiv, heroSection.nextSibling);
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
                    
                    // Cerrar modal antes de mostrar éxito
                    const loginModal = document.getElementById('login-modal');
                    if (loginModal) {
                        loginModal.classList.remove('show');
                        document.body.style.overflow = '';
                        // console.log('🔍 [SCRIPT.JS] Modal cerrado');
                    }
                    
                    // NO redirigir automáticamente - quedarse en index.html
                    // console.log('🔍 [SCRIPT.JS] Login exitoso - quedándose en index.html');
                    // redirectByRole(data.user.rol); // COMENTADO: No redirigir automáticamente
                    
                    // Mostrar mensaje de éxito y opciones de navegación
                    showLoginSuccess(data.user);
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
    
    // 🎯 Redirección según rol (ahora manual)
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
    
    // ✅ Mostrar éxito del login
    const showLoginSuccess = (user) => {
        const existingSuccess = document.querySelector('.login-success');
        if (existingSuccess) existingSuccess.remove();
        
        const successDiv = document.createElement('div');
        successDiv.className = 'login-success alert alert-success mt-3';
        successDiv.innerHTML = `
            <h4>¡Bienvenido, ${user.nombre}!</h4>
            <p>Has iniciado sesión exitosamente como <strong>${translateRole(user.rol)}</strong></p>
            <div class="mt-3">
                <button class="btn btn-primary me-2" onclick="goToProcedimientos()">
                    <i class="fas fa-gavel me-1"></i>Ir a Procedimientos
                </button>
                ${user.rol === 'admin' ? `
                <button class="btn btn-secondary me-2" onclick="goToUsuarios()">
                    <i class="fas fa-users me-1"></i>Gestión de Usuarios
                </button>
                ` : ''}
                <button class="btn btn-outline-secondary" onclick="stayOnIndex()">
                    <i class="fas fa-home me-1"></i>Quedarse aquí
                </button>
            </div>
        `;
        
        // Insertar después del formulario de login
        const loginForm = document.getElementById('login-form');
        loginForm.parentNode.appendChild(successDiv);
    };
    
    // Funciones de navegación
    window.goToProcedimientos = () => {
        window.location.href = 'procedimientos.html';
    };
    
    window.goToUsuarios = () => {
        window.location.href = 'usuarios.html';
    };
    
    window.stayOnIndex = () => {
        const successDiv = document.querySelector('.login-success');
        if (successDiv) successDiv.remove();
        const welcomeDiv = document.querySelector('.welcome-back');
        if (welcomeDiv) welcomeDiv.remove();
    };
    
    // Función para cerrar sesión manualmente
    window.manualLogout = () => {
        if (confirm('¿Estás seguro de que quieres cerrar sesión?')) {
            sessionStorage.clear();
            location.reload(); // Recargar la página para mostrar el modal de login
        }
    };
    
    // Traducir roles
    const translateRole = (role) => {
        const roles = {
            'admin': 'Administrador',
            'abogado': 'Abogado',
            'usuario': 'Usuario'
        };
        return roles[role] || role;
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