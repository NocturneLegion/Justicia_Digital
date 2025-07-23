// controllers/documentos.controller.js
const db = require('../models');
const Documento = db.Documento;
const Caso = db.Caso;

/**
 * Subir un nuevo documento
 */
exports.subirDocumento = async (req, res) => {
    try {
        const { nurej, tipo, fecha, descripcion, caso_id } = req.body;
        const file = req.files?.file?.[0];

        // Validaciones
        if (!file) {
            return res.status(400).json({
                status: 'error',
                message: 'No se recibió el archivo'
            });
        }

        if (!file.buffer || file.size === 0) {
            return res.status(400).json({
                status: 'error',
                message: 'El archivo está vacío'
            });
        }

        if (!nurej || !tipo || !fecha || !descripcion) {
            return res.status(400).json({
                status: 'error',
                message: 'Faltan campos obligatorios en el formulario'
            });
        }

        const casoExistente = await Caso.findOne({ where: { nurej: String(nurej) } });
        if (!casoExistente) {
            return res.status(400).json({
                status: 'error',
                message: `No se encontró un caso con nurej: ${nurej}`
            });
        }

        const documento = {
            nurej: String(nurej),
            tipo,
            fecha,
            descripcion,
            ruta_archivo: `data:${file.mimetype};base64,${file.buffer.toString('base64')}`,
            nombre_archivo: file.originalname,
            tipo_archivo: file.mimetype,
            data: file.buffer,
            caso_id: caso_id || null
        };

        const nuevoDocumento = await Documento.create(documento);

        res.status(201).json({
            status: 'success',
            message: 'Documento subido exitosamente',
            documento: nuevoDocumento
        });

    } catch (error) {
        console.error('Error al subir documento:', error);
        let errorMessage = 'No se pudo subir el documento';
        if (error.name === 'SequelizeValidationError' || error.name === 'SequelizeForeignKeyConstraintError') {
            errorMessage = `Error de validación: ${error.message}`;
        }
        res.status(500).json({
            status: 'error',
            message: errorMessage,
            error: error.message
        });
    }
};

/**
 * Obtener documentos por caso_id
 */
exports.obtenerDocumentosPorNurej = async (req, res) => {
    try {
        const { caso_id } = req.query;

        if (!caso_id) {
            return res.status(400).json({
                status: 'error',
                message: 'El parámetro caso_id es obligatorio'
            });
        }

        console.log(`Buscando documentos para caso_id: ${caso_id}`);
        const documentos = await Documento.findAll({ where: { caso_id } });
        console.log(`Documentos encontrados: ${documentos.length}`);

        res.json(documentos);

    } catch (error) {
        console.error('Error al obtener documentos:', error);
        res.status(500).json({
            status: 'error',
            message: 'No se pudieron obtener los documentos',
            error: error.message
        });
    }
};

/**
 * Obtener un documento específico por ID
 */
exports.obtenerDocumentoPorId = async (req, res) => {
    try {
        const { id } = req.params;
        const documento = await Documento.findByPk(id);

        if (!documento) {
            return res.status(404).json({
                status: 'error',
                message: 'Documento no encontrado'
            });
        }

        res.json(documento);

    } catch (error) {
        console.error('Error al obtener documento:', error);
        res.status(500).json({
            status: 'error',
            message: 'No se pudo obtener el documento',
            error: error.message
        });
    }
};

/**
 * Obtener archivo binario de un documento
 */
exports.obtenerArchivo = async (req, res) => {
    try {
        const { id } = req.params;
        const documento = await Documento.findByPk(id);

        if (!documento) {
            return res.status(404).json({
                status: 'error',
                message: 'Documento no encontrado'
            });
        }

        res.header('Content-Type', documento.tipo_archivo);
        res.header('Content-Disposition', 'inline'); // Mostrar en navegador
        res.send(documento.data); // Devuelve el archivo binario

    } catch (error) {
        console.error('Error al obtener archivo:', error);
        res.status(500).json({
            status: 'error',
            message: 'No se pudo obtener el archivo',
            error: error.message
        });
    }
};

/**
 * Actualizar un documento
 */
exports.actualizarDocumento = async (req, res) => {
    try {
        const { id } = req.params;
        const { tipo, fecha, descripcion } = req.body;
        const file = req.files?.file?.[0];

        const documento = await Documento.findByPk(id);

        if (!documento) {
            return res.status(404).json({
                status: 'error',
                message: 'Documento no encontrado'
            });
        }

        const datosActualizados = {
            tipo: tipo || documento.tipo,
            fecha: fecha || documento.fecha,
            descripcion: descripcion || documento.descripcion
        };

        // Solo actualizar archivo si se proporciona uno nuevo
        if (file) {
            datosActualizados.ruta_archivo = `data:${file.mimetype};base64,${file.buffer.toString('base64')}`;
            datosActualizados.nombre_archivo = file.originalname;
            datosActualizados.tipo_archivo = file.mimetype;
            datosActualizados.data = file.buffer;
        }

        await documento.update(datosActualizados);
        res.json({
            status: 'success',
            message: 'Documento actualizado exitosamente',
            documento
        });

    } catch (error) {
        console.error('Error al actualizar documento:', error);
        res.status(500).json({
            status: 'error',
            message: 'No se pudo actualizar el documento',
            error: error.message
        });
    }
};

/**
 * Eliminar un documento
 */
exports.eliminarDocumento = async (req, res) => {
    try {
        const { id } = req.params;
        const documento = await Documento.findByPk(id);

        if (!documento) {
            return res.status(404).json({
                status: 'error',
                message: 'Documento no encontrado'
            });
        }

        await documento.destroy();
        res.status(200).json({
            status: 'success',
            message: 'Documento eliminado exitosamente'
        });

    } catch (error) {
        console.error('Error al eliminar documento:', error);
        res.status(500).json({
            status: 'error',
            message: 'No se pudo eliminar el documento',
            error: error.message
        });
    }
};