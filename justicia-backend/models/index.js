// models/index.js
const dbConfig = require("../config/db.config.js");
const Sequelize = require("sequelize");

// Usar un solo objeto de configuración para SQLite
const sequelize = new Sequelize({
  dialect: dbConfig.dialect,
  storage: dbConfig.storage,
  logging: dbConfig.logging,
  pool: dbConfig.pool
});

const db = {};

db.Sequelize = Sequelize;
db.sequelize = sequelize;

// Función para cargar modelos con manejo de errores
const cargarModelo = (ruta, nombre) => {
  try {
    const modelo = require(ruta)(sequelize, Sequelize);
    console.log(`✅ Modelo ${nombre} cargado correctamente`);
    return modelo;
  } catch (error) {
    console.error(`❌ Error al cargar modelo ${nombre}:`, error);
    throw error;
  }
};

// Importar modelos con manejo de errores
try {
  db.Usuario = cargarModelo("./usuario.model.js", "Usuario");
  db.Caso = cargarModelo("./caso.model.js", "Caso");
  db.Documento = cargarModelo("./documento.model.js", "Documento");
} catch (error) {
  console.error("❌ Error crítico al cargar modelos:", error);
  throw error;
}

// Definir relaciones entre modelos
try {
  // Un Usuario puede tener muchos Casos
  db.Usuario.hasMany(db.Caso, {
    foreignKey: 'usuario_id',
    as: 'casos'
  });
  db.Caso.belongsTo(db.Usuario, {
    foreignKey: 'usuario_id',
    as: 'usuario'
  });

  // Un Caso puede tener muchos Documentos
  db.Caso.hasMany(db.Documento, {
    foreignKey: 'caso_id',
    as: 'documentos'
  });
  db.Documento.belongsTo(db.Caso, {
    foreignKey: 'caso_id',
    as: 'caso'
  });

  console.log("✅ Relaciones de modelos establecidas correctamente");
} catch (error) {
  console.error("❌ Error al establecer relaciones entre modelos:", error);
  throw error;
}

module.exports = db;