// justicia-backend/controllers/casos.controller.js
const db = require('../models');
const Caso = db.Caso;

// --- Crear un nuevo caso ---
exports.crearCaso = async (req, res) => {
  try {
    const datosCaso = req.body;
    const nuevoCaso = await Caso.create(datosCaso);
    res.status(201).json(nuevoCaso);
  } catch (error) {
    console.error('Error al crear el caso:', error);
    res.status(400).json({
      status: 'error',
      message: 'No se pudo crear el caso.',
      error: error.message
    });
  }
};

// --- Obtener todos los casos ---
exports.obtenerCasos = async (req, res) => {
  try {
    const casos = await Caso.findAll();
    res.json(casos);
  } catch (error) {
    console.error('Error al obtener los casos:', error);
    res.status(500).json({
      status: 'error',
      message: 'No se pudieron obtener los casos.',
      error: error.message
    });
  }
};

// --- Actualizar un caso existente ---
exports.actualizarCaso = async (req, res) => {
  try {
    const { id } = req.params;
    const datosCaso = req.body;

    // Verificar si el caso existe
    const caso = await Caso.findByPk(id);
    if (!caso) {
      return res.status(404).json({
        status: 'error',
        message: 'Caso no encontrado'
      });
    }

    // Actualizar el caso con los datos proporcionados
    await caso.update(datosCaso);

    // Devolver el caso actualizado
    res.json(caso);
  } catch (error) {
    console.error('Error al actualizar el caso:', error);
    res.status(400).json({
      status: 'error',
      message: 'No se pudo actualizar el caso.',
      error: error.message
    });
  }
};

// --- Eliminar un caso ---
exports.eliminarCaso = async (req, res) => {
  try {
    const { id } = req.params;

    // Verificar si el caso existe
    const caso = await Caso.findByPk(id);
    if (!caso) {
      return res.status(404).json({
        status: 'error',
        message: 'Caso no encontrado'
      });
    }

    // Eliminar el caso
    await caso.destroy();

    // Devolver respuesta de éxito
    res.status(200).json({
      status: 'success',
      message: `Caso ID ${id} eliminado exitosamente`
    });
  } catch (error) {
    console.error('Error al eliminar el caso:', error);
    res.status(400).json({
      status: 'error',
      message: 'No se pudo eliminar el caso.',
      error: error.message
    });
  }
};