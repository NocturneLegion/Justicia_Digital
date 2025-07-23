// models/documento.model.js
module.exports = (sequelize, Sequelize) => {
    const Documento = sequelize.define('Documento', {
        id: {
            type: Sequelize.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        nurej: {
            type: Sequelize.STRING(50),
            allowNull: false,
            references: {
                model: 'casos',
                key: 'nurej'
            }
        },
        tipo: {
            type: Sequelize.STRING(50),
            allowNull: false
        },
        fecha: {
            type: Sequelize.DATEONLY,
            allowNull: false
        },
        descripcion: {
            type: Sequelize.TEXT,
            allowNull: false
        },
        ruta_archivo: {
            type: Sequelize.STRING(255),
            allowNull: false
        },
        nombre_archivo: {
            type: Sequelize.STRING(255),
            allowNull: false
        },
        tipo_archivo: {
            type: Sequelize.STRING(50),
            allowNull: false
        },
        data: {
            type: Sequelize.BLOB('long'),
            allowNull: false
        },
        caso_id: {
            type: Sequelize.INTEGER,
            allowNull: true, // Permitir nulo si no siempre se usa
            references: {
                model: 'casos',
                key: 'id'
            }
        }
    }, {
        tableName: 'documentos',
        timestamps: true,
        underscored: true
    });

    Documento.associate = (models) => {
        Documento.belongsTo(models.Caso, { foreignKey: 'nurej', targetKey: 'nurej' });
        Documento.belongsTo(models.Caso, { foreignKey: 'caso_id', targetKey: 'id' }); // Relación adicional
    };

    return Documento;
};