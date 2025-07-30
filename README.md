# Justicia Digital - Nueva Versión Cliente/Servidor

Este proyecto es una versión mejorada y modernizada del sistema web "Justicia Digital". Ahora implementa una arquitectura cliente-servidor, utiliza una base de datos SQLite para almacenar datos (incluyendo archivos binarios), y aprovecha tecnologías web modernas para una experiencia robusta y profesional.

## Mejoras y Cambios Principales

- **Arquitectura Cliente/Servidor:**
  - Backend en Node.js con Express.
  - Frontend en HTML, CSS, JS, Bootstrap y Tailwind.
- **Base de Datos SQLite:**
  - Almacenamiento de datos estructurados y archivos binarios (por ejemplo, documentos y fotos).
  - Persistencia local y fácil portabilidad.
- **Gestión de Archivos:**
  - Subida y descarga de archivos desde la base de datos.
- **Frontend Moderno:**
  - Uso de Bootstrap y Tailwind para una interfaz responsiva y atractiva.
  - Separación clara de vistas y lógica.
- **Mejoras de Seguridad y Organización:**
  - Manejo de sesiones y autenticación.
  - Código modular y organizado.
- **Dependencia mínima de recursos externos:**
  - Imágenes y recursos estáticos almacenados localmente para funcionamiento offline.

## Tecnologías Utilizadas

- **Node.js** y **Express** (servidor backend)
- **SQLite** (base de datos local, persistente, binaria)
- **JavaScript** (frontend y backend)
- **HTML5** y **CSS3**
- **Bootstrap 5** y **Tailwind CSS** (diseño y responsividad)
- **FontAwesome** (iconos)

## Estructura del Proyecto

```
justicia-backend/
├── controllers/         # Lógica de negocio y controladores Express
├── models/              # Modelos de datos (SQLite)
├── public/              # Archivos estáticos (HTML, CSS, JS, imágenes)
│   ├── images/          # Imágenes locales usadas en la web
│   ├── ...
├── routes/              # Rutas Express
├── middleware/          # Middlewares personalizados
├── server.js            # Punto de entrada del backend
├── ...
```

## Instalación y Uso

1. **Clona el repositorio:**
   ```bash
   git clone https://github.com/tuusuario/justicia-digital.git
   cd justicia-digital/justicia-backend
   ```
2. **Instala las dependencias:**
   ```bash
   npm install
   ```
3. **Inicia el servidor:**
   ```bash
   node server.js
   ```
4. **Accede a la aplicación:**
   - Abre tu navegador en `http://10.123.132.42:5000` o la URL configurada.

## Notas y Créditos

- Este sistema es una evolución de versiones anteriores, ahora con arquitectura moderna y mejores prácticas.
- Las imágenes y recursos estáticos están almacenados localmente para minimizar la dependencia de internet.
- Desarrollado con Node.js, Express, SQLite, Bootstrap, Tailwind y tecnologías web estándar.

---

**Justicia Digital** © 2025. Todos los derechos reservados.
(Versión mejorada: arquitectura cliente-servidor, Node.js, Express, SQLite, frontend moderno, recursos locales)
