// justicia-backend/routes/usuarios.js
const express = require('express');
const router = express.Router();
const usuariosController = require('../controllers/usuarios.controller');
const { verifyToken, checkRole } = require('../middleware/auth');

// --- Validación de funciones del controlador ---
const validarControlador = () => {
    const funcionesRequeridas = ['obtenerUsuarios', 'crearUsuario', 'actualizarUsuario', 'eliminarUsuario'];
    
    for (const funcion of funcionesRequeridas) {
        if (!usuariosController[funcion] || typeof usuariosController[funcion] !== 'function') {
            throw new Error(`La función ${funcion} no está definida en usuarios.controller`);
        }
    }
};

// Ejecutar validación
try {
    validarControlador();
} catch (error) {
    console.error('Error en usuarios.controller:', error.message);
    process.exit(1);
}

// --- Definición de Rutas para Usuarios ---

// Aplicamos un middleware para proteger todas las rutas de usuarios.
router.use(verifyToken);

// GET /api/usuarios
router.get('/', usuariosController.obtenerUsuarios);

// POST /api/usuarios
router.post('/', usuariosController.crearUsuario);

// PUT /api/usuarios/:id
router.put('/:id', usuariosController.actualizarUsuario);

// DELETE /api/usuarios/:id
// Restringido solo a usuarios con rol 'admin'
router.delete('/:id', checkRole(['admin']), usuariosController.eliminarUsuario);

module.exports = router;