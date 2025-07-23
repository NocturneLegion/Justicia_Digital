// controllers/auth.controller.js (actualizado)
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('../models');

exports.login = async (req, res) => {
  try {
    // console.log('🔍 [AUTH.CONTROLLER] Intento de login:', req.body);
    const { username, password } = req.body;
    
    // Buscar usuario
    const usuario = await db.Usuario.findOne({ where: { username } });
    if (!usuario) {
      // console.log('🚨 [AUTH.CONTROLLER] Usuario no encontrado:', username);
      return res.status(404).json({ error: 'Usuario no encontrado' });
    }
    
    // console.log('🔍 [AUTH.CONTROLLER] Usuario encontrado:', usuario.username, 'Rol:', usuario.rol);
    
    // Verificar contraseña
    const validPassword = await bcrypt.compare(password, usuario.password_hash);
    if (!validPassword) {
      // console.log('🚨 [AUTH.CONTROLLER] Contraseña incorrecta para:', username);
      return res.status(401).json({ error: 'Contraseña incorrecta' });
    }
    
    // Crear token JWT
    const token = jwt.sign(
      { id: usuario.id, username: usuario.username, rol: usuario.rol },
      process.env.JWT_SECRET,
      { expiresIn: '8h' }
    );
    
    // console.log('✅ [AUTH.CONTROLLER] Login exitoso para:', username, 'Token generado');
    
    res.json({
      token,
      user: {
        id: usuario.id,
        username: usuario.username,
        nombre: usuario.nombre,
        email: usuario.email,
        rol: usuario.rol
      }
    });
  } catch (error) {
    // console.error('🚨 [AUTH.CONTROLLER] Error en login:', error);
    res.status(500).json({ error: 'Error en el servidor' });
  }
};

// auth.controller.js (final)
exports.verify = async (req, res) => {
  try {
    // console.log('🔍 [AUTH.CONTROLLER] Verificando token...');
    const token = req.headers.authorization?.split(' ')[1];
    
    if (!token) {
      // console.log('🚨 [AUTH.CONTROLLER] No se proporcionó token');
      return res.status(401).json({ error: 'No token provided' });
    }

    // console.log('🔍 [AUTH.CONTROLLER] Token recibido:', token.substring(0, 20) + '...');
    
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    // console.log('✅ [AUTH.CONTROLLER] Token válido para usuario:', decoded.username, 'Rol:', decoded.rol);
    
    res.json({ valid: true, user: decoded });
  } catch (error) {
    // console.log('🚨 [AUTH.CONTROLLER] Token inválido:', error.message);
    res.status(401).json({ error: 'Token inválido' });
  }
};