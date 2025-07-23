// models/usuario.model.js
module.exports = (sequelize, Sequelize) => {
  const Usuario = sequelize.define('Usuario', {
    id: {
      type: Sequelize.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    nombre: {
      type: Sequelize.STRING,
      allowNull: false
    },
    username: {
      type: Sequelize.STRING,
      unique: true,
      allowNull: false
    },
    email: {
      type: Sequelize.STRING,
      unique: true,
      allowNull: false,
      validate: {
        isEmail: true
      }
    },
    password_hash: {
      type: Sequelize.STRING,
      allowNull: false
    },
    rol: {
      type: Sequelize.ENUM('admin', 'abogado', 'usuario'),
      allowNull: false
    },
    estado: {
      type: Sequelize.ENUM('activo', 'inactivo'),
      defaultValue: 'activo'
    }
  }, {
    tableName: 'usuarios',
    timestamps: true, // Crea createdAt y updatedAt automáticamente
    underscored: true // Convierte camelCase en snake_case
  });

  return Usuario;
};