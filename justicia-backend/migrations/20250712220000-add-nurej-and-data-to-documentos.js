'use strict';

     module.exports = {
       up: async (queryInterface, Sequelize) => {
         // Verificar si las columnas ya existen para evitar errores
         const tableInfo = await queryInterface.describeTable('documentos');
         if (!tableInfo.nurej) {
           await queryInterface.addColumn('documentos', 'nurej', {
             type: Sequelize.STRING(50),
             allowNull: true,
             references: {
               model: 'casos',
               key: 'nurej'
             }
           });
         }
         if (!tableInfo.data) {
           await queryInterface.addColumn('documentos', 'data', {
             type: Sequelize.BLOB('long'),
             allowNull: true
           });
         }

         // Actualizar nurej con un valor válido de casos
         await queryInterface.sequelize.query(`
           UPDATE documentos
           SET nurej = COALESCE(nurej, (SELECT nurej FROM casos LIMIT 1))
           WHERE nurej IS NULL;
         `);

         // Hacer nurej NOT NULL
         await queryInterface.changeColumn('documentos', 'nurej', {
           type: Sequelize.STRING(50),
           allowNull: false,
           references: {
             model: 'casos',
             key: 'nurej'
           }
         });

         // Actualizar data (asumimos que puede ser NULL inicialmente y lo corregiremos después)
         await queryInterface.sequelize.query(`
           UPDATE documentos
           SET data = NULL
           WHERE data IS NULL;
         `);

         // Hacer data NOT NULL (ajústalo si necesitas un valor por defecto)
         await queryInterface.changeColumn('documentos', 'data', {
           type: Sequelize.BLOB('long'),
           allowNull: false,
           defaultValue: null // Esto puede causar problemas; revisa más abajo
         });
       },

       down: async (queryInterface, Sequelize) => {
         await queryInterface.removeColumn('documentos', 'nurej');
         await queryInterface.removeColumn('documentos', 'data');
       }
     };