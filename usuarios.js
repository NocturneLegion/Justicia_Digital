// Script para la página de Gestión de Usuarios

document.addEventListener('DOMContentLoaded', function() {
    // Referencias a elementos del DOM
    const userTableBody = document.getElementById('user-table-body');
    const addUserBtn = document.getElementById('add-user-btn');
    const userModal = document.getElementById('user-modal');
    const userForm = document.getElementById('user-form');
    const userModalTitle = document.getElementById('user-modal-title');
    const confirmModal = document.getElementById('confirm-modal');
    const confirmOkBtn = document.getElementById('confirm-ok');
    const confirmCancelBtn = document.getElementById('confirm-cancel');
    const searchInput = document.getElementById('search-user');
    const searchBtn = document.getElementById('search-btn');
    const prevPageBtn = document.getElementById('prev-page');
    const nextPageBtn = document.getElementById('next-page');
    const pageInfo = document.getElementById('page-info');
    
    // Variables para la paginación
    let currentPage = 1;
    const usersPerPage = 5;
    let filteredUsers = [];
    
    // Inicializar datos de usuarios de ejemplo si no existen
    const initializeUsers = () => {
        if (!localStorage.getItem('users')) {
            const defaultUsers = [
                { id: 1, name: 'Administrador', username: 'admin', email: 'admin@justicia.digital', password: 'admin123', role: 'admin', status: 'active' },
                { id: 2, name: 'Juan Pérez', username: 'jperez', email: 'juan@ejemplo.com', password: 'password123', role: 'editor', status: 'active' },
                { id: 3, name: 'María López', username: 'mlopez', email: 'maria@ejemplo.com', password: 'password123', role: 'user', status: 'active' },
                { id: 4, name: 'Carlos Rodríguez', username: 'crodriguez', email: 'carlos@ejemplo.com', password: 'password123', role: 'user', status: 'inactive' },
                { id: 5, name: 'Ana Martínez', username: 'amartinez', email: 'ana@ejemplo.com', password: 'password123', role: 'editor', status: 'active' },
                { id: 6, name: 'Roberto Sánchez', username: 'rsanchez', email: 'roberto@ejemplo.com', password: 'password123', role: 'user', status: 'active' }
            ];
            localStorage.setItem('users', JSON.stringify(defaultUsers));
        }
    };
    
    // Obtener usuarios del localStorage
    const getUsers = () => {
        return JSON.parse(localStorage.getItem('users') || '[]');
    };
    
    // Guardar usuarios en localStorage
    const saveUsers = (users) => {
        localStorage.setItem('users', JSON.stringify(users));
    };
    
    // Renderizar la tabla de usuarios con paginación
    const renderUserTable = () => {
        const users = filteredUsers.length > 0 ? filteredUsers : getUsers();
        const totalPages = Math.ceil(users.length / usersPerPage);
        
        // Actualizar información de paginación
        pageInfo.textContent = `Página ${currentPage} de ${totalPages || 1}`;
        
        // Habilitar/deshabilitar botones de paginación
        prevPageBtn.disabled = currentPage === 1;
        nextPageBtn.disabled = currentPage === totalPages || totalPages === 0;
        
        // Calcular índices para la paginación
        const startIndex = (currentPage - 1) * usersPerPage;
        const endIndex = startIndex + usersPerPage;
        const paginatedUsers = users.slice(startIndex, endIndex);
        
        // Limpiar tabla
        userTableBody.innerHTML = '';
        
        // Renderizar usuarios
        if (paginatedUsers.length === 0) {
            const emptyRow = document.createElement('tr');
            emptyRow.innerHTML = `<td colspan="7" style="text-align: center;">No se encontraron usuarios</td>`;
            userTableBody.appendChild(emptyRow);
        } else {
            paginatedUsers.forEach(user => {
                const row = document.createElement('tr');
                row.innerHTML = `
                    <td>${user.id}</td>
                    <td>${user.name}</td>
                    <td>${user.username}</td>
                    <td>${user.email}</td>
                    <td>${translateRole(user.role)}</td>
                    <td><span class="status-${user.status}">${user.status === 'active' ? 'Activo' : 'Inactivo'}</span></td>
                    <td>
                        <div class="action-buttons">
                            <button class="btn-icon btn-edit" data-id="${user.id}" title="Editar"><i class="fas fa-edit"></i></button>
                            <button class="btn-icon btn-delete" data-id="${user.id}" title="Eliminar"><i class="fas fa-trash"></i></button>
                        </div>
                    </td>
                `;
                userTableBody.appendChild(row);
            });
        }
        
        // Agregar event listeners a los botones de acción
        addActionButtonListeners();
    };
    
    // Traducir roles para mostrar en la tabla
    const translateRole = (role) => {
        const roles = {
            'admin': 'Administrador',
            'editor': 'Editor',
            'user': 'Usuario'
        };
        return roles[role] || role;
    };
    
    // Agregar event listeners a los botones de acción en la tabla
    const addActionButtonListeners = () => {
        // Botones de editar
        document.querySelectorAll('.btn-edit').forEach(button => {
            button.addEventListener('click', () => {
                const userId = parseInt(button.getAttribute('data-id'));
                editUser(userId);
            });
        });
        
        // Botones de eliminar
        document.querySelectorAll('.btn-delete').forEach(button => {
            button.addEventListener('click', () => {
                const userId = parseInt(button.getAttribute('data-id'));
                showDeleteConfirmation(userId);
            });
        });
    };
    
    // Mostrar modal para agregar un nuevo usuario
    const showAddUserModal = () => {
        userModalTitle.textContent = 'Agregar Usuario';
        userForm.reset();
        document.getElementById('password-hint').style.display = 'none';
        document.getElementById('user-password').required = true;
        
        // Generar nuevo ID
        const users = getUsers();
        const newId = users.length > 0 ? Math.max(...users.map(user => user.id)) + 1 : 1;
        document.getElementById('user-id').value = newId;
        
        // Mostrar modal
        userModal.classList.add('show');
        document.body.style.overflow = 'hidden';
    };
    
    // Mostrar modal para editar un usuario existente
    const editUser = (userId) => {
        const users = getUsers();
        const user = users.find(u => u.id === userId);
        
        if (user) {
            userModalTitle.textContent = 'Editar Usuario';
            
            // Llenar formulario con datos del usuario
            document.getElementById('user-id').value = user.id;
            document.getElementById('user-name').value = user.name;
            document.getElementById('user-username').value = user.username;
            document.getElementById('user-email').value = user.email;
            document.getElementById('user-password').value = '';
            document.getElementById('user-role').value = user.role;
            document.getElementById('user-status').value = user.status;
            
            // Mostrar hint de contraseña y hacer el campo opcional
            document.getElementById('password-hint').style.display = 'block';
            document.getElementById('user-password').required = false;
            
            // Mostrar modal
            userModal.classList.add('show');
            document.body.style.overflow = 'hidden';
        }
    };
    
    // Mostrar confirmación para eliminar usuario
    const showDeleteConfirmation = (userId) => {
        const users = getUsers();
        const user = users.find(u => u.id === userId);
        
        if (user) {
            document.getElementById('confirm-message').textContent = `¿Está seguro que desea eliminar al usuario ${user.name}?`;
            
            // Guardar ID del usuario a eliminar en el botón de confirmación
            confirmOkBtn.setAttribute('data-id', userId);
            
            // Mostrar modal de confirmación
            confirmModal.classList.add('show');
            document.body.style.overflow = 'hidden';
        }
    };
    
    // Eliminar usuario
    const deleteUser = (userId) => {
        let users = getUsers();
        users = users.filter(user => user.id !== userId);
        saveUsers(users);
        
        // Actualizar filteredUsers si hay una búsqueda activa
        if (filteredUsers.length > 0) {
            filteredUsers = filteredUsers.filter(user => user.id !== userId);
            
            // Ajustar página actual si es necesario
            const totalPages = Math.ceil(filteredUsers.length / usersPerPage);
            if (currentPage > totalPages && totalPages > 0) {
                currentPage = totalPages;
            }
        }
        
        // Actualizar tabla
        renderUserTable();
    };
    
    // Buscar usuarios
    const searchUsers = (query) => {
        if (!query.trim()) {
            filteredUsers = [];
            currentPage = 1;
            renderUserTable();
            return;
        }
        
        const users = getUsers();
        const searchTerm = query.toLowerCase();
        
        filteredUsers = users.filter(user => 
            user.name.toLowerCase().includes(searchTerm) ||
            user.username.toLowerCase().includes(searchTerm) ||
            user.email.toLowerCase().includes(searchTerm) ||
            translateRole(user.role).toLowerCase().includes(searchTerm)
        );
        
        currentPage = 1;
        renderUserTable();
    };
    
    // Event Listeners
    
    // Botón para agregar usuario
    addUserBtn.addEventListener('click', showAddUserModal);
    
    // Cerrar modales al hacer clic en X
    document.querySelectorAll('.close-modal').forEach(closeBtn => {
        closeBtn.addEventListener('click', function() {
            const modal = this.closest('.modal');
            modal.classList.remove('show');
            document.body.style.overflow = '';
        });
    });
    
    // Cerrar modales al hacer clic fuera del contenido
    document.querySelectorAll('.modal').forEach(modal => {
        modal.addEventListener('click', function(e) {
            if (e.target === this) {
                this.classList.remove('show');
                document.body.style.overflow = '';
            }
        });
    });
    
    // Formulario de usuario
    userForm.addEventListener('submit', function(e) {
        e.preventDefault();
        
        const userId = parseInt(document.getElementById('user-id').value);
        const name = document.getElementById('user-name').value.trim();
        const username = document.getElementById('user-username').value.trim();
        const email = document.getElementById('user-email').value.trim();
        const password = document.getElementById('user-password').value.trim();
        const role = document.getElementById('user-role').value;
        const status = document.getElementById('user-status').value;
        
        // Validar campos
        if (!name || !username || !email || !role || !status) {
            alert('Por favor, complete todos los campos obligatorios');
            return;
        }
        
        // Obtener usuarios actuales
        let users = getUsers();
        const isEditing = users.some(user => user.id === userId);
        
        if (isEditing) {
            // Actualizar usuario existente
            users = users.map(user => {
                if (user.id === userId) {
                    return {
                        ...user,
                        name,
                        username,
                        email,
                        password: password || user.password, // Mantener contraseña anterior si no se proporciona una nueva
                        role,
                        status
                    };
                }
                return user;
            });
        } else {
            // Agregar nuevo usuario
            if (!password) {
                alert('La contraseña es obligatoria para nuevos usuarios');
                return;
            }
            
            users.push({
                id: userId,
                name,
                username,
                email,
                password,
                role,
                status
            });
        }
        
        // Guardar cambios
        saveUsers(users);
        
        // Actualizar filteredUsers si hay una búsqueda activa
        if (filteredUsers.length > 0) {
            const searchTerm = searchInput.value.toLowerCase();
            filteredUsers = users.filter(user => 
                user.name.toLowerCase().includes(searchTerm) ||
                user.username.toLowerCase().includes(searchTerm) ||
                user.email.toLowerCase().includes(searchTerm) ||
                translateRole(user.role).toLowerCase().includes(searchTerm)
            );
        }
        
        // Cerrar modal y actualizar tabla
        userModal.classList.remove('show');
        document.body.style.overflow = '';
        renderUserTable();
    });
    
    // Botones de confirmación para eliminar
    confirmOkBtn.addEventListener('click', function() {
        const userId = parseInt(this.getAttribute('data-id'));
        deleteUser(userId);
        
        // Cerrar modal
        confirmModal.classList.remove('show');
        document.body.style.overflow = '';
    });
    
    confirmCancelBtn.addEventListener('click', function() {
        confirmModal.classList.remove('show');
        document.body.style.overflow = '';
    });
    
    // Búsqueda de usuarios
    searchBtn.addEventListener('click', function() {
        searchUsers(searchInput.value);
    });
    
    searchInput.addEventListener('keyup', function(e) {
        if (e.key === 'Enter') {
            searchUsers(this.value);
        }
    });
    
    // Paginación
    prevPageBtn.addEventListener('click', function() {
        if (currentPage > 1) {
            currentPage--;
            renderUserTable();
        }
    });
    
    nextPageBtn.addEventListener('click', function() {
        const users = filteredUsers.length > 0 ? filteredUsers : getUsers();
        const totalPages = Math.ceil(users.length / usersPerPage);
        
        if (currentPage < totalPages) {
            currentPage++;
            renderUserTable();
        }
    });
    
    // Inicializar la página
    initializeUsers();
    renderUserTable();
    
    // Integrar con el script principal
    if (typeof setupMobileMenu === 'function') {
        setupMobileMenu();
    }
    
    if (typeof setupLoginModal === 'function') {
        setupLoginModal();
    }
    
    if (typeof checkLoginStatus === 'function') {
        checkLoginStatus();
    }
});