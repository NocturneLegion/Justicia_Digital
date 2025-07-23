// 🔒 GESTOR DE PERMISOS POR ROL - VERSIÓN SEGURA
(function() {
    'use strict';
    
    // Definición de permisos por rol
    const PERMISSIONS = {
        'usuario': {
            canViewProcedimientos: true,
            canCreateCasos: false,
            canEditCasos: false,
            canDeleteCasos: false,
            canViewDocuments: true,
            canUploadDocuments: false,
            canEditDocuments: false,
            canDeleteDocuments: false,
            canAccessUsuarios: false,
            canCreateUsuarios: false,
            canEditUsuarios: false,
            canDeleteUsuarios: false
        },
        'abogado': {
            canViewProcedimientos: true,
            canCreateCasos: true,
            canEditCasos: true,
            canDeleteCasos: true,
            canViewDocuments: true,
            canUploadDocuments: true,
            canEditDocuments: true,
            canDeleteDocuments: true,
            canAccessUsuarios: false,
            canCreateUsuarios: false,
            canEditUsuarios: false,
            canDeleteUsuarios: false
        },
        'admin': {
            canViewProcedimientos: true,
            canCreateCasos: true,
            canEditCasos: true,
            canDeleteCasos: true,
            canViewDocuments: true,
            canUploadDocuments: true,
            canEditDocuments: true,
            canDeleteDocuments: true,
            canAccessUsuarios: true,
            canCreateUsuarios: true,
            canEditUsuarios: true,
            canDeleteUsuarios: true
        }
    };
    
    // Función para obtener el usuario actual
    const getCurrentUser = () => {
        try {
            const currentUser = sessionStorage.getItem('currentUser');
            return currentUser ? JSON.parse(currentUser) : null;
        } catch (e) {
            return null;
        }
    };
    
    // Función para verificar si el usuario tiene un permiso específico
    const hasPermission = (permission) => {
        const user = getCurrentUser();
        if (!user || !user.rol) return false;
        
        const userPermissions = PERMISSIONS[user.rol];
        return userPermissions ? userPermissions[permission] : false;
    };
    
    // Función para verificar si puede eliminar un usuario específico
    const canDeleteUser = (targetUserId) => {
        const currentUser = getCurrentUser();
        if (!currentUser) return false;
        
        // No puede eliminar su propio usuario
        if (currentUser.id === targetUserId) return false;
        
        // Solo admin puede eliminar usuarios
        return hasPermission('canDeleteUsuarios');
    };
    
    // Función para ocultar/mostrar elementos según permisos
    const applyPermissions = () => {
        const user = getCurrentUser();
        if (!user) return;
        
        // Ocultar botones según permisos
        hideElementsIfNoPermission('.btn-add-case, #add-case-btn', 'canCreateCasos');
        hideElementsIfNoPermission('.btn-edit, .edit-document-btn', 'canEditCasos');
        hideElementsIfNoPermission('.btn-delete, .delete-document-btn', 'canDeleteCasos');
        hideElementsIfNoPermission('#add-document-btn', 'canUploadDocuments');
        hideElementsIfNoPermission('.btn-add-user, #add-user-btn', 'canCreateUsuarios');
        
        // Deshabilitar formularios si no tiene permisos
        disableFormsIfNoPermission();
        
        // Aplicar permisos específicos a la página actual
        const currentPage = window.location.pathname;
        
        if (currentPage.includes('usuarios.html')) {
            applyUsuariosPermissions();
        } else if (currentPage.includes('procedimientos.html')) {
            applyProcedimientosPermissions();
        } else if (currentPage.includes('actividades.html')) {
            applyActividadesPermissions();
        }
    };
    
    // Función auxiliar para ocultar elementos
    const hideElementsIfNoPermission = (selector, permission) => {
        if (!hasPermission(permission)) {
            const elements = document.querySelectorAll(selector);
            elements.forEach(el => {
                el.style.display = 'none';
            });
        }
    };
    
    // Función para deshabilitar formularios
    const disableFormsIfNoPermission = () => {
        const user = getCurrentUser();
        if (!user) return;
        
        // Si es usuario (solo lectura), deshabilitar todos los formularios
        if (user.rol === 'usuario') {
            const forms = document.querySelectorAll('form');
            forms.forEach(form => {
                const inputs = form.querySelectorAll('input, textarea, select, button[type="submit"]');
                inputs.forEach(input => {
                    if (input.type !== 'search') { // Permitir búsquedas
                        input.disabled = true;
                    }
                });
            });
        }
    };
    
    // Permisos específicos para página de usuarios
    const applyUsuariosPermissions = () => {
        if (!hasPermission('canAccessUsuarios')) {
            // Redirigir si no tiene acceso
            alert('Acceso restringido. No tiene permisos para gestionar usuarios.');
            window.location.href = 'procedimientos.html';
            return;
        }
        
        // Ocultar botón de eliminar para el propio usuario
        const currentUser = getCurrentUser();
        if (currentUser) {
            setTimeout(() => {
                const deleteButtons = document.querySelectorAll('.btn-delete');
                deleteButtons.forEach(btn => {
                    const userId = parseInt(btn.getAttribute('data-id'));
                    if (userId === currentUser.id) {
                        btn.style.display = 'none';
                    }
                });
            }, 500);
        }
    };
    
    // Permisos específicos para página de procedimientos
    const applyProcedimientosPermissions = () => {
        const user = getCurrentUser();
        if (!user) return;
        
        if (user.rol === 'usuario') {
            // Solo lectura para usuarios
            const actionButtons = document.querySelectorAll('.btn-edit, .btn-delete');
            actionButtons.forEach(btn => btn.style.display = 'none');
            
            // Cambiar texto de botones para indicar solo lectura
            const addBtn = document.getElementById('add-case-btn');
            if (addBtn) {
                addBtn.style.display = 'none';
            }
            
            // Agregar mensaje de solo lectura
            addReadOnlyMessage('Modo solo lectura - No puede crear, editar o eliminar casos');
        }
    };
    
    // Permisos específicos para página de actividades
    const applyActividadesPermissions = () => {
        const user = getCurrentUser();
        if (!user) return;
        
        if (user.rol === 'usuario') {
            // Solo lectura para documentos
            const uploadBtn = document.getElementById('add-document-btn');
            if (uploadBtn) {
                uploadBtn.style.display = 'none';
            }
            
            const editButtons = document.querySelectorAll('.edit-document-btn, .delete-document-btn');
            editButtons.forEach(btn => btn.style.display = 'none');
            
            // Agregar mensaje de solo lectura
            addReadOnlyMessage('Modo solo lectura - No puede subir, editar o eliminar documentos');
        }
    };
    
    // Función para agregar mensaje de solo lectura
    const addReadOnlyMessage = (message) => {
        const existingMessage = document.querySelector('.readonly-message');
        if (existingMessage) return;
        
        const messageDiv = document.createElement('div');
        messageDiv.className = 'readonly-message alert alert-info mt-3';
        messageDiv.innerHTML = `
            <i class="fas fa-info-circle me-2"></i>
            <strong>Información:</strong> ${message}
        `;
        
        const container = document.querySelector('.container, .content-section');
        if (container) {
            container.insertBefore(messageDiv, container.firstChild);
        }
    };
    
    // Función para verificar acceso a página
    const checkPageAccess = () => {
        const currentPage = window.location.pathname;
        const user = getCurrentUser();
        
        if (!user) {
            // Sin usuario, redirigir a login
            if (!currentPage.includes('index.html')) {
                window.location.href = 'index.html';
            }
            return false;
        }
        
        // Verificar acceso específico a usuarios.html
        if (currentPage.includes('usuarios.html') && !hasPermission('canAccessUsuarios')) {
            alert('Acceso restringido. No tiene permisos para gestionar usuarios.');
            window.location.href = 'procedimientos.html';
            return false;
        }
        
        return true;
    };
    
    // Aplicar permisos cuando se carga la página (SIN interceptar sessionStorage)
    document.addEventListener('DOMContentLoaded', () => {
        setTimeout(() => {
            if (checkPageAccess()) {
                applyPermissions();
            }
        }, 200);
    });
    
    // Exponer funciones globalmente
    window.permissionsManager = {
        hasPermission,
        canDeleteUser,
        getCurrentUser,
        applyPermissions,
        checkPageAccess
    };
    
})();