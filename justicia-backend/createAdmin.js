// justicia-backend/createAdmin.js
const bcrypt = require('bcryptjs');
const db = require('./models');

async function createAdmin() {
  try {
    const passwordHash = await bcrypt.hash('admin123', 10);
    const admin = await db.Usuario.create({
      nombre: 'Administrador',
      username: 'admin',
      email: 'admin@demo.com',
      password_hash: passwordHash,
      rol: 'admin',
      estado: 'activo',
      created_at: new Date(),
      updated_at: new Date()
    });
    console.log('Usuario administrador creado:', admin.username);
    process.exit(0);
  } catch (error) {
    console.error('Error al crear el usuario administrador:', error);
    process.exit(1);
  }
}

createAdmin();
