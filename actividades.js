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
const confirmOk = document.getElementById('confirm-ok');
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
function init() {
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
    
    loadDocuments();
    initializeModals();
    setupEventListeners();
    updateUIForUser();
}

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
    col.className = 'col-md-6 col-lg-4 mb-3';
    
    const fileIcon = doc.fileType.startsWith('image/') ? 'fas fa-image' : 'fas fa-file-pdf';
    const fileColor = doc.fileType.startsWith('image/') ? 'text-primary' : 'text-danger';
    
    col.innerHTML = `
        <div class="card h-100 shadow-sm">
            <div class="card-body d-flex flex-column">
                <div class="text-center mb-3">
                    <i class="${fileIcon} fa-3x ${fileColor}"></i>
                </div>
                <h6 class="card-title text-center">${translateDocumentType(doc.tipo)}</h6>
                <p class="card-text flex-grow-1">${doc.descripcion}</p>
                <div class="mt-auto">
                    <small class="text-muted d-block mb-2">
                        <i class="fas fa-calendar me-1"></i>${formatDate(doc.fecha)}
                    </small>
                    <small class="text-muted d-block mb-3">
                        <i class="fas fa-file me-1"></i>${doc.fileName}
                    </small>
                    <div class="btn-group w-100" role="group">
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
                backdrop: 'static',
                keyboard: false
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

                if (!window.documentModalInstance && elementos.documentModal) {
                    console.log('📋 Creando nueva instancia de modal');
                    window.documentModalInstance = new bootstrap.Modal(elementos.documentModal, {
                        backdrop: 'static',
                        keyboard: false
                    });
                }
                if (window.documentModalInstance) {
                    console.log('📋 Mostrando modal');
                    window.documentModalInstance.show();
                } else {
                    console.error('❌ No se puede crear la instancia del modal');
                    alert('Error: No se pudo inicializar el formulario de documento.');
                }
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
                console.log('❌ Cerrando modal');
                const modalId = button.closest('.modal')?.id;
                if (modalId) {
                    switch (modalId) {
                        case 'document-modal':
                            if (documentModalInstance) documentModalInstance.hide();
                            break;
                        case 'confirm-modal':
                            if (confirmModalInstance) confirmModalInstance.hide();
                            break;
                        case 'view-document-modal':
                            if (viewDocumentModalInstance) viewDocumentModalInstance.hide();
                            break;
                        case 'login-modal':
                            if (loginModalInstance) loginModalInstance.hide();
                            break;
                    }
                }
                cleanupFilePreview();
            });
        });
    }

    if (elementos.confirmCancel) {
        elementos.confirmCancel.addEventListener('click', () => {
            if (confirmModalInstance) confirmModalInstance.hide();
        });
    }

    if (elementos.confirmOk) {
        elementos.confirmOk.addEventListener('click', deleteDocument);
    }

    if (elementos.loginBtn) {
        elementos.loginBtn.addEventListener('click', (e) => {
            e.preventDefault();
            if (loginModalInstance) loginModalInstance.show();
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
function initializeApp() {
    // Solo ejecutar si el DOM está listo
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => {
            setupEventListeners();
            initializeBootstrapDropdowns();
        });
    } else {
        // El DOM ya está listo
        setupEventListeners();
        initializeBootstrapDropdowns();
    }
}

// Función para cerrar todos los modales----------------------------------------------
function closeAllModals() {
    if (typeof bootstrap !== 'undefined') {
        if (documentModalInstance) documentModalInstance.hide();
        if (confirmModalInstance) confirmModalInstance.hide();
        if (viewDocumentModalInstance) viewDocumentModalInstance.hide();
        if (loginModalInstance) loginModalInstance.hide();
    } else {
        // Fallback al método anterior
        if (documentModal) documentModal.style.display = 'none';
        if (confirmModal) confirmModal.style.display = 'none';
        if (viewDocumentModal) viewDocumentModal.style.display = 'none';
        if (loginModal) loginModal.style.display = 'none';
        document.body.classList.remove('modal-open');
    }
}


// Función para vista previa de archivo - INTEGRADA CON TU CÓDIGO ORIGINAL
function previewFile() {
    console.log('🖼️ previewFile iniciado');
    
    const file = documentFile.files[0];
    if (!file) {
        console.log('📁 No hay archivo seleccionado');
        if (documentPreview) documentPreview.classList.add('d-none');
        return;
    }
    
    console.log('📁 Archivo detectado:', {
        name: file.name,
        size: file.size,
        type: file.type,
        sizeMB: (file.size / (1024 * 1024)).toFixed(2) + ' MB'
    });
    
    // Validar tamaño (máximo 5MB)
    if (file.size > 5 * 1024 * 1024) {
        console.log('❌ Archivo demasiado grande:', file.size);
        alert('El archivo es demasiado grande. El tamaño máximo permitido es 5MB.');
        documentFile.value = '';
        if (documentPreview) documentPreview.classList.add('d-none');
        return;
    }
    
    console.log('🖼️ Elementos DOM disponibles:', {
        documentPreview: !!documentPreview,
        imagePreview: !!imagePreview,
        pdfPreview: !!pdfPreview,
        pdfName: !!pdfName
    });
    
    if (file.type.startsWith('image/')) {
        console.log('🖼️ Procesando imagen...');
        handleImagePreview(file);
    } else if (file.type === 'application/pdf') {
        console.log('📄 Procesando PDF...');
        handlePDFPreview(file);
    } else {
        console.log('❌ Formato no soportado:', file.type);
        alert('Formato de archivo no soportado. Por favor, suba una imagen o un PDF.');
        documentFile.value = '';
        if (documentPreview) documentPreview.classList.add('d-none');
        return;
    }
}

// Función auxiliar para manejar imágenes
function handleImagePreview(file) {
    console.log('🖼️ Iniciando preview de imagen');
    
    const reader = new FileReader();
    
    reader.onload = function(e) {
        console.log('🖼️ Imagen cargada exitosamente');
        
        if (!documentPreview) {
            console.error('❌ documentPreview no existe');
            return;
        }
        
        try {
            documentPreview.classList.remove('d-none');
            
            if (imagePreview) {
                imagePreview.src = e.target.result;
                imagePreview.classList.remove('d-none');
                
                // Aplicar estilos seguros
                imagePreview.style.maxWidth = '100%';
                imagePreview.style.maxHeight = '400px';
                imagePreview.style.objectFit = 'contain';
                
                console.log('🖼️ Preview de imagen configurado');
            } else {
                console.error('❌ imagePreview no existe');
            }
            
            if (pdfPreview) pdfPreview.classList.add('d-none');
            
        } catch (error) {
            console.error('❌ Error al configurar imagen:', error);
            alert('Error al mostrar la imagen');
        }
    };
    
    reader.onerror = function(error) {
        console.error('❌ Error al cargar imagen:', error);
        alert('Error al cargar la imagen');
    };
    
    // Usar setTimeout para evitar bloqueo
    setTimeout(() => {
        try {
            console.log('🖼️ Iniciando readAsDataURL');
            reader.readAsDataURL(file);
        } catch (error) {
            console.error('❌ Error en readAsDataURL:', error);
        }
    }, 50);
}

// Función auxiliar para manejar PDFs
function handlePDFPreview(file) {
    console.log('📄 Iniciando preview de PDF');
    
    if (!documentPreview) {
        console.error('❌ documentPreview no existe');
        return;
    }
    
    try {
        documentPreview.classList.remove('d-none');
        
        // Mostrar nombre del PDF
        if (pdfName) {
            pdfName.textContent = file.name;
            console.log('📄 Nombre del PDF configurado:', file.name);
        }
        
        // Manejar preview del PDF
        if (pdfPreview) {
            pdfPreview.classList.remove('d-none');
            console.log('📄 pdfPreview mostrado');
        } else {
            console.error('❌ pdfPreview no existe');
        }
        
        // Ocultar imagen preview
        if (imagePreview) {
            imagePreview.classList.add('d-none');
        }
        
        console.log('📄 Preview de PDF configurado correctamente');
        
    } catch (error) {
        console.error('❌ Error al configurar PDF preview:', error);
        alert('Error al mostrar el PDF');
        
        // Fallback
        if (documentPreview) documentPreview.classList.add('d-none');
    }
}

// Función de diagnóstico completo
function diagnosticarElementos() {
    console.log('🔍 === DIAGNÓSTICO COMPLETO DE ELEMENTOS ===');
    
    // Elementos principales para el modal
    const elementos = {
        // Botones principales
        addDocumentBtn: document.getElementById('add-document-btn') || document.querySelector('[data-bs-target="#document-modal"]') || document.querySelector('.btn-agregar-documento'),
        loginBtn: document.getElementById('login-btn') || document.querySelector('[data-bs-target="#login-modal"]'),
        
        // Modal y formulario
        documentModal: document.getElementById('document-modal'),
        documentForm: document.getElementById('document-form') || document.querySelector('#document-modal form'),
        documentFile: document.getElementById('document-file') || document.querySelector('input[type="file"]'),
        
        // Elementos de preview
        documentPreview: document.getElementById('document-preview') || document.querySelector('.document-preview'),
        imagePreview: document.getElementById('image-preview') || document.querySelector('.image-preview') || document.querySelector('img[id*="preview"]'),
        pdfPreview: document.getElementById('pdf-preview') || document.querySelector('.pdf-preview'),
        pdfName: document.getElementById('pdf-name') || document.querySelector('.pdf-name'),
        
        // Botones de cerrar
        closeModalButtons: document.querySelectorAll('[data-bs-dismiss="modal"]') || document.querySelectorAll('.btn-close'),
        
        // Elementos de confirmación
        confirmCancel: document.getElementById('confirm-cancel') || document.querySelector('#confirm-modal .btn-secondary'),
        confirmOk: document.getElementById('confirm-ok') || document.querySelector('#confirm-modal .btn-danger'),
        
        // Campos del formulario
        documentNurej: document.getElementById('document-nurej'),
        documentFecha: document.getElementById('document-fecha'),
        documentModalTitle: document.getElementById('document-modal-title') || document.querySelector('#document-modal .modal-title')
    };
    
    // Mostrar resultados
    console.log('📋 Elementos encontrados:');
    for (const [nombre, elemento] of Object.entries(elementos)) {
        const existe = !!elemento;
        const cantidad = elemento?.length !== undefined ? elemento.length : (existe ? 1 : 0);
        
        console.log(`${existe ? '✅' : '❌'} ${nombre}:`, {
            existe,
            cantidad,
            id: elemento?.id || 'sin ID',
            clase: elemento?.className || 'sin clase',
            tag: elemento?.tagName || 'N/A'
        });
        
        // Para NodeList, mostrar cada elemento
        if (elemento?.length !== undefined && elemento.length > 0) {
            [...elemento].forEach((el, i) => {
                console.log(`   ${i + 1}. ID: ${el.id || 'sin ID'}, Clase: ${el.className || 'sin clase'}`);
            });
        }
    }
    
    // Verificar instancias de Bootstrap Modal
    console.log('🎭 Instancias de Modal de Bootstrap:');
    console.log('documentModalInstance:', typeof documentModalInstance, documentModalInstance);
    console.log('loginModalInstance:', typeof loginModalInstance, loginModalInstance);
    console.log('confirmModalInstance:', typeof confirmModalInstance, confirmModalInstance);
    console.log('viewDocumentModalInstance:', typeof viewDocumentModalInstance, viewDocumentModalInstance);
    
    // Buscar modales en el DOM
    console.log('🔍 Modales encontrados en el DOM:');
    const modales = document.querySelectorAll('.modal');
    modales.forEach((modal, i) => {
        console.log(`${i + 1}. Modal:`, {
            id: modal.id,
            clase: modal.className,
            visible: !modal.classList.contains('d-none') && modal.style.display !== 'none'
        });
    });
    
    // Verificar si Bootstrap está cargado
    console.log('🥾 Bootstrap disponible:', typeof bootstrap !== 'undefined', typeof bootstrap);
    
    return elementos;
}

// Ejecutar diagnóstico inmediatamente cuando se cargue
document.addEventListener('DOMContentLoaded', () => {
    console.log('📄 DOM cargado, ejecutando diagnóstico...');
    setTimeout(diagnosticarElementos, 1000); // Esperar 1 segundo para que todo se cargue
    init();
});

// También permitir ejecutar manualmente
window.diagnosticar = diagnosticarElementos;

// Función de limpieza mejorada
function cleanupFilePreview() {
    console.log('🧹 Limpiando recursos de preview');
    
    if (imagePreview && imagePreview.src) {
        if (imagePreview.src.startsWith('blob:')) {
            URL.revokeObjectURL(imagePreview.src);
        }
        imagePreview.src = '';
        imagePreview.classList.add('d-none');
    }
    
    if (pdfPreview) {
        pdfPreview.classList.add('d-none');
    }
    
    if (pdfName) {
        pdfName.textContent = '';
    }
    
    if (documentPreview) {
        documentPreview.classList.add('d-none');
    }
    
    console.log('🧹 Limpieza completada');
}

// Función separada para manejar imágenes
function previewImageFile(file) {
    console.log('🖼️ Iniciando preview de imagen');
    
    if (!imagePreview) {
        console.error('❌ imagePreview no existe');
        return;
    }
    
    // Ocultar PDF preview
    if (pdfPreview) pdfPreview.classList.add('d-none');
    
    const reader = new FileReader();
    
    reader.onload = function(e) {
        console.log('🖼️ Imagen cargada exitosamente');
        try {
            imagePreview.src = e.target.result;
            imagePreview.classList.remove('d-none');
            
            // Aplicar estilos para evitar que la imagen sea demasiado grande
            imagePreview.style.maxWidth = '100%';
            imagePreview.style.maxHeight = '400px';
            imagePreview.style.objectFit = 'contain';
            
            console.log('🖼️ Preview de imagen configurado correctamente');
        } catch (error) {
            console.error('❌ Error al configurar imagen:', error);
            alert('Error al mostrar la imagen');
        }
    };
    
    reader.onerror = function(error) {
        console.error('❌ Error al cargar imagen:', error);
        alert('Error al cargar la imagen');
        if (documentPreview) documentPreview.classList.add('d-none');
    };
    
    reader.onabort = function() {
        console.log('⏹️ Carga de imagen abortada');
    };
    
    // Usar timeout para evitar bloqueo
    setTimeout(() => {
        try {
            console.log('🖼️ Iniciando readAsDataURL para imagen');
            reader.readAsDataURL(file);
        } catch (error) {
            console.error('❌ Error en readAsDataURL:', error);
            alert('Error al procesar la imagen');
        }
    }, 50);
}

// Función separada para manejar PDFs
function previewPDFFile(file) {
    console.log('📄 Iniciando preview de PDF');
    
    // Ocultar imagen preview
    if (imagePreview) imagePreview.classList.add('d-none');
    
    if (!pdfPreview) {
        console.error('❌ pdfPreview no existe');
        // Fallback: solo mostrar el nombre del archivo
        if (pdfName) {
            pdfName.textContent = file.name;
            console.log('📄 Solo mostrando nombre del PDF:', file.name);
        }
        return;
    }
    
    try {
        // Para PDFs, crear URL del objeto en lugar de readAsDataURL
        const objectURL = URL.createObjectURL(file);
        console.log('📄 Object URL creado para PDF:', objectURL);
        
        // Si pdfPreview es un iframe o embed
        if (pdfPreview.tagName === 'IFRAME' || pdfPreview.tagName === 'EMBED') {
            pdfPreview.src = objectURL;
            pdfPreview.classList.remove('d-none');
            console.log('📄 PDF cargado en iframe/embed');
        } 
        // Si es un enlace
        else if (pdfPreview.tagName === 'A') {
            pdfPreview.href = objectURL;
            pdfPreview.textContent = `Ver ${file.name}`;
            pdfPreview.target = '_blank';
            pdfPreview.classList.remove('d-none');
            console.log('📄 PDF configurado como enlace');
        }
        
        // Mostrar nombre del archivo si existe el elemento
        if (pdfName) {
            pdfName.textContent = file.name;
        }
        
        // Limpiar la URL después de 30 segundos para liberar memoria
        setTimeout(() => {
            URL.revokeObjectURL(objectURL);
            console.log('📄 Object URL liberado de memoria');
        }, 30000);
        
        console.log('📄 Preview de PDF configurado correctamente');
        
    } catch (error) {
        console.error('❌ Error al crear preview de PDF:', error);
        alert('Error al mostrar el PDF');
        
        // Fallback: solo mostrar nombre
        if (pdfName) {
            pdfName.textContent = file.name;
        }
        if (pdfPreview) {
            pdfPreview.classList.add('d-none');
        }
    }
}

// Función para limpiar recursos cuando se cierre el modal
function cleanupFilePreview() {
    console.log('🧹 Limpiando recursos de preview');
    
    if (imagePreview && imagePreview.src) {
        if (imagePreview.src.startsWith('blob:')) {
            URL.revokeObjectURL(imagePreview.src);
        }
        imagePreview.src = '';
        imagePreview.classList.add('d-none');
    }
    
    if (pdfPreview) {
        if (pdfPreview.src && pdfPreview.src.startsWith('blob:')) {
            URL.revokeObjectURL(pdfPreview.src);
        }
        if (pdfPreview.href && pdfPreview.href.startsWith('blob:')) {
            URL.revokeObjectURL(pdfPreview.href);
        }
        pdfPreview.src = '';
        pdfPreview.href = '';
        pdfPreview.classList.add('d-none');
    }
    
    if (pdfName) {
        pdfName.textContent = '';
    }
    
    if (documentPreview) {
        documentPreview.classList.add('d-none');
    }
}

// Función de inicialización actualizada
function setupEventListeners() {
    console.log('🔧 setupEventListeners iniciado');
    
    // ... resto de tu código ...
    
    // Evento para vista previa de archivo
    if (documentFile) {
        console.log('📁 Configurando evento de archivo');
        documentFile.addEventListener('change', previewFile);
    }
    
    // ... resto de tu código ...
}

// Agregar limpieza cuando se cierre el modal
document.addEventListener('DOMContentLoaded', () => {
    const documentModal = document.getElementById('document-modal');
    if (documentModal) {
        documentModal.addEventListener('hidden.bs.modal', cleanupFilePreview);
        console.log('🧹 Limpieza automática configurada para el modal');
    }
});

// Guardar documento
function saveDocument(e) {
    e.preventDefault();
    
    const tipo = document.getElementById('document-tipo')?.value;
    const descripcion = document.getElementById('document-descripcion')?.value;
    const fecha = document.getElementById('document-fecha')?.value;
    const nurej = document.getElementById('document-nurej')?.value;
    
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
            // Actualizar documento existente
            existingDoc.tipo = tipo;
            existingDoc.descripcion = descripcion;
            existingDoc.fecha = fecha;
            
            // Guardar cambios
            localStorage.setItem('documents', JSON.stringify(documents));
            
            // Cerrar modal y actualizar vista
            if (documentModalInstance) {
                documentModalInstance.hide();
            }
            renderDocuments();
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
            if (!file) { // Asegurarse que hay archivo para nuevo documento
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
        
        // Guardar en localStorage
        localStorage.setItem('documents', JSON.stringify(documents));
        
        // Cerrar modal y actualizar vista
        if (documentModalInstance) {
            documentModalInstance.hide();
        }
        renderDocuments();
    };
    
    if (file) { // Solo leer si hay un archivo
        reader.readAsDataURL(file);
    } else if (currentDocumentId) { // Si es edición sin nuevo archivo, solo guardar y renderizar
        localStorage.setItem('documents', JSON.stringify(documents));
        if (documentModalInstance) {
            documentModalInstance.hide();
        }
        renderDocuments();
    }
}

// Guardar documentos en localStorage
function saveDocumentsToStorage() {
    try {
        // Obtener todos los documentos existentes
        const allDocuments = JSON.parse(localStorage.getItem('documents') || '[]');
        
        // Filtrar documentos que no sean del NUREJ actual
        const otherDocuments = allDocuments.filter(doc => doc.nurej !== currentNurej);
        
        // Combinar con los documentos actuales
        const updatedDocuments = [...otherDocuments, ...documents];
        
        // Guardar en localStorage
        localStorage.setItem('documents', JSON.stringify(updatedDocuments));
        
        console.log('Documentos guardados correctamente');
    } catch (error) {
        console.error('Error al guardar documentos:', error);
        alert('Error al guardar el documento. Por favor, intente nuevamente.');
    }
}

// Editar documento
function editDocument(id) {
    const documentToEdit = documents.find(doc => doc.id === id); // Renombrar variable para evitar conflicto
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
    
    // Mostrar modal
    if (documentModalInstance) {
        documentModalInstance.show();
    }
}

// Mostrar confirmación de eliminación
function showDeleteConfirmation(id) {
    currentDocumentId = id;
    if(confirmMessage) confirmMessage.textContent = '¿Está seguro que desea eliminar este documento?';
    
    if (confirmModalInstance) {
        confirmModalInstance.show();
    }
}

// Eliminar documento
function deleteDocument() {
    if (!currentDocumentId) return;
    
    documents = documents.filter(doc => doc.id !== currentDocumentId);
    localStorage.setItem('documents', JSON.stringify(documents));
    
    if (confirmModalInstance) {
        confirmModalInstance.hide();
    }
    renderDocuments();
    currentDocumentId = null;
}

// Ver documento
function viewDocument(id) {
    const documentToView = documents.find(doc => doc.id === id); // Renombrar variable
    if (!documentToView) return;
    
    if(viewDocumentTitle) viewDocumentTitle.textContent = translateDocumentType(documentToView.tipo);
    if(documentContainer) documentContainer.innerHTML = ''; // El de visualización
    
    if (documentToView.fileType.startsWith('image/')) {
        if(documentContainer) documentContainer.innerHTML = `<img src="${documentToView.fileData}" class="img-fluid" alt="${documentToView.descripcion}">`;
    } else if (documentToView.fileType === 'application/pdf') {
        if(documentContainer) documentContainer.innerHTML = `
            <div class="ratio ratio-16x9">
                <iframe src="${documentToView.fileData}" title="${documentToView.descripcion}" allowfullscreen></iframe>
            </div>
        `;
    }
    
    if(documentDetails) documentDetails.textContent = `${documentToView.descripcion} - ${formatDate(documentToView.fecha)}`;
    
    if (viewDocumentModalInstance) {
        viewDocumentModalInstance.show();
    }
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

// Inicializar la página cuando el DOM esté cargado
document.addEventListener('DOMContentLoaded', init);