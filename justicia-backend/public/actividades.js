// 🔒 GESTIÓN DE ACTIVIDADES Y DOCUMENTOS
document.addEventListener('DOMContentLoaded', () => {
    // Verificar que BACKEND_URL esté disponible
    if (typeof BACKEND_URL === 'undefined') {
        console.error('No se encontró config.js o la variable BACKEND_URL. Verifica la configuración');
        alert('No se encontró config.js o la variable BACKEND_URL. Verifica la configuración');
        return;
    }
    
    // La autenticación se maneja en auth-global.js
    // Cargar documentos al iniciar
    loadDocuments();

    // Inicializar listeners para el formulario de agregar documento
    const addDocumentBtn = document.getElementById('add-document-btn');
    const documentForm = document.getElementById('document-form');
    const documentFileInput = document.getElementById('document-file');
    const previewImage = document.getElementById('preview-image');
    const previewPdf = document.getElementById('preview-pdf');

    if (addDocumentBtn && documentForm && documentFileInput && previewImage && previewPdf) {
        addDocumentBtn.addEventListener('click', () => {
            document.getElementById('document-id').value = '';
            document.getElementById('document-tipo').value = '';
            document.getElementById('document-fecha').value = '';
            document.getElementById('document-descripcion').value = '';
            documentFileInput.value = '';
            previewImage.classList.add('d-none');
            previewPdf.classList.add('d-none');
        });

        documentFileInput.addEventListener('change', (e) => {
            const file = e.target.files[0];
            if (!file) return;
            previewImage.classList.add('d-none');
            previewPdf.classList.add('d-none');
            if (file.type.startsWith('image/')) {
                const reader = new FileReader();
                reader.onload = (e) => {
                    previewImage.src = e.target.result;
                    previewImage.classList.remove('d-none');
                };
                reader.readAsDataURL(file);
            } else if (file.type === 'application/pdf') {
                const reader = new FileReader();
                reader.onload = (e) => {
                    const blob = new Blob([e.target.result], { type: 'application/pdf' });
                    previewPdf.src = URL.createObjectURL(blob);
                    previewPdf.classList.remove('d-none');
                };
                reader.readAsArrayBuffer(file);
            }
        });

        documentForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const urlParams = new URLSearchParams(window.location.search);
            const casoId = urlParams.get('caso_id') || null;
            const nurej = urlParams.get('nurej') || sessionStorage.getItem('selectedNurej');
            const documentId = document.getElementById('document-id').value;
            const formData = new FormData();
            formData.append('caso_id', casoId || '');
            formData.append('tipo', document.getElementById('document-tipo').value);
            formData.append('fecha', document.getElementById('document-fecha').value);
            formData.append('descripcion', document.getElementById('document-descripcion').value);
            formData.append('nurej', nurej);
            if (documentFileInput.files[0]) {
                formData.append('file', documentFileInput.files[0]);
            }
            try {
                const url = documentId ?
                    `${BACKEND_URL}/api/documentos/${documentId}` :
                    `${BACKEND_URL}/api/documentos`;
                const method = documentId ? 'PUT' : 'POST';
                const response = await fetch(url, {
                    method: method,
                    headers: {
                        'Authorization': `Bearer ${sessionStorage.getItem('token')}`
                    },
                    body: formData
                });
                if (response.ok) {
                    // Ocultar el modal usando Bootstrap
                    const modal = bootstrap.Modal.getInstance(document.getElementById('addDocumentModal'));
                    if (modal) modal.hide();
                    loadDocuments();
                    alert(documentId ? 'Documento actualizado exitosamente' : 'Documento guardado exitosamente');
                } else {
                    const result = await response.json();
                    alert("Error al guardar documento: " + (result.message || "Verifica los datos"));
                }
            } catch (error) {
                console.error("Error al enviar:", error);
                alert("Error al enviar el documento: " + error.message);
            }
        });
    }

    // Función para cargar documentos
    async function loadDocuments() {
        const urlParams = new URLSearchParams(window.location.search);
        const casoId = urlParams.get('caso_id');

        if (!casoId) {
            console.warn("No se encontró 'caso_id' en la URL.");
            return;
        }

        try {
            const response = await fetch(`${BACKEND_URL}/api/documentos?caso_id=${casoId}`, {
                headers: {
                    'Authorization': `Bearer ${sessionStorage.getItem('token')}`
                }
            });

            if (!response.ok) {
                throw new Error(`Error HTTP: ${response.status}`);
            }

            const documents = await response.json();
            const tbody = document.getElementById('document-table-body');
            tbody.innerHTML = '';

            if (!Array.isArray(documents) || documents.length === 0) {
                const row = document.createElement('tr');
                row.innerHTML = '<td colspan="5" class="text-center">No hay documentos disponibles</td>';
                tbody.appendChild(row);
            } else {
                documents.forEach(doc => {
                    const row = document.createElement('tr');
                    
                    // Verificar permisos del usuario actual
                    const currentUser = JSON.parse(sessionStorage.getItem('currentUser') || '{}');
                    const canEdit = currentUser.rol !== 'usuario';
                    const canDelete = currentUser.rol !== 'usuario';
                    
                    // Generar botones de acción según permisos
                    let actionButtons = '';
                    if (canEdit) {
                        actionButtons += `
                            <button class="btn btn-sm btn-primary edit-document-btn" data-id="${doc.id}" title="Editar documento">
                                <i class="fas fa-edit"></i>
                            </button>
                        `;
                    }
                    if (canDelete) {
                        actionButtons += `
                            <button class="btn btn-sm btn-danger delete-document-btn" data-id="${doc.id}" title="Eliminar documento">
                                <i class="fas fa-trash-alt"></i>
                            </button>
                        `;
                    }
                    
                    // Si no hay botones de acción, mostrar mensaje
                    if (!actionButtons) {
                        actionButtons = '<span class="text-muted small">Solo lectura</span>';
                    }
                    
                    row.innerHTML = `
                        <td>${doc.tipo || ''}</td>
                        <td>${new Date(doc.fecha).toLocaleDateString()}</td>
                        <td>${doc.descripcion || ''}</td>
                        <td>
                            <button class="btn btn-sm btn-outline-secondary"
                                    data-bs-toggle="modal"
                                    data-bs-target="#documentViewModal"
                                    onclick="previewFile('${doc.nombre_archivo}', '${doc.tipo_archivo}', ${doc.id})">
                                <i class="fas fa-eye me-1"></i>Ver Archivo
                            </button>
                        </td>
                        <td>
                            <div class="d-flex gap-1 justify-content-center">
                                ${actionButtons}
                            </div>
                        </td>
                    `;
                    tbody.appendChild(row);
                });
            }
        } catch (error) {
            console.error("Error al cargar documentos:", error);
            const tbody = document.getElementById('document-table-body');
            if (tbody) {
                tbody.innerHTML = `
                    <tr>
                        <td colspan="5" class="text-center text-danger">Error al cargar documentos: ${error.message}</td>
                    </tr>`;
            }
        }
    }

    // (Eliminado el bloque de waitForModal y la inicialización manual del modal de agregar documento)

    // Mostrar archivo en modal
    window.previewFile = function(nombre, tipo, id) {
        const frame = document.getElementById('document-frame');
        if (!frame) return;

        const token = sessionStorage.getItem('token');
        if (!token) {
            alert("No tienes sesión iniciada.");
            return;
        }

        fetch(`${BACKEND_URL}/api/documentos/${id}/file`, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        })
        .then(response => {
            if (!response.ok) {
                throw new Error("Archivo no encontrado o sin permisos");
            }
            return response.blob();
        })
        .then(blob => {
            const url = URL.createObjectURL(blob);

            if (tipo.startsWith('image/')) {
                frame.src = url;
            } else if (tipo === 'application/pdf') {
                frame.src = url;
            } else {
                alert("Formato no compatible");
                frame.src = '';
            }
        })
        .catch(err => {
            console.error("Error al cargar el archivo:", err);
            alert("No se pudo cargar el archivo. Verifica tus permisos.");
            frame.src = '';
        });
    };

    // Funcionalidad para editar documentos
    document.addEventListener('click', async function (e) {
        if (e.target.matches('.edit-document-btn') || e.target.closest('.edit-document-btn')) {
            // Verificar permisos antes de proceder
            const currentUser = JSON.parse(sessionStorage.getItem('currentUser') || '{}');
            if (currentUser.rol === 'usuario') {
                alert('No tiene permisos para editar documentos.');
                return;
            }
            
            const button = e.target.matches('.edit-document-btn') ? e.target : e.target.closest('.edit-document-btn');
            const documentId = button.dataset.id;
            
            try {
                const response = await fetch(`${BACKEND_URL}/api/documentos/${documentId}`, {
                    headers: {
                        'Authorization': `Bearer ${sessionStorage.getItem('token')}`
                    }
                });

                const doc = await response.json();

                if (response.ok) {
                    // Usar los campos del modal de edición
                    document.getElementById('edit-document-tipo').value = doc.tipo;
                    document.getElementById('edit-document-fecha').value = doc.fecha.split('T')[0];
                    document.getElementById('edit-document-descripcion').value = doc.descripcion;

                    // Crear y mostrar el modal de edición
                    const editModal = new bootstrap.Modal(document.getElementById('editDocumentModal'));
                    editModal.show();

                    // Configurar el formulario de edición
                    const editForm = document.getElementById('edit-document-form');
                    const newEditForm = editForm.cloneNode(true);
                    editForm.parentNode.replaceChild(newEditForm, editForm);

                    newEditForm.addEventListener('submit', async (e) => {
                        e.preventDefault();

                        const urlParams = new URLSearchParams(window.location.search);
                        const casoId = urlParams.get('caso_id');
                        const nurej = urlParams.get('nurej') || sessionStorage.getItem('selectedNurej');

                        const formData = new FormData();
                        formData.append('caso_id', casoId || '');
                        formData.append('tipo', document.getElementById('edit-document-tipo').value);
                        formData.append('fecha', document.getElementById('edit-document-fecha').value);
                        formData.append('descripcion', document.getElementById('edit-document-descripcion').value);
                        formData.append('nurej', nurej);

                        try {
                            const response = await fetch(`${BACKEND_URL}/api/documentos/${documentId}`, {
                                method: 'PUT',
                                headers: {
                                    'Authorization': `Bearer ${sessionStorage.getItem('token')}`
                                },
                                body: formData
                            });

                            if (response.ok) {
                                editModal.hide();
                                loadDocuments(); // Refrescar tabla
                                alert('Documento actualizado exitosamente');
                            } else {
                                const result = await response.json();
                                alert("Error al actualizar documento: " + (result.message || "Verifica los datos"));
                            }
                        } catch (error) {
                            console.error("Error al enviar:", error);
                            alert("Error al actualizar el documento: " + error.message);
                        }
                    });
                } else {
                    throw new Error(doc.message || 'Error al cargar el documento');
                }
            } catch (error) {
                console.error("Error al cargar el documento:", error);
                alert("Error al cargar el documento: " + error.message);
            }
        }
    });

    // Funcionalidad para eliminar documentos
    document.addEventListener('click', async function (e) {
        if (e.target.matches('.delete-document-btn') || e.target.closest('.delete-document-btn')) {
            // Verificar permisos antes de proceder
            const currentUser = JSON.parse(sessionStorage.getItem('currentUser') || '{}');
            if (currentUser.rol === 'usuario') {
                alert('No tiene permisos para eliminar documentos.');
                return;
            }
            
            const button = e.target.matches('.delete-document-btn') ? e.target : e.target.closest('.delete-document-btn');
            const documentId = button.dataset.id;
            
            // Mostrar modal de confirmación
            const confirmModal = new bootstrap.Modal(document.getElementById('confirmModal'));
            confirmModal.show();
            
            // Manejar confirmación
            const confirmDeleteBtn = document.getElementById('confirm-delete');
            const newConfirmDeleteBtn = confirmDeleteBtn.cloneNode(true);
            confirmDeleteBtn.parentNode.replaceChild(newConfirmDeleteBtn, confirmDeleteBtn);
            
            newConfirmDeleteBtn.addEventListener('click', async function() {
                // Verificar permisos nuevamente antes de eliminar
                const currentUser = JSON.parse(sessionStorage.getItem('currentUser') || '{}');
                if (currentUser.rol === 'usuario') {
                    alert('No tiene permisos para eliminar documentos.');
                    confirmModal.hide();
                    return;
                }
                
                try {
                    const response = await fetch(`${BACKEND_URL}/api/documentos/${documentId}`, {
                        method: 'DELETE',
                        headers: {
                            'Authorization': `Bearer ${sessionStorage.getItem('token')}`
                        }
                    });

                    if (response.ok) {
                        confirmModal.hide();
                        loadDocuments(); // Refrescar tabla
                        alert('Documento eliminado exitosamente');
                    } else {
                        const result = await response.json();
                        throw new Error(result.message || 'Error al eliminar el documento');
                    }
                } catch (error) {
                    console.error("Error al eliminar el documento:", error);
                    alert("Error al eliminar el documento: " + error.message);
                }
            });
        }
    });
});