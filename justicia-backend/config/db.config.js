// config/db.config.js
module.exports = {
  dialect: "sqlite",
  storage: "F:/CEA Pocitos/Gestion 2025/1er Semestre/4 Tecnico Medio II/2025/Roxana Pacheco/Justicia Digital/justicia-backend/database.sqlite", // Ruta absoluta para asegurar la creación del archivo
  logging: console.log, // Opcional: ver queries en consola
  pool: {
    max: 5,
    min: 0,
    acquire: 30000,
    idle: 10000
  }
};