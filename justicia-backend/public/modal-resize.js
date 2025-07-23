// Script para forzar el tamaño del modal de documentos
document.addEventListener('DOMContentLoaded', function() {
    console.log('Modal resize script cargado');
    
    const documentModal = document.getElementById('documentViewModal');
    if (documentModal) {
        console.log('Modal encontrado, configurando eventos');
        
        // Evento cuando el modal se muestra
        documentModal.addEventListener('shown.bs.modal', function() {
            console.log('Modal mostrado, aplicando estilos');
            
            const modalDialog = this.querySelector('.modal-dialog');
            const modalContent = this.querySelector('.modal-content');
            const modalBody = this.querySelector('.modal-body');
            const iframe = this.querySelector('#document-frame');
            
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
        });
        
        // También aplicar estilos cuando se abre el modal
        documentModal.addEventListener('show.bs.modal', function() {
            console.log('Modal abriéndose, pre-aplicando estilos');
            
            const modalDialog = this.querySelector('.modal-dialog');
            if (modalDialog) {
                modalDialog.style.setProperty('max-width', '95vw', 'important');
                modalDialog.style.setProperty('width', '95vw', 'important');
            }
        });
    } else {
        console.error('Modal documentViewModal no encontrado');
    }
});

// También aplicar estilos inmediatamente si el modal ya existe
setTimeout(function() {
    const documentModal = document.getElementById('documentViewModal');
    if (documentModal) {
        const modalDialog = documentModal.querySelector('.modal-dialog');
        if (modalDialog) {
            modalDialog.style.setProperty('max-width', '95vw', 'important');
            modalDialog.style.setProperty('width', '95vw', 'important');
            console.log('Estilos aplicados inmediatamente');
        }
    }
}, 100);