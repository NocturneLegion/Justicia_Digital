const express = require('express');
const router = express.Router();
const casosController = require('../controllers/casos.controller');
const { authenticateToken } = require('../middleware/auth');

// Rutas para casos (todas requieren autenticación)
router.post('/', authenticateToken, casosController.crearCaso);
router.get('/', authenticateToken, casosController.obtenerCasos);
router.put('/:id', authenticateToken, casosController.actualizarCaso);
router.delete('/:id', authenticateToken, casosController.eliminarCaso);

module.exports = router;