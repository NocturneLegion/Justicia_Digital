// Script para la página Justicia Digital

document.addEventListener('DOMContentLoaded', function() {
    // Función para manejar el menú móvil
    const setupMobileMenu = () => {
        const navLinks = document.querySelector('.nav-links');
        const mobileMenuBtn = document.createElement('button');
        mobileMenuBtn.classList.add('mobile-menu-btn');
        mobileMenuBtn.innerHTML = '<span></span><span></span><span></span>';
        
        // Solo agregar el botón en pantallas móviles
        if (window.innerWidth <= 768) {
            document.querySelector('nav').prepend(mobileMenuBtn);
            
            mobileMenuBtn.addEventListener('click', function() {
                navLinks.classList.toggle('active');
                this.classList.toggle('active');
            });
        }
    };
    
    // Función para manejar el modal de inicio de sesión
    const setupLoginModal = () => {
        const loginBtn = document.getElementById('login-btn');
        const loginModal = document.getElementById('login-modal');
        const closeModal = document.querySelector('.close-modal');
        const loginForm = document.getElementById('login-form');
        
        // Mostrar el modal al hacer clic en el botón de inicio de sesión
        loginBtn.addEventListener('click', function(e) {
            e.preventDefault();
            loginModal.classList.add('show');
            document.body.style.overflow = 'hidden'; // Evitar scroll en el fondo
        });
        
        // Cerrar el modal al hacer clic en la X
        closeModal.addEventListener('click', function() {
            loginModal.classList.remove('show');
            document.body.style.overflow = ''; // Restaurar scroll
        });
        
        // Cerrar el modal al hacer clic fuera del contenido
        loginModal.addEventListener('click', function(e) {
            if (e.target === loginModal) {
                loginModal.classList.remove('show');
                document.body.style.overflow = '';
            }
        });
        
        // Manejar el envío del formulario de inicio de sesión
        loginForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            const username = document.getElementById('username').value.trim();
            const password = document.getElementById('password').value.trim();
            
            // Validar campos
            if (!username || !password) {
                showFormMessage('error', 'Por favor, complete todos los campos');
                return;
            }
            
            // Simulación de autenticación (en un caso real, esto se haría con una API)
            // Definir usuarios de prueba con sus roles
            const defaultUsers = [
                { username: 'admin', password: 'admin123', role: 'admin' },
                { username: 'usuario', password: 'user123', role: 'usuario' },
                { username: 'abogado', password: 'abogado123', role: 'abogado' }
            ];
            
            // Obtener usuarios almacenados en localStorage (creados en la página de gestión de usuarios)
            const storedUsers = JSON.parse(localStorage.getItem('users') || '[]');
            
            // Combinar usuarios predeterminados con usuarios almacenados
            const allUsers = [
                ...defaultUsers,
                ...storedUsers.map(u => ({ username: u.username, password: u.password, role: u.role }))
            ];
            
            // Buscar el usuario en nuestra lista combinada de usuarios
            const user = allUsers.find(u => u.username === username && u.password === password);
            
            if (user) {
                showFormMessage('success', 'Inicio de sesión exitoso');
                
                // Guardar información de sesión
                sessionStorage.setItem('isLoggedIn', 'true');
                sessionStorage.setItem('username', username);
                sessionStorage.setItem('userRole', user.role); // Guardar el rol del usuario
                
                // Redirigir o actualizar la interfaz después de un breve retraso
                setTimeout(() => {
                    loginModal.classList.remove('show');
                    document.body.style.overflow = '';
                    updateUIAfterLogin(username);
                }, 1500);
            } else {
                showFormMessage('error', 'Usuario o contraseña incorrectos');
            }
        });
        
        // Función para mostrar mensajes en el formulario
        function showFormMessage(type, message) {
            // Eliminar mensajes anteriores
            const existingError = loginForm.querySelector('.form-error');
            const existingSuccess = loginForm.querySelector('.form-success');
            
            if (existingError) existingError.remove();
            if (existingSuccess) existingSuccess.remove();
            
            // Crear nuevo mensaje
            const messageElement = document.createElement('div');
            messageElement.classList.add(`form-${type}`);
            messageElement.textContent = message;
            messageElement.style.display = 'block';
            
            // Insertar después del botón de envío
            const submitButton = loginForm.querySelector('button[type="submit"]').parentNode;
            submitButton.insertAdjacentElement('afterend', messageElement);
            
            // Ocultar mensaje después de un tiempo
            if (type === 'error') {
                setTimeout(() => {
                    messageElement.style.display = 'none';
                }, 3000);
            }
        }
    };
    
    // Función para actualizar la interfaz después del inicio de sesión
    const updateUIAfterLogin = (username) => {
        const loginBtn = document.getElementById('login-btn');
        loginBtn.textContent = `Hola, ${username}`;
        loginBtn.classList.remove('btn-secondary');
        loginBtn.classList.add('btn-success');
        
        // Cambiar el comportamiento del botón después del inicio de sesión
        loginBtn.addEventListener('click', function(e) {
            e.preventDefault();
            
            // Mostrar menú desplegable con opciones (perfil, cerrar sesión, etc.)
            if (confirm('¿Desea cerrar sesión?')) {
                sessionStorage.removeItem('isLoggedIn');
                sessionStorage.removeItem('username');
                window.location.reload();
            }
        }, { once: true });
    };
    
    // Verificar si el usuario ya ha iniciado sesión
    const checkLoginStatus = () => {
        const isLoggedIn = sessionStorage.getItem('isLoggedIn');
        const username = sessionStorage.getItem('username');
        
        if (isLoggedIn === 'true' && username) {
            updateUIAfterLogin(username);
        }
    };
    
    // Función para verificar acceso a páginas restringidas
    const checkPageAccess = () => {
        // Verificar si la página actual es usuarios.html
        if (window.location.pathname.includes('usuarios.html')) {
            const isLoggedIn = sessionStorage.getItem('isLoggedIn');
            const userRole = sessionStorage.getItem('userRole');
            
            // Si no ha iniciado sesión o no es administrador, redirigir a la página principal
            if (isLoggedIn !== 'true' || userRole !== 'admin') {
                // Mostrar alerta
                alert('Acceso restringido. Solo administradores pueden acceder a esta página.');
                // Redirigir a la página principal
                window.location.href = 'index.html';
            }
        }
    };
    
    // Inicializar funcionalidades
    setupMobileMenu();
    setupLoginModal();
    checkLoginStatus();
    checkPageAccess(); // Verificar acceso a la página actual
    
    // Efecto de desplazamiento suave para los enlaces
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            e.preventDefault();
            
            const targetId = this.getAttribute('href');
            if (targetId === '#') return;
            
            const targetElement = document.querySelector(targetId);
            if (targetElement) {
                targetElement.scrollIntoView({
                    behavior: 'smooth'
                });
            }
        });
    });
});