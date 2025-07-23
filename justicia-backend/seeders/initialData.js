// seeders/initialData.js
const bcrypt = require('bcryptjs');

module.exports = (db) => {
  const insertInitialData = async () => {
    try {
      // Hashear la contraseña admin123
      const passwordHash = await bcrypt.hash('admin123', 10);
      // Crear usuario administrador
      const admin = await db.Usuario.create({
        nombre: 'Administrador',
        username: 'admin',
        email: 'admin@justicia.digital',
        password_hash: passwordHash, // Contraseña real hasheada
        rol: 'admin',
        estado: 'activo'
      });

      // Crear casos de ejemplo
      const caso1 = await db.Caso.create({
        nurej: '10012023',
        sujeto: 'Juan Pérez Gómez',
        tipo: 'penal',
        fecha: '2023-01-15',
        estado: 'activo',
        juzgado: 'Juzgado Primero',
        municipio: 'La Paz',
        descripcion: 'Caso de robo agravado',
        usuario_id: admin.id
      });

      // Crear documento de ejemplo
      await db.Documento.create({
        tipo: 'memorial',
        fecha: '2023-01-20',
        descripcion: 'Memorial inicial',
        ruta_archivo: '/uploads/memorial-123.pdf',
        nombre_archivo: 'memorial-123.pdf',
        tipo_archivo: 'application/pdf',
        caso_id: caso1.id
      });

      console.log('Datos iniciales insertados correctamente.');
    } catch (error) {
      console.error('Error insertando datos iniciales:', error);
    }
  };

  insertInitialData();
};