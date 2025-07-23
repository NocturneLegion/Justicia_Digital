// models/caso.model.js
module.exports = (sequelize, Sequelize) => {
  const Caso = sequelize.define('Caso', {
    id: {
      type: Sequelize.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    nurej: {
      type: Sequelize.STRING(50),
      unique: true,
      allowNull: false
    },
    sujeto: {
      type: Sequelize.TEXT,
      allowNull: false
    },
    tipo: {
      type: Sequelize.STRING(50),
      allowNull: false
    },
    fecha: {
      type: Sequelize.DATEONLY,
      allowNull: false
    },
    estado: {
      type: Sequelize.ENUM('activo', 'archivado', 'pendiente', 'concluido'),
      allowNull: false
    },
    juzgado: {
      type: Sequelize.STRING(100)
    },
    municipio: {
      type: Sequelize.STRING(100)
    },
    descripcion: {
      type: Sequelize.TEXT
    },
    nombre_proceso: {
      type: Sequelize.STRING(255)
    }
  }, {
    tableName: 'casos',
    timestamps: true,
    underscored: true
  });

  return Caso;
};