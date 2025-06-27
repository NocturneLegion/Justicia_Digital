// Verificar si el usuario está autenticado
function checkPageAccess() {
    const isLoggedIn = sessionStorage.getItem('isLoggedIn');
    if (isLoggedIn !== 'true') {
        alert('Acceso restringido. Debe iniciar sesión para acceder a esta página.');
        window.location.href = 'index.html';
        return false;
    }
    return true;
}

// Variables globales
let currentNurej = '';
let documents = [];
let currentDocumentId = null;

// Referencias a elementos del DOM
const nurejDisplay = document.getElementById('nurej-display');
const documentsContainer = document.getElementById('documents-container');
const noDocumentsMessage = document.getElementById('no-documents-message');
const addDocumentBtn = document.getElementById('add-document-btn');
const documentModal = document.getElementById('document-modal');
const documentForm = document.getElementById('document-form');
const documentFile = document.getElementById('document-file');
const imagePreview = document.getElementById('image-preview');
const pdfPreview = document.getElementById('pdf-preview');
const pdfName = document.getElementById('pdf-name');
const documentPreview = document.getElementById('document-preview');
const confirmModal = document.getElementById('confirm-modal');
const confirmMessage = document.getElementById('confirm-message');
//const confirmOk = document.getElementById('confirm-ok');
const confirmCancel = document.getElementById('confirm-cancel');
const viewDocumentModal = document.getElementById('view-document-modal');
const viewDocumentTitle = document.getElementById('view-document-title');
const documentContainer = document.getElementById('document-container');
const documentDetails = document.getElementById('document-details');
const loginBtn = document.getElementById('login-btn');
const loginModal = document.getElementById('login-modal');
const closeModalButtons = document.querySelectorAll('.close-modal');

// Variables para instancias de modales Bootstrap
let documentModalInstance;
let confirmModalInstance;
let viewDocumentModalInstance;
let loginModalInstance;

// Inicializar la página
/*function init() {
    console.log('🚀 Inicializando página');

    if (!checkPageAccess()) {
        console.log('🔒 Acceso denegado, redirigiendo');
        return;
    }

    const urlParams = new URLSearchParams(window.location.search);
    currentNurej = urlParams.get('nurej');
    console.log('📋 NUREJ obtenido de URL:', currentNurej);

    if (!currentNurej) {
        console.warn('⚠️ NUREJ no encontrado en URL, redirigiendo a procedimientos.html');
        window.location.href = 'procedimientos.html';
        return;
    }

    if (nurejDisplay) {
        nurejDisplay.textContent = currentNurej;
        console.log('📄 NUREJ mostrado en la página:', currentNurej);
    }

    //loadDocuments();
    //initializeModals();
    //setupEventListeners();
    //updateUIForUser();
}*/

// Cargar documentos desde localStorage
function loadDocuments() {
    try {
        const savedDocuments = localStorage.getItem('documents');
        if (savedDocuments) {
            documents = JSON.parse(savedDocuments);
            // Filtrar documentos por NUREJ actual
            documents = documents.filter(doc => doc.nurej === currentNurej);
        } else {
            documents = [];
        }
        renderDocuments();
    } catch (error) {
        console.error('Error al cargar documentos:', error);
        documents = [];
        renderDocuments();
    }
}

// Renderizar documentos en la interfaz
function renderDocuments() {
    console.log('📝 Actualizando vista de documentos...');
    if (!documentsContainer) return;
    
    // Limpiar contenedor
    documentsContainer.innerHTML = '';
    
    if (documents.length === 0) {
        // Mostrar mensaje de no documentos
        documentsContainer.innerHTML = `
            <div id="no-documents-message" class="col-12 text-center py-5">
                <i class="fas fa-file-alt fa-3x text-muted mb-3"></i>
                <p class="lead">No hay documentos para este caso</p>
                <p>Haga clic en "Agregar Documento" para subir un documento escaneado.</p>
            </div>
        `;
        return;
    }
    
    // Renderizar cada documento
    documents.forEach(doc => {
        const documentCard = createDocumentCard(doc);
        documentsContainer.appendChild(documentCard);
    });
}

// Crear tarjeta de documento
function createDocumentCard(doc) {
    const col = document.createElement('div');
    col.className = 'col-12 mb-3'; // Cambiado de 'col-md-6 col-lg-4 mb-3' a 'col-12 mb-3' para que ocupe todo el ancho
    
    const fileIcon = doc.fileType.startsWith('image/') ? 'fas fa-image' : 'fas fa-file-pdf';
    const fileColor = doc.fileType.startsWith('image/') ? 'text-primary' : 'text-danger';
    
    col.innerHTML = `
        <div class="card shadow-sm">
            <div class="card-body d-flex flex-row"> <!-- Cambiado de 'd-flex flex-column' a 'd-flex flex-row' para layout horizontal -->
                <div class="text-center me-3" style="min-width: 60px;"> <!-- Añadido margen derecho y ancho mínimo -->
                    <i class="${fileIcon} fa-3x ${fileColor}"></i>
                </div>
                <div class="flex-grow-1"> <!-- Contenedor para la información del documento -->
                    <h6 class="card-title">${translateDocumentType(doc.tipo)}</h6>
                    <p class="card-text">${doc.descripcion}</p>
                    <div class="d-flex justify-content-between align-items-center">
                        <div>
                            <small class="text-muted d-block">
                                <i class="fas fa-calendar me-1"></i>${formatDate(doc.fecha)}
                            </small>
                            <small class="text-muted d-block">
                                <i class="fas fa-file me-1"></i>${doc.fileName}
                            </small>
                        </div>
                        <div class="btn-group" role="group">
                            <button class="btn btn-sm btn-outline-primary" onclick="viewDocument('${doc.id}')" title="Ver documento">
                                <i class="fas fa-eye"></i>
                            </button>
                            <button class="btn btn-sm btn-outline-secondary" onclick="editDocument('${doc.id}')" title="Editar">
                                <i class="fas fa-edit"></i>
                            </button>
                            <button class="btn btn-sm btn-outline-danger" onclick="showDeleteConfirmation('${doc.id}')" title="Eliminar">
                                <i class="fas fa-trash"></i>
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    `;
    
    return col;
}

// Inicializar modales de Bootstrap
function initializeModals() {
    console.log('🎭 Inicializando modales de Bootstrap');
    if (typeof bootstrap === 'undefined') {
        console.error('❌ Bootstrap no está cargado');
        return;
    }

    try {
        if (documentModal && !window.documentModalInstance) {
            window.documentModalInstance = new bootstrap.Modal(documentModal, {
                backdrop: true,
                keyboard: true
            });
            console.log('✅ documentModalInstance inicializado');
        }
        if (confirmModal && !window.confirmModalInstance) {
            window.confirmModalInstance = new bootstrap.Modal(confirmModal);
            console.log('✅ confirmModalInstance inicializado');
        }
        if (viewDocumentModal && !window.viewDocumentModalInstance) {
            window.viewDocumentModalInstance = new bootstrap.Modal(viewDocumentModal);
            console.log('✅ viewDocumentModalInstance inicializado');
        }
        if (loginModal && !window.loginModalInstance) {
            window.loginModalInstance = new bootstrap.Modal(loginModal);
            console.log('✅ loginModalInstance inicializado');
        }
    } catch (error) {
        console.error('❌ Error al inicializar modales:', error);
    }
}

// Función para diagnosticar elementos del DOM
function diagnosticarElementos() {
    console.log('🔍 Diagnosticando elementos del DOM');
    
    const elementos = {
        nurejDisplay: document.getElementById('nurej-display'),
        documentsContainer: document.getElementById('documents-container'),
        noDocumentsMessage: document.getElementById('no-documents-message'),
        addDocumentBtn: document.getElementById('add-document-btn'),
        documentModal: document.getElementById('document-modal'),
        documentForm: document.getElementById('document-form'),
        documentFile: document.getElementById('document-file'),
        documentId: document.getElementById('document-id'),
        documentNurej: document.getElementById('document-nurej'),
        documentTipo: document.getElementById('document-tipo'),
        documentDescripcion: document.getElementById('document-descripcion'),
        documentFecha: document.getElementById('document-fecha'),
        imagePreview: document.getElementById('image-preview'),
        pdfPreview: document.getElementById('pdf-preview'),
        pdfName: document.getElementById('pdf-name'),
        documentPreview: document.getElementById('document-preview'),
        confirmModal: document.getElementById('confirm-modal'),
        confirmMessage: document.getElementById('confirm-message'),
        confirmOk: document.getElementById('confirm-ok'),
        confirmCancel: document.getElementById('confirm-cancel'),
        viewDocumentModal: document.getElementById('view-document-modal'),
        viewDocumentTitle: document.getElementById('view-document-title'),
        documentContainer: document.getElementById('document-container'),
        documentDetails: document.getElementById('document-details'),
        loginBtn: document.getElementById('login-btn'),
        loginModal: document.getElementById('login-modal'),
        documentModalTitle: document.getElementById('document-modal-title'),
        closeModalButtons: document.querySelectorAll('.btn-close'),
        closeDocumentModalBtn: document.getElementById('close-document-modal')
    };
    
    // Verificar instancias de modales Bootstrap
    if (typeof bootstrap !== 'undefined') {
        try {
            // Inicializar instancias de modales si no existen
            if (elementos.documentModal && !window.documentModalInstance) {
                window.documentModalInstance = new bootstrap.Modal(elementos.documentModal, {
                    backdrop: true,  // Cambiado de 'static' a true para permitir cerrar al hacer clic fuera
                    keyboard: true    // Cambiado a true para permitir cerrar con ESC
                });
                console.log('✅ documentModalInstance inicializado');
            }
            if (elementos.confirmModal && !window.confirmModalInstance) {
                window.confirmModalInstance = new bootstrap.Modal(elementos.confirmModal);
                console.log('✅ confirmModalInstance inicializado');
            }
            if (elementos.viewDocumentModal && !window.viewDocumentModalInstance) {
                window.viewDocumentModalInstance = new bootstrap.Modal(elementos.viewDocumentModal);
                console.log('✅ viewDocumentModalInstance inicializado');
            }
            if (elementos.loginModal && !window.loginModalInstance) {
                window.loginModalInstance = new bootstrap.Modal(elementos.loginModal);
                console.log('✅ loginModalInstance inicializado');
            }
        } catch (error) {
            console.error('❌ Error al inicializar modales:', error);
        }
    }
    
    return elementos;
}

//Configurar los eventos
function setupEventListeners() {
    console.log('🔧 setupEventListeners iniciado');

    const elementos = diagnosticarElementos();

    if (elementos.addDocumentBtn) {
        console.log('✅ Configurando evento del botón Agregar Documento');
        elementos.addDocumentBtn.addEventListener('click', (event) => {
            event.preventDefault();
            console.log('🔘 Botón Agregar Documento presionado');

            try {
                currentDocumentId = null;
                if (elementos.documentForm) {
                    elementos.documentForm.reset();
                    console.log('📄 Formulario reseteado');
                }
                if (elementos.documentNurej) {
                    elementos.documentNurej.value = currentNurej || '';
                    console.log('📋 NUREJ asignado:', currentNurej);
                }
                if (elementos.documentModalTitle) {
                    elementos.documentModalTitle.textContent = 'Nuevo Documento';
                    console.log('📋 Título del modal configurado');
                }
                if (elementos.documentFecha) {
                    elementos.documentFecha.valueAsDate = new Date();
                    console.log('📅 Fecha configurada');
                }
                if (elementos.documentPreview) {
                    elementos.documentPreview.classList.add('d-none');
                    if (elementos.imagePreview) elementos.imagePreview.classList.add('d-none');
                    if (elementos.pdfPreview) elementos.pdfPreview.classList.add('d-none');
                    console.log('🖼️ Vista previa ocultada');
                }

                closeAllModals();
                console.log('🧹 Todos los modales cerrados');

                // Usar la función showDocumentModal en lugar de crear y mostrar la instancia directamente
                showDocumentModal();
                console.log('📋 Modal de documento mostrado');
            } catch (error) {
                console.error('❌ Error al preparar o mostrar el modal:', error);
                alert('Error al abrir el formulario de documento. Por favor, intenta de nuevo.');
            }
        });
    }

    if (elementos.documentForm) {
        elementos.documentForm.addEventListener('submit', saveDocument);
    }

    if (elementos.documentFile) {
        elementos.documentFile.addEventListener('change', previewFile);
    }

    if (elementos.closeModalButtons && elementos.closeModalButtons.length > 0) {
        elementos.closeModalButtons.forEach(button => {
        button.addEventListener('click', () => {
            const modal = button.closest('.modal');
            hideModal(modal);
            cleanupFilePreview();
        });
        });
    }
    
    // Agregar evento específico al botón de cierre del modal de documento
    if (elementos.closeDocumentModalBtn) {
        console.log('✅ Configurando evento del botón de cierre del modal de documento');
        elementos.closeDocumentModalBtn.addEventListener('click', () => {
            console.log('❌ Botón de cierre del modal de documento presionado');
            if (window.documentModalInstance) {
                window.documentModalInstance.hide();
            } else if (elementos.documentModal) {
                hideModal(elementos.documentModal);
            }
            cleanupFilePreview();
        });
    }

    if (elementos.confirmCancel) {
        elementos.confirmCancel.addEventListener('click', () => {
        closeAllModals();
        currentDocumentId = null;
        });
    }

    if (elementos.confirmOk) {
        console.log('✅ Configurando evento del botón de confirmación de eliminación');
        elementos.confirmOk.addEventListener('click', function(event) {
            event.preventDefault();
            console.log('🔘 Botón de confirmación de eliminación presionado');
            deleteDocument();
        });
    }

    if (elementos.loginBtn) {
        elementos.loginBtn.addEventListener('click', (e) => {
            e.preventDefault();
            if (window.loginModalInstance) window.loginModalInstance.show();
        });
    }

    initializeBootstrapDropdowns();
}


// Nueva función separada para inicializar dropdowns
function initializeBootstrapDropdowns() {
    const dropdownElementList = document.querySelectorAll('.dropdown-toggle');
    [...dropdownElementList].map(dropdownToggleEl => {
        // Verificar si ya tiene una instancia de dropdown para evitar duplicados
        if (!bootstrap.Dropdown.getInstance(dropdownToggleEl)) {
            new bootstrap.Dropdown(dropdownToggleEl);
        }
    });
}

// Alternativa más segura: función que se puede llamar cuando sea necesario

// Inicializar la aplicación cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', function() {
    console.log('🚀 DOM cargado, inicializando aplicación');
    initializeApp();
});

// También inicializar si el DOM ya está cargado
if (document.readyState === 'interactive' || document.readyState === 'complete') {
    console.log('🚀 DOM ya cargado, inicializando aplicación');
    initializeApp();
}
function initializeApp() {
    console.log('🚀 Inicializando aplicación');
    
    // Verificar acceso a la página
    if (!checkPageAccess()) {
        console.log('🔒 Acceso denegado, redirigiendo');
        return;
    }
    
    // Obtener NUREJ de la URL
    const urlParams = new URLSearchParams(window.location.search);
    currentNurej = urlParams.get('nurej');
    console.log('📋 NUREJ obtenido de URL:', currentNurej);
    
    if (!currentNurej) {
        console.warn('⚠️ NUREJ no encontrado en URL, redirigiendo a procedimientos.html');
        window.location.href = 'procedimientos.html';
        return;
    }
    
    // Mostrar NUREJ en la página
    if (nurejDisplay) {
        nurejDisplay.textContent = currentNurej;
        console.log('📄 NUREJ mostrado en la página:', currentNurej);
    }
    
    // Cargar documentos
    loadDocuments();
    console.log('📄 Documentos cargados');
    
    // Solo ejecutar si el DOM está listo
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => {
            initializeModals();
            setupEventListeners();
            initializeBootstrapDropdowns();
        });
    } else {
        // El DOM ya está listo
        initializeModals();
        setupEventListeners();
        initializeBootstrapDropdowns();
    }
}

// Función para cerrar todos los modales----------------------------------------------
function showModal(modalElement) {
    if (!modalElement) return;
    
    // Mostrar el modal cambiando su estilo y agregando clases de Bootstrap
    modalElement.style.display = 'block';
    modalElement.classList.add('show');
    modalElement.setAttribute('aria-modal', 'true');
    modalElement.setAttribute('role', 'dialog');
    modalElement.removeAttribute('aria-hidden');
    
    // Asegurar que los estilos personalizados se mantengan
    const modalDialog = modalElement.querySelector('.modal-dialog');
    if (modalDialog && modalElement.id === 'view-document-modal') {
        // Asegurar que el ancho del modal sea 90vw
        modalDialog.style.maxWidth = '90vw';
        modalDialog.style.width = '90vw';
    }
    
    // Agregar clase para el fondo oscuro
    document.body.classList.add('modal-open');
    document.body.style.overflow = 'hidden';
    document.body.style.paddingRight = '17px'; // Compensar la barra de desplazamiento
    
    // Crear backdrop si no existe
    let backdrop = document.querySelector('.modal-backdrop');
    if (!backdrop) {
        backdrop = document.createElement('div');
        backdrop.className = 'modal-backdrop fade show';
        backdrop.style.zIndex = '1040'; // Asegurar que el backdrop esté detrás del modal
        document.body.appendChild(backdrop);
        
        // Agregar evento de clic al backdrop para cerrar el modal
        backdrop.addEventListener('click', function() {
            hideModal(modalElement);
        });
    } else {
        backdrop.classList.add('show');
        backdrop.style.display = 'block';
    }
    
    // Asegurar que el modal esté por encima del backdrop
    modalElement.style.zIndex = '1050';
    
    // Agregar evento de teclado para cerrar con ESC
    document.addEventListener('keydown', function(event) {
        if (event.key === 'Escape') {
            hideModal(modalElement);
        }
    });
}

function hideModal(modalElement) {
    if (!modalElement) return;
    
    // Ocultar el modal
    modalElement.style.display = 'none';
    modalElement.classList.remove('show');
    modalElement.setAttribute('aria-hidden', 'true');
    modalElement.removeAttribute('aria-modal');
    modalElement.removeAttribute('role');
    
    // Remover clase del body
    document.body.classList.remove('modal-open');
    document.body.style.overflow = '';
    document.body.style.paddingRight = '';
    
    // Eliminar todos los backdrops existentes
    const backdrops = document.querySelectorAll('.modal-backdrop');
    backdrops.forEach(backdrop => {
        backdrop.parentNode.removeChild(backdrop);
    });
    
    // Remover el evento de teclado
    document.removeEventListener('keydown', function(event) {
        if (event.key === 'Escape') {
            hideModal(modalElement);
        }
    });
}

function closeAllModals() {
    if (typeof bootstrap !== 'undefined') {
        if (window.documentModalInstance) window.documentModalInstance.hide();
        if (window.confirmModalInstance) window.confirmModalInstance.hide();
        if (window.viewDocumentModalInstance) window.viewDocumentModalInstance.hide();
        if (window.loginModalInstance) window.loginModalInstance.hide();
    } else {
        const modals = [
            document.getElementById('document-modal'),
            document.getElementById('confirm-modal'),
            document.getElementById('view-document-modal'),
            document.getElementById('login-modal')
        ];
        
        modals.forEach(modal => {
            if (modal) hideModal(modal);
        });
    }
    
    // Limpiar el backdrop manualmente
    document.body.classList.remove('modal-open');
    const backdrops = document.querySelectorAll('.modal-backdrop');
    backdrops.forEach(backdrop => {
        backdrop.remove();
    });
}

// Actualizar la función para editar documento
function editDocument(id) {
    const documentToEdit = documents.find(doc => doc.id === id);
    if (!documentToEdit) return;
    
    currentDocumentId = id;
    
    // Llenar formulario con datos del documento
    if(document.getElementById('document-id')) document.getElementById('document-id').value = id;
    if(document.getElementById('document-nurej')) document.getElementById('document-nurej').value = documentToEdit.nurej;
    if(document.getElementById('document-tipo')) document.getElementById('document-tipo').value = documentToEdit.tipo;
    if(document.getElementById('document-descripcion')) document.getElementById('document-descripcion').value = documentToEdit.descripcion;
    if(document.getElementById('document-fecha')) document.getElementById('document-fecha').value = documentToEdit.fecha;
    
    // Mostrar vista previa del archivo actual
    if (documentPreview) documentPreview.classList.remove('d-none');
    
    if (documentToEdit.fileType.startsWith('image/')) {
        if (imagePreview) {
            imagePreview.src = documentToEdit.fileData;
            imagePreview.classList.remove('d-none');
        }
        if (pdfPreview) pdfPreview.classList.add('d-none');
    } else if (documentToEdit.fileType === 'application/pdf') {
        if (pdfName) pdfName.textContent = documentToEdit.fileName;
        if (pdfPreview) pdfPreview.classList.remove('d-none');
        if (imagePreview) imagePreview.classList.add('d-none');
    }
    
    // Actualizar título del modal
    if(document.getElementById('document-modal-title')) document.getElementById('document-modal-title').textContent = 'Editar Documento';
    
    // Mostrar modal usando la nueva función
    showDocumentModal();
}

function showDeleteConfirmation(id) {
    console.log('🔍 showDeleteConfirmation llamado con docId:', id);
    if (!id) return;
    
    const documentToDelete = documents.find(doc => doc.id === id);
    if (!documentToDelete) return;
    
    currentDocumentId = id;
    
    const confirmMsg = document.getElementById('confirm-message');
    if (confirmMsg) {
        confirmMsg.textContent = `¿Eliminar "${documentToDelete.descripcion}"?`;
    }
    
    showConfirmModal(); // Función unificada
}

function showConfirmModal() {
    const confirmModalElement = document.getElementById('confirm-modal');
    
    if (window.confirmModalInstance) {
        window.confirmModalInstance.show();
    } else if (confirmModalElement) {
        showModal(confirmModalElement);
    } else {
        console.error('❌ No se pudo mostrar el modal de confirmación');
    }
}

function deleteDocument() {
    console.log('🗑️ Eliminando documento ID:', currentDocumentId);
    
    if (!currentDocumentId) {
        console.error('❌ No hay ID de documento para eliminar');
        return;
    }

    const docIndex = documents.findIndex(doc => doc.id === currentDocumentId);
    if (docIndex === -1) {
        alert('Error: El documento no se encuentra');
        return;
    }
    
    // Eliminar documento
    documents = documents.filter(doc => doc.id !== currentDocumentId);
    saveDocumentsToStorage();
    renderDocuments();
    
    // Cerrar modal y limpiar backdrop
    closeAllModals();
    
    alert('Documento eliminado correctamente.');
    currentDocumentId = null;
}

// Actualizar la función para ver documento
function viewDocument(id) {
    const documentToView = documents.find(doc => doc.id === id);
    if (!documentToView) return;
    
    if(viewDocumentTitle) viewDocumentTitle.textContent = translateDocumentType(documentToView.tipo);
    if(documentContainer) documentContainer.innerHTML = '';
    
    if (documentToView.fileType.startsWith('image/')) {
        // Añadir clase para mostrar la imagen horizontalmente
        if(documentContainer) documentContainer.innerHTML = `
            <div class="image-container">
                <img src="${documentToView.fileData}" class="img-fluid" alt="${documentToView.descripcion}">
            </div>
        `;
        
        // Añadir estilos para asegurar que la imagen se muestre correctamente en el modal
        const style = document.createElement('style');
        style.textContent = `
            .image-container {
                display: flex;
                justify-content: center;
                align-items: center;
                height: 100%;
                width: 100%;
                overflow: auto;
                padding: 0;
                position: absolute;
                top: 0;
                left: 0;
                right: 0;
                bottom: 0;
            }
            .image-container img {
                max-width: 100%;
                max-height: 100%;
                object-fit: contain;
            }
        `;
        document.head.appendChild(style);
        
        // Asegurar que el contenedor ocupe todo el espacio disponible dentro del modal de 90vw
        documentContainer.style.height = '100%';
        documentContainer.style.width = '100%';
        documentContainer.style.maxWidth = '100%';
        documentContainer.style.maxHeight = '100%';
        documentContainer.style.position = 'absolute';
        documentContainer.style.top = '0';
        documentContainer.style.left = '0';
        documentContainer.style.right = '0';
        documentContainer.style.bottom = '0';
        documentContainer.style.overflow = 'auto';
    } else if (documentToView.fileType === 'application/pdf') {
        if(documentContainer) documentContainer.innerHTML = `
            <div style="height: 100%; width: 100%; padding: 0; margin: 0; position: absolute; top: 0; left: 0; right: 0; bottom: 0;">
                <iframe src="${documentToView.fileData}" title="${documentToView.descripcion}" style="width: 100%; height: 100%; border: none; display: block;" allowfullscreen></iframe>
            </div>
        `;
        
        // Asegurar que el contenedor ocupe todo el espacio disponible dentro del modal de 90vw
        documentContainer.style.height = '100%';
        documentContainer.style.width = '100%';
        documentContainer.style.maxWidth = '100%';
        documentContainer.style.maxHeight = '100%';
        documentContainer.style.position = 'absolute';
        documentContainer.style.top = '0';
        documentContainer.style.left = '0';
        documentContainer.style.right = '0';
        documentContainer.style.bottom = '0';
        documentContainer.style.overflow = 'auto';
    }
    
    if(documentDetails) documentDetails.textContent = `${documentToView.descripcion} - ${formatDate(documentToView.fecha)}`;
    
    // Mostrar modal usando la nueva función
    showViewDocumentModal();
}

// Actualizar UI según el usuario
function updateUIForUser() {
    const currentUser = JSON.parse(localStorage.getItem('currentUser') || 'null');
    
    if (currentUser && loginBtn) {
        loginBtn.textContent = currentUser.nombre;
        loginBtn.href = '#';
    } else if (loginBtn) {
        loginBtn.textContent = 'Iniciar Sesión';
    }
}

// Guardar documento
function saveDocument(e) {
    e.preventDefault();
    console.log('💾 Guardando documento...');
    
    const tipo = document.getElementById('document-tipo')?.value;
    const descripcion = document.getElementById('document-descripcion')?.value;
    const fecha = document.getElementById('document-fecha')?.value;
    const nurej = document.getElementById('document-nurej')?.value;
    
    console.log('📋 Datos del formulario:', { tipo, descripcion, fecha, nurej });
    
    // Validar campos requeridos
    if (!tipo || !descripcion || !fecha) {
        alert('Por favor, complete todos los campos requeridos.');
        return;
    }
    
    const fileInput = documentFile; // Usar la variable global ya definida

    // Si es edición y no se seleccionó un nuevo archivo, mantener el archivo existente
    if (currentDocumentId) {
        const existingDoc = documents.find(doc => doc.id === currentDocumentId);
        
        if (fileInput && !fileInput.files[0] && existingDoc) { // Chequear fileInput
            console.log('✏️ Actualizando documento existente sin nuevo archivo');
            // Actualizar documento existente
            existingDoc.tipo = tipo;
            existingDoc.descripcion = descripcion;
            existingDoc.fecha = fecha;
            
            // Guardar cambios usando la función que actualiza todos los documentos
            saveDocumentsToStorage();
            
            // Cerrar modal y actualizar vista
            console.log('🔍 Intentando cerrar modal después de guardar');
            console.log('- window.documentModalInstance disponible:', !!window.documentModalInstance);
            console.log('- documentModal disponible:', !!documentModal);
            
            if (window.documentModalInstance) {
                console.log('✅ Cerrando modal con instancia Bootstrap');
                window.documentModalInstance.hide();
            } else if (documentModal) {
                console.log('✅ Cerrando modal con función personalizada');
                hideModal(documentModal);
            } else {
                console.error('❌ No se pudo cerrar el modal de documento');
            }
            
            renderDocuments();
            console.log('✅ Documento guardado y vista actualizada');
            return;
        }
    }
    
    // Validar archivo
    if (fileInput && !fileInput.files[0] && !currentDocumentId) { // Chequear fileInput y si no es edición
        alert('Por favor, seleccione un archivo.');
        return;
    }
    
    const file = fileInput ? fileInput.files[0] : null; // Chequear fileInput
    const reader = new FileReader();
    
    reader.onload = function(eventReader) {
        const fileData = eventReader.target.result;
        
        // Crear nuevo documento o actualizar existente
        if (currentDocumentId) {
            // Actualizar documento existente
            const index = documents.findIndex(doc => doc.id === currentDocumentId);
            if (index !== -1) {
                documents[index] = {
                    ...documents[index],
                    tipo,
                    descripcion,
                    fecha,
                    fileData: file ? fileData : documents[index].fileData, // Conservar fileData si no se sube nuevo archivo
                    fileType: file ? file.type : documents[index].fileType,
                    fileName: file ? file.name : documents[index].fileName,
                    lastModified: new Date().toISOString()
                };
            }
        } else {
            // Crear nuevo documento
            if (!file) { 
                alert('Error: No se seleccionó archivo para el nuevo documento.');
                return;
            }
            const newDocument = {
                id: Date.now().toString(),
                nurej,
                tipo,
                descripcion,
                fecha,
                fileData,
                fileType: file.type,
                fileName: file.name,
                createdAt: new Date().toISOString(),
                lastModified: new Date().toISOString()
            };
            
            documents.push(newDocument);
        }
        
        // Guardar en localStorage usando la función que actualiza todos los documentos
        saveDocumentsToStorage();
        
        // Cerrar modal y actualizar vista
        if (window.documentModalInstance) {
            console.log('✅ Cerrando modal con instancia Bootstrap');
            window.documentModalInstance.hide();
        } else if (documentModal) {
            console.log('✅ Cerrando modal con función personalizada');
            hideModal(documentModal);
        } else {
            console.error('❌ No se pudo cerrar el modal de documento');
        }
        
        renderDocuments();
        
        // Mostrar mensaje de confirmación
        alert('Documento guardado correctamente.');
        console.log('✅ Documento guardado y vista actualizada');
    };
    
    if (file) { // Solo leer si hay un archivo
        reader.readAsDataURL(file);
    } else if (currentDocumentId) { // Si es edición sin nuevo archivo, solo guardar y renderizar
        saveDocumentsToStorage();
        
        // Cerrar modal y actualizar vista
        console.log('🔍 Intentando cerrar modal después de guardar');
        console.log('- window.documentModalInstance disponible:', !!window.documentModalInstance);
        console.log('- documentModal disponible:', !!documentModal);
        
        if (window.documentModalInstance) {
            console.log('✅ Cerrando modal con instancia Bootstrap');
            window.documentModalInstance.hide();
        } else if (documentModal) {
            console.log('✅ Cerrando modal con función personalizada');
            hideModal(documentModal);
        } else {
            console.error('❌ No se pudo cerrar el modal de documento');
        }
        
        renderDocuments();
        
        // Mostrar mensaje de confirmación
        alert('Documento guardado correctamente.');
        console.log('✅ Documento guardado y vista actualizada');
    }
}

function previewFile() {
    const file = documentFile.files[0];
    if (!file) return;
    
    const reader = new FileReader();
    
    reader.onload = function(e) {
        documentPreview.classList.remove('d-none');
        
        if (file.type.startsWith('image/')) {
            imagePreview.src = e.target.result;
            imagePreview.classList.remove('d-none');
            pdfPreview.classList.add('d-none');
        } else if (file.type === 'application/pdf') {
            pdfName.textContent = file.name;
            pdfPreview.classList.remove('d-none');
            imagePreview.classList.add('d-none');
        }
    };
    
    reader.readAsDataURL(file);
}

// Actualizar la función para mostrar el modal de documento
function showDocumentModal() {
    // Verificar si existe la instancia de Bootstrap
    if (typeof bootstrap !== 'undefined') {
        // Intentar usar la instancia global primero
        if (window.documentModalInstance) {
            console.log('📋 Mostrando modal con instancia global de Bootstrap');
            window.documentModalInstance.show();
        } 
        // Si no existe la instancia global, intentar crear una nueva
        else if (documentModal) {
            console.log('📋 Creando nueva instancia de modal Bootstrap');
            
            // Asegurar que los estilos personalizados se apliquen antes de crear la instancia
            if (documentModal.id === 'view-document-modal') {
                const modalDialog = documentModal.querySelector('.modal-dialog');
                if (modalDialog) {
                    // Asegurar que el ancho del modal sea 90vw
                    modalDialog.style.maxWidth = '90vw';
                    modalDialog.style.width = '90vw';
                }
            }
            
            window.documentModalInstance = new bootstrap.Modal(documentModal, {
                backdrop: true,
                keyboard: true
            });
            window.documentModalInstance.show();
        }
    } 
    // Si no está disponible Bootstrap, usar la función personalizada
    else if (documentModal) {
        console.log('📋 Mostrando modal con función personalizada');
        showModal(documentModal);
    } else {
        console.error('❌ No se encontró el modal de documento');
    }
}

// Actualizar la función para mostrar el modal de visualización
function showViewDocumentModal() {
    if (window.viewDocumentModalInstance) {
        // Asegurar que los estilos personalizados se mantengan antes de mostrar el modal
        if (viewDocumentModal) {
            const modalDialog = viewDocumentModal.querySelector('.modal-dialog');
            if (modalDialog) {
                // Asegurar que el ancho del modal sea 90vw
                modalDialog.style.maxWidth = '90vw';
                modalDialog.style.width = '90vw';
            }
        }
        window.viewDocumentModalInstance.show();
    } else if (viewDocumentModal) {
        showModal(viewDocumentModal);
    }
}

// Actualizar la función para mostrar el modal de login
function showLoginModal() {
    if (window.loginModalInstance) {
        window.loginModalInstance.show();
    } else if (loginModal) {
        showModal(loginModal);
    }
}

// Funciones auxiliares
function formatDate(dateString) {
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateString).toLocaleDateString('es-ES', options);
}

function translateDocumentType(tipo) {
    const types = {
        'memorial': 'Memorial',
        'resolucion': 'Resolución',
        'notificacion': 'Notificación',
        'citacion': 'Citación',
        'otro': 'Otro'
    };
    
    return types[tipo] || tipo;
}

// Guardar documentos en localStorage
function saveDocumentsToStorage() {
    try {
        // Obtener todos los documentos existentes
        console.log('💾 Guardando documentos en localStorage...');
        const allDocuments = JSON.parse(localStorage.getItem('documents') || '[]');
        
        // Filtrar documentos que no sean del NUREJ actual
        const otherDocuments = allDocuments.filter(doc => doc.nurej !== currentNurej);
        
        // Combinar con los documentos actuales
        const updatedDocuments = [...otherDocuments, ...documents];
        
        // Guardar en localStorage
        localStorage.setItem('documents', JSON.stringify(updatedDocuments));
        
        console.log('✅ Documentos guardados correctamente:', updatedDocuments.length, 'documentos en total');
        console.log('- Documentos del NUREJ actual:', documents.length);
        console.log('- Documentos de otros NUREJ:', otherDocuments.length);
    } catch (error) {
        console.error('❌ Error al guardar documentos:', error);
        alert('Error al guardar el documento. Por favor, intente nuevamente.');
    }
}

function cleanupFilePreview() {
    if (documentPreview) {
        documentPreview.classList.add('d-none');
        if (imagePreview) imagePreview.classList.add('d-none');
        if (pdfPreview) pdfPreview.classList.add('d-none');
    }
}
// Inicializar la página cuando el DOM esté cargado
//document.addEventListener('DOMContentLoaded', init);

// Inicializar la aplicación cuando el DOM esté cargado
document.addEventListener('DOMContentLoaded', initializeApp);
window.showDeleteConfirmation = showDeleteConfirmation;