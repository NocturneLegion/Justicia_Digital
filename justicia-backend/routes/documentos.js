const express = require('express');
const router = express.Router();
const documentosController = require('../controllers/documentos.controller');
const upload = require('../middleware/upload');
const authMiddleware = require('../middleware/auth');

// Ruta para subir documentos
router.post('/', authMiddleware.verifyToken, upload.fields([{ name: 'file', maxCount: 1 }]), documentosController.subirDocumento);

// Ruta para obtener documentos por nurej
router.get('/', authMiddleware.verifyToken, documentosController.obtenerDocumentosPorNurej);

// Ruta para obtener un documento específico por ID
router.get('/:id', authMiddleware.verifyToken, documentosController.obtenerDocumentoPorId);

// Ruta para obtener el archivo binario de un documento
router.get('/:id/file', authMiddleware.verifyToken, documentosController.obtenerArchivo);

// Ruta para actualizar un documento
router.put('/:id', authMiddleware.verifyToken, upload.fields([{ name: 'file', maxCount: 1 }]), documentosController.actualizarDocumento);

// Ruta para eliminar un documento
router.delete('/:id', authMiddleware.verifyToken, documentosController.eliminarDocumento);

module.exports = router;