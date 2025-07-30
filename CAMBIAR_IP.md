# 🌐 Guía para Cambiar la IP del Servidor

## Problema Resuelto ✅

Se han corregido todas las referencias hardcodeadas a la IP `10.123.132.42` en el proyecto. Ahora toda la configuración está centralizada.

## 📍 Ubicación de la Configuración

La configuración de la IP del servidor se encuentra en:
```
justicia-backend/public/config.js
```

## 🔧 Cómo Cambiar la IP

### Método 1: Editar el archivo config.js (Recomendado)

1. Abre el archivo `justicia-backend/public/config.js`
2. Busca la línea:
   ```javascript
   const CURRENT_SERVER_IP = "10.123.132.42";
   ```
3. Cambia la IP por la nueva:
   ```javascript
   const CURRENT_SERVER_IP = "TU_NUEVA_IP_AQUI";
   ```
4. Guarda el archivo
5. Reinicia el servidor si está corriendo
6. Recarga las páginas web

### Método 2: Desde la consola del navegador (Temporal)

1. Abre las herramientas de desarrollador (F12)
2. Ve a la pestaña "Console"
3. Ejecuta:
   ```javascript
   changeServerIP("TU_NUEVA_IP_AQUI")
   ```
4. Recarga la página

## 📁 Archivos Corregidos

Se han actualizado los siguientes archivos para usar la configuración centralizada:

### Frontend (JavaScript)
- ✅ `public/config.js` - Configuración centralizada
- ✅ `public/actividades.js` - Gestión de documentos
- ✅ `public/procedimientos.js` - Gestión de casos
- ✅ `public/usuarios.js` - Gestión de usuarios
- ✅ `public/actividades.html` - Vista previa de documentos

### Backend (Servidor)
- ✅ `server.js` - Configuración de CORS actualizada

## 🔍 Verificación

Para verificar que la configuración está funcionando:

1. Abre la consola del navegador (F12)
2. Deberías ver un mensaje como:
   ```
   🌐 Configuración cargada: {
     IP: "10.123.132.42",
     Puerto: "5000", 
     URL_Backend: "http://10.123.132.42:5000",
     Ayuda: "Usa changeServerIP('nueva.ip.aqui') para cambiar la IP"
   }
   ```

## ⚠️ Problemas Comunes

### 1. Error de CORS
Si cambias la IP y obtienes errores de CORS:
- Asegúrate de que el servidor esté corriendo en la nueva IP
- Verifica que la configuración de CORS en `server.js` incluya la nueva IP

### 2. Error de conexión
- Verifica que el servidor esté corriendo en el puerto 5000
- Comprueba que no haya firewall bloqueando la conexión
- Asegúrate de que la nueva IP sea accesible desde tu red

### 3. Caché del navegador
Si los cambios no se reflejan:
- Recarga la página con Ctrl+F5 (forzar recarga)
- Limpia la caché del navegador
- Cierra y abre el navegador

## 🚀 Configuración del Servidor

Para que el servidor funcione con la nueva IP:

1. Asegúrate de que el servidor esté configurado para escuchar en todas las interfaces:
   ```javascript
   app.listen(PORT, '0.0.0.0', () => {
     console.log(`Servidor corriendo en puerto ${PORT}`);
   });
   ```

2. Verifica la configuración de CORS en `server.js`:
   ```javascript
   const corsOptions = {
     origin: ['http://NUEVA_IP:8080', 'http://NUEVA_IP:5000', 'http://localhost:5000'],
     methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
     allowedHeaders: ['Authorization', 'Content-Type'],
     credentials: true
   };
   ```

## 📞 Soporte

Si tienes problemas para cambiar la IP:
1. Verifica que todos los archivos estén guardados
2. Reinicia el servidor backend
3. Limpia la caché del navegador
4. Revisa la consola del navegador para errores

---

**Nota**: Este proyecto ahora tiene configuración centralizada de IP, lo que facilita enormemente el cambio de servidor sin tener que editar múltiples archivos.