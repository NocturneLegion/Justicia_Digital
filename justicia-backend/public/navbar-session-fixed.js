// 🔒 GESTOR DE NAVBAR - ACTUALIZAR BOTÓN DE SESIÓN
(function() {
    'use strict';
    
    // Función para actualizar el botón de sesión en el navbar
    const updateSessionButton = () => {
        const token = sessionStorage.getItem('token');
        const currentUser = sessionStorage.getItem('currentUser');
        
        // Buscar el botón de login en diferentes posibles selectores
        let loginBtn = document.getElementById('login-btn');
        
        // Si no se encuentra por ID, buscar por otros criterios específicos de cada página
        if (!loginBtn) {
            // En actividades.html, buscar el botón específico que dice "Iniciar Sesión"
            const buttons = document.querySelectorAll('a.btn');
            for (let btn of buttons) {
                if (btn.textContent.trim() === 'Iniciar Sesión' || 
                    btn.textContent.trim() === 'Cerrar sesión' ||
                    btn.getAttribute('data-bs-target') === '#loginModal') {
                    loginBtn = btn;
                    break;
                }
            }
        }
        
        // Si aún no se encuentra, buscar por clase btn-secondary
        if (!loginBtn) {
            loginBtn = document.querySelector('.btn-secondary');
        }
        
        if (!loginBtn) return;
        
        if (token && currentUser) {
            // Hay sesión activa - cambiar a "Cerrar sesión"
            try {
                const user = JSON.parse(currentUser);
                loginBtn.textContent = 'Cerrar sesión';
                loginBtn.className = 'btn btn-logout-custom';
                
                // Remover atributos de modal si existen
                loginBtn.removeAttribute('data-bs-toggle');
                loginBtn.removeAttribute('data-bs-target');
                
                // Cambiar el comportamiento del click
                loginBtn.onclick = (e) => {
                    e.preventDefault();
                    if (confirm('¿Estás seguro de que quieres cerrar sesión?')) {
                        sessionStorage.clear();
                        window.location.href = 'index.html';
                    }
                };
                
            } catch (e) {
                // Error parseando usuario, mantener como login
                resetToLoginButton(loginBtn);
            }
        } else {
            // No hay sesión - mantener como "Iniciar sesión"
            resetToLoginButton(loginBtn);
        }
    };
    
    // Función para resetear el botón a "Iniciar sesión"
    const resetToLoginButton = (loginBtn) => {
        loginBtn.textContent = 'Iniciar sesión';
        loginBtn.className = 'btn btn-secondary';
        loginBtn.onclick = null; // Remover el onclick personalizado
        
        // Restaurar comportamiento original según la página
        const currentPage = window.location.pathname;
        const isIndexPage = currentPage.includes('index.html') || currentPage === '/' || currentPage.endsWith('/');
        const isActivitiesPage = currentPage.includes('actividades.html');
        
        if (isIndexPage) {
            loginBtn.onclick = (e) => {
                e.preventDefault();
                const loginModal = document.getElementById('login-modal');
                if (loginModal) {
                    loginModal.classList.add('show');
                    document.body.style.overflow = 'hidden';
                }
            };
        } else if (isActivitiesPage) {
            // En actividades.html, restaurar el comportamiento del modal
            loginBtn.setAttribute('data-bs-toggle', 'modal');
            loginBtn.setAttribute('data-bs-target', '#loginModal');
            loginBtn.className = 'btn btn-primary';
            loginBtn.textContent = 'Iniciar Sesión';
        } else {
            // En otras páginas, redirigir a index
            loginBtn.onclick = (e) => {
                e.preventDefault();
                window.location.href = 'index.html';
            };
        }
    };
    
    // Actualizar el botón cuando se carga la página
    document.addEventListener('DOMContentLoaded', () => {
        // Esperar un poco para que se carguen todos los elementos
        setTimeout(updateSessionButton, 100);
    });
    
    // Actualizar el botón cuando cambia el sessionStorage
    const originalSetItem = sessionStorage.setItem;
    const originalRemoveItem = sessionStorage.removeItem;
    const originalClear = sessionStorage.clear;
    
    sessionStorage.setItem = function(key, value) {
        originalSetItem.apply(this, arguments);
        if (key === 'token' || key === 'currentUser') {
            setTimeout(updateSessionButton, 10);
        }
    };
    
    sessionStorage.removeItem = function(key) {
        originalRemoveItem.apply(this, arguments);
        if (key === 'token' || key === 'currentUser') {
            setTimeout(updateSessionButton, 10);
        }
    };
    
    sessionStorage.clear = function() {
        originalClear.apply(this, arguments);
        setTimeout(updateSessionButton, 10);
    };
    
    // Exponer función globalmente por si se necesita
    window.updateSessionButton = updateSessionButton;
    
})();