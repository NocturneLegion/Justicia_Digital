const express = require('express');
const { Sequelize } = require('sequelize');
const dbConfig = require('./config/db.config');
const documentosRoutes = require('./routes/documentos');
const casosRoutes = require('./routes/casos');
const authRoutes = require('./routes/auth');
const usuariosRoutes = require('./routes/usuarios'); // Nueva importación
const multer = require('multer');
const cors = require('cors');
const path = require('path');

require('dotenv').config(); // Cargar variables de entorno desde .env

const app = express();
const sequelize = new Sequelize(dbConfig);

// Configuración de multer para manejar archivos
const storage = multer.memoryStorage();
const upload = multer({ storage });

// Configuración de CORS
const corsOptions = {
  origin: ['http://localhost:8080', 'http://127.0.0.1:8080'],
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Authorization', 'Content-Type'],
  credentials: true
};

// Middleware para parsear application/x-www-form-urlencoded y multipart/form-data
app.use(express.urlencoded({ extended: true }));

app.use(cors(corsOptions));

app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));
app.use('/api/documentos', documentosRoutes);
app.use('/api/casos', casosRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/usuarios', usuariosRoutes); // Nueva ruta registrada

/*
app.get('/api/documentos', async (req, res) => {
  const controller = require('./controllers/documentos');
  await controller.obtenerDocumentosPorNurej(req, res);
});*/

sequelize.authenticate()
  .then(() => console.log('Conexión a la base de datos establecida'))
  .catch(err => console.error('Error al conectar a la base de datos:', err));

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Servidor corriendo en puerto ${PORT}`));
console.log('JWT_SECRET:', process.env.JWT_SECRET || '❌ NO ESTÁ DEFINIDA');