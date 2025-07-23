// justicia-backend/controllers/usuarios.controller.js
const bcrypt = require('bcryptjs');

// Manejo seguro de la importación de modelos
let db, Usuario;
try {
  db = require('../models');
  Usuario = db.Usuario;
} catch (error) {
  console.error('Error al cargar modelos:', error);
  throw new Error('No se pudieron cargar los modelos de la base de datos');
}

// Roles permitidos
const ROLES_PERMITIDOS = ['admin', 'abogado', 'usuario'];

// --- Obtener todos los usuarios ---
const obtenerUsuarios = async (req, res) => {
  try {
    const usuarios = await Usuario.findAll({
      attributes: { exclude: ['password_hash'] }
    });
    res.json(usuarios);
  } catch (error) {
    console.error('Error al obtener usuarios:', error);
    res.status(500).json({ message: 'Error interno del servidor' });
  }
};

// --- Crear un nuevo usuario ---
const crearUsuario = async (req, res) => {
  try {
    console.log('Datos recibidos en crearUsuario:', req.body);
    const { nombre, username, email, password, rol, estado } = req.body;

    // Validar campos obligatorios
    if (!nombre || !username || !email || !password || !rol) {
      return res.status(400).json({ message: 'Todos los campos son obligatorios: nombre, username, email, password, rol.' });
    }

    // Validar rol
    if (!ROLES_PERMITIDOS.includes(rol)) {
      return res.status(400).json({ message: 'Rol inválido. Use: admin, abogado o usuario' });
    }

    // Hash de la contraseña
    const hashedPassword = await bcrypt.hash(password, 10);

    // Crear usuario
    const nuevoUsuario = await Usuario.create({
      nombre,
      username,
      email,
      password_hash: hashedPassword,
      rol,
      estado: estado || 'activo'
    });

    // Respuesta sin contraseña
    const usuarioCreado = nuevoUsuario.toJSON();
    delete usuarioCreado.password_hash;

    res.status(201).json(usuarioCreado);
  } catch (error) {
    if (error.name === 'SequelizeUniqueConstraintError') {
      return res.status(400).json({ message: 'El nombre de usuario o email ya existe.' });
    }
    console.error('Error al crear usuario:', error);
    res.status(500).json({ message: 'Error interno del servidor' });
  }
};

// --- Actualizar un usuario existente ---
const actualizarUsuario = async (req, res) => {
  try {
    console.log('Datos recibidos en actualizarUsuario:', req.body);
    const { id } = req.params;
    const { nombre, username, email, password, rol, estado } = req.body;

    // Validar rol si se proporciona
    if (rol !== undefined && !ROLES_PERMITIDOS.includes(rol)) {
      return res.status(400).json({ message: 'Rol inválido. Use: admin, abogado o usuario' });
    }

    // Buscar usuario
    const usuario = await Usuario.findByPk(id);
    if (!usuario) {
      return res.status(404).json({ message: 'Usuario no encontrado.' });
    }

    // Actualizar campos
    if (nombre !== undefined) usuario.nombre = nombre;
    if (username !== undefined) usuario.username = username;
    if (email !== undefined) usuario.email = email;
    if (rol !== undefined) usuario.rol = rol;
    if (estado !== undefined) usuario.estado = estado;

    // Actualizar contraseña si se proporciona
    if (password && password.trim() !== '') {
      const hashedPassword = await bcrypt.hash(password, 10);
      usuario.password_hash = hashedPassword;
    }

    // Guardar cambios
    await usuario.save();
    console.log('Usuario actualizado:', usuario.toJSON());

    // Respuesta sin contraseña
    const usuarioActualizado = usuario.toJSON();
    delete usuarioActualizado.password_hash;

    res.json(usuarioActualizado);
  } catch (error) {
    if (error.name === 'SequelizeUniqueConstraintError') {
      return res.status(400).json({ message: 'El nombre de usuario o email ya existe.' });
    }
    console.error('Error al actualizar usuario:', error);
    res.status(500).json({ message: 'Error interno del servidor' });
  }
};

// --- Eliminar un usuario ---
const eliminarUsuario = async (req, res) => {
  try {
    const { id } = req.params;
    const usuario = await Usuario.findByPk(id);

    if (!usuario) {
      return res.status(404).json({ message: 'Usuario no encontrado.' });
    }

    await usuario.destroy();
    res.status(200).json({ message: 'Usuario eliminado correctamente.' });
  } catch (error) {
    console.error('Error al eliminar usuario:', error);
    res.status(500).json({ message: 'Error interno del servidor' });
  }
};

module.exports = {
  obtenerUsuarios,
  crearUsuario,
  actualizarUsuario,
  eliminarUsuario
};