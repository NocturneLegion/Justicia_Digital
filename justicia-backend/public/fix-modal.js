// Script para forzar el ancho del modal de documentos
console.log('Fix modal script iniciado');

// Función para aplicar estilos al modal
function applyModalStyles() {
    const modal = document.getElementById('documentViewModal');
    if (modal) {
        const modalDialog = modal.querySelector('.modal-dialog');
        const modalContent = modal.querySelector('.modal-content');
        const modalBody = modal.querySelector('.modal-body');
        const iframe = modal.querySelector('#document-frame');
        
        if (modalDialog) {
            modalDialog.style.setProperty('max-width', '95vw', 'important');
            modalDialog.style.setProperty('width', '95vw', 'important');
            modalDialog.style.setProperty('height', '90vh', 'important');
            modalDialog.style.setProperty('margin', '2.5vh auto', 'important');
            console.log('Estilos aplicados al modal-dialog');
        }
        
        if (modalContent) {
            modalContent.style.setProperty('height', '90vh', 'important');
            modalContent.style.setProperty('width', '100%', 'important');
            console.log('Estilos aplicados al modal-content');
        }
        
        if (modalBody) {
            modalBody.style.setProperty('height', 'calc(90vh - 120px)', 'important');
            modalBody.style.setProperty('padding', '0', 'important');
            modalBody.style.setProperty('overflow', 'hidden', 'important');
            console.log('Estilos aplicados al modal-body');
        }
        
        if (iframe) {
            iframe.style.setProperty('height', '100%', 'important');
            iframe.style.setProperty('width', '100%', 'important');
            iframe.style.setProperty('border', 'none', 'important');
            console.log('Estilos aplicados al iframe');
        }
    }
}

// Aplicar estilos cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', function() {
    console.log('DOM cargado, aplicando estilos');
    applyModalStyles();
    
    // También aplicar cuando se muestre el modal
    const modal = document.getElementById('documentViewModal');
    if (modal) {
        modal.addEventListener('show.bs.modal', function() {
            console.log('Modal mostrándose, aplicando estilos');
            setTimeout(applyModalStyles, 10);
        });
        
        modal.addEventListener('shown.bs.modal', function() {
            console.log('Modal mostrado, aplicando estilos');
            applyModalStyles();
        });
    }
});

// Aplicar estilos inmediatamente si el DOM ya está cargado
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', applyModalStyles);
} else {
    applyModalStyles();
}

// Aplicar estilos cada vez que se haga clic en un botón de ver archivo
document.addEventListener('click', function(e) {
    if (e.target.closest('[data-bs-target="#documentViewModal"]')) {
        console.log('Botón de ver archivo clickeado, aplicando estilos');
        setTimeout(applyModalStyles, 100);
    }
});

console.log('Fix modal script configurado');