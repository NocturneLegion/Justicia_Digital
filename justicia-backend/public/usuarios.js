// Script para la página de Gestión de Usuarios - SESIONES NUNCA SE CIERRAN
// 🔒 VALIDACIÓN JUDICIAL - SOLO ADMIN
document.addEventListener('DOMContentLoaded', async function() {
    const token = sessionStorage.getItem('token');
    
    if (!token) {
        window.location.href = 'index.html';
        return;
    }
    
    try {
        const response = await fetch(`${BACKEND_URL}/api/auth/verify`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        
        if (!response.ok) {
            // sessionStorage.clear(); // COMENTADO: No limpiar sesión automáticamente
            window.location.href = 'index.html';
            return;
        }
        
        const data = await response.json();
        if (data.user?.rol !== 'admin') {
            alert('Acceso restringido. Solo administradores pueden acceder.');
            window.location.href = 'index.html';
            return;
        }
        
    } catch (error) {
        // sessionStorage.clear(); // COMENTADO: No limpiar sesión automáticamente
        window.location.href = 'index.html';
    }
});

document.addEventListener('DOMContentLoaded', function () {
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

    let currentPage = 1;
    const usersPerPage = 5;
    let filteredUsers = [];

    // usuarios.js (frontend) – versión debug
    const verifyTokenValidity = async () => {
        const token = sessionStorage.getItem('token');
        // console.log('🔍 Token en sessionStorage:', token);

        if (!token) {
            // console.warn('❌ No hay token → no redirigimos por ahora');
            return;
        }

        try {
            const res = await fetch(`${BACKEND_URL}/api/auth/verify`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });

            // console.log('📡 Status de /verify:', res.status);
            if (!res.ok) {
                const error = await res.json();
                // console.error('❌ Error del backend:', error);
                // NO redirigimos, solo log
                return;
            }

            const data = await res.json();
            // console.log('✅ Token válido:', data.user);
        } catch (err) {
            // console.error('❌ Error de red:', err);
            // NO redirigimos
        }
    };

    // IMPORTANTE: no hagas nada más hasta ver los logs
    verifyTokenValidity();

    const getUsers = async () => {
        try {
            const response = await fetch(`${BACKEND_URL}/api/usuarios`, {
                headers: {
                    'Authorization': `Bearer ${sessionStorage.getItem('token') || ''}`
                }
            });
            if (!response.ok) throw new Error('Error al obtener usuarios');
            const data = await response.json();
            return Array.isArray(data) ? data : [];
        } catch (error) {
            console.error('Error al obtener usuarios:', error);
            return [];
        }
    };

    const renderUserTable = async () => {
        const users = filteredUsers.length > 0 ? filteredUsers : await getUsers();
        // console.log('Datos renderizados en renderUserTable:', users);
        const totalPages = Math.ceil(users.length / usersPerPage);

        pageInfo.textContent = `Página ${currentPage} de ${totalPages || 1}`;
        prevPageBtn.disabled = currentPage === 1;
        nextPageBtn.disabled = currentPage === totalPages || totalPages === 0;

        const startIndex = (currentPage - 1) * usersPerPage;
        const endIndex = startIndex + usersPerPage;
        const paginatedUsers = users.slice(startIndex, endIndex);

        userTableBody.innerHTML = '';

        if (paginatedUsers.length === 0) {
            const emptyRow = document.createElement('tr');
            emptyRow.innerHTML = `<td colspan="7" style="text-align: center;">No se encontraron usuarios</td>`;
            userTableBody.appendChild(emptyRow);
        } else {
            paginatedUsers.forEach(user => {
                const estadoLower = user.estado ? user.estado.toLowerCase() : 'inactivo';
                // console.log(`Renderizando usuario ${user.id} con estado: ${estadoLower}`);
                const estadoDisplay = estadoLower === 'activo' ? 'Activo' : 'Inactivo';
                const row = document.createElement('tr');
                row.innerHTML = `
                    <td>${user.id}</td>
                    <td>${user.nombre || 'Sin nombre'}</td>
                    <td>${user.username}</td>
                    <td>${user.email}</td>
                    <td><span class="role-badge role-${user.rol}">${translateRole(user.rol)}</span></td>
                    <td><span class="status-badge status-${estadoLower}">${estadoDisplay}</span></td>
                    <td>
                        <div class="action-buttons">
                            <button class="btn btn-sm btn-edit" data-id="${user.id}" title="Editar"><i class="fas fa-edit"></i></button>
                            <button class="btn btn-sm btn-delete" data-id="${user.id}" title="Eliminar"><i class="fas fa-trash"></i></button>
                        </div>
                    </td>
                `;
                userTableBody.appendChild(row);
            });
        }

        addActionButtonListeners();
    };

    const translateRole = (role) => {
        const roles = {
            'admin': 'Administrador',
            'abogado': 'Abogado',
            'usuario': 'Usuario',
            'user': 'Usuario'
        };
        return roles[role] || role;
    };

    const addActionButtonListeners = () => {
        document.querySelectorAll('.btn-edit').forEach(button => {
            button.addEventListener('click', () => {
                const userId = parseInt(button.getAttribute('data-id'));
                editUser(userId);
            });
        });

        document.querySelectorAll('.btn-delete').forEach(button => {
            button.addEventListener('click', () => {
                const userId = parseInt(button.getAttribute('data-id'));
                showDeleteConfirmation(userId);
            });
        });
    };

    const showAddUserModal = () => {
        userModalTitle.textContent = 'Agregar Usuario';
        userForm.reset();
        document.getElementById('password-hint').style.display = 'none';
        document.getElementById('user-password').required = true;
        document.getElementById('user-id').value = '';

        userModal.classList.add('show');
        document.body.style.overflow = 'hidden';
    };

    const editUser = async (userId) => {
        const users = filteredUsers.length > 0 ? filteredUsers : await getUsers();
        const user = users.find(u => u.id === userId);

        if (user) {
            userModalTitle.textContent = 'Editar Usuario';
            document.getElementById('user-id').value = user.id;
            document.getElementById('user-name').value = user.nombre || '';
            document.getElementById('user-username').value = user.username || '';
            document.getElementById('user-email').value = user.email || '';
            document.getElementById('user-password').value = '';
            document.getElementById('user-role').value = user.rol || 'usuario';
            document.getElementById('user-status').value = user.estado || 'activo';

            document.getElementById('password-hint').style.display = 'block';
            document.getElementById('user-password').required = false;

            userModal.classList.add('show');
            document.body.style.overflow = 'hidden';
        }
    };

    const showDeleteConfirmation = async (userId) => {
        const users = filteredUsers.length > 0 ? filteredUsers : await getUsers();
        const user = users.find(u => u.id === userId);

        if (user) {
            document.getElementById('confirm-message').textContent = `¿Está seguro que desea eliminar al usuario ${user.nombre}?`;
            confirmOkBtn.setAttribute('data-id', userId);

            confirmModal.classList.add('show');
            document.body.style.overflow = 'hidden';
        } else {
            console.error('Usuario no encontrado para eliminar:', userId);
        }
    };

    const deleteUser = async (userId) => {
        try {
            const response = await fetch(`${BACKEND_URL}/api/usuarios/${userId}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${sessionStorage.getItem('token') || ''}`
                }
            });
            if (!response.ok) throw new Error('Error al eliminar usuario');
            renderUserTable();
        } catch (error) {
            console.error('Error al eliminar usuario:', error);
        }
    };

    const searchUsers = async (query) => {
        if (!query.trim()) {
            filteredUsers = [];
            currentPage = 1;
            renderUserTable();
            return;
        }

        const users = await getUsers();
        const searchTerm = query.toLowerCase();
        filteredUsers = users.filter(user =>
            user.nombre.toLowerCase().includes(searchTerm) ||
            user.username.toLowerCase().includes(searchTerm) ||
            user.email.toLowerCase().includes(searchTerm) ||
            translateRole(user.rol).toLowerCase().includes(searchTerm)
        );

        currentPage = 1;
        renderUserTable();
    };

    addUserBtn.addEventListener('click', showAddUserModal);

    document.querySelectorAll('.close-modal').forEach(closeBtn => {
        closeBtn.addEventListener('click', function () {
            const modal = this.closest('.modal');
            modal.classList.remove('show');
            document.body.style.overflow = '';
        });
    });

    document.querySelectorAll('.modal').forEach(modal => {
        modal.addEventListener('click', function (e) {
            if (e.target === this) {
                this.classList.remove('show');
                document.body.style.overflow = '';
            }
        });
    });

    userForm.addEventListener('submit', async function (e) {
        e.preventDefault();

        const userId = document.getElementById('user-id').value || '';
        const name = document.getElementById('user-name').value.trim();
        // console.log('Valor de name antes de enviar:', name);
        const username = document.getElementById('user-username').value.trim();
        const email = document.getElementById('user-email').value.trim();
        const password = document.getElementById('user-password').value.trim();
        const role = document.getElementById('user-role').value;
        const status = document.getElementById('user-status').value;
        // console.log('Valor de status antes de enviar:', status);

        if (!name || !username || !email || !role || !status) {
            alert('Por favor, complete todos los campos obligatorios');
            return;
        }

        const userData = { nombre: name, username, email, rol: role, estado: status };
        if (password) userData.password = password;

        try {
            // console.log('Enviando datos al backend:', userData);
            let response;
            if (userId) {
                response = await fetch(`${BACKEND_URL}/api/usuarios/${userId}`, {
                    method: 'PUT',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${sessionStorage.getItem('token') || ''}`
                    },
                    body: JSON.stringify(userData)
                });
            } else {
                response = await fetch(`${BACKEND_URL}/api/usuarios`, {
                    method: 'POST',
                    headers: {
                        'Authorization': `Bearer ${sessionStorage.getItem('token') || ''}`,
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(userData)
                });
            }

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(`Error al guardar usuario: ${errorData.message || 'Respuesta no válida'}`);
            }
            const updatedUser = await response.json();
            // console.log('Usuario actualizado recibido:', updatedUser);
            userModal.classList.remove('show');
            document.body.style.overflow = '';
            await renderUserTable();
        } catch (error) {
            console.error('Error al guardar usuario:', error);
            alert('Error al guardar el usuario. Verifique los datos o el servidor.');
        }
    });

    confirmOkBtn.addEventListener('click', function () {
        const userId = parseInt(this.getAttribute('data-id'));
        deleteUser(userId);
        confirmModal.classList.remove('show');
        document.body.style.overflow = '';
    });

    confirmCancelBtn.addEventListener('click', function () {
        confirmModal.classList.remove('show');
        document.body.style.overflow = '';
    });

    searchBtn.addEventListener('click', function () {
        searchUsers(searchInput.value);
    });

    searchInput.addEventListener('keyup', function (e) {
        if (e.key === 'Enter') {
            searchUsers(this.value);
        }
    });

    prevPageBtn.addEventListener('click', function () {
        if (currentPage > 1) {
            currentPage--;
            renderUserTable();
        }
    });

    nextPageBtn.addEventListener('click', async function () {
        const users = filteredUsers.length > 0 ? filteredUsers : await getUsers();
        const totalPages = Math.ceil(users.length / usersPerPage);
        if (currentPage < totalPages) {
            currentPage++;
            renderUserTable();
        }
    });

    renderUserTable();

    if (typeof setupMobileMenu === 'function') setupMobileMenu();
    if (typeof setupLoginModal === 'function') setupLoginModal();
    if (typeof checkLoginStatus === 'function') checkLoginStatus();
});