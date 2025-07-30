// 🔍 Script de Diagnóstico de Conexión
// Ejecuta este script en la consola del navegador para diagnosticar problemas

async function diagnosticarConexion() {
    console.log('🔍 INICIANDO DIAGNÓSTICO DE CONEXIÓN...\n');
    
    // 1. Verificar configuración
    console.log('📋 1. VERIFICANDO CONFIGURACIÓN:');
    console.log('   IP configurada:', window.CURRENT_SERVER_IP || 'NO DEFINIDA');
    console.log('   Puerto:', window.SERVER_PORT || 'NO DEFINIDO');
    console.log('   URL Backend:', window.BACKEND_URL || 'NO DEFINIDA');
    console.log('   Token de sesión:', sessionStorage.getItem('token') ? 'PRESENTE' : 'AUSENTE');
    console.log('');
    
    // 2. Probar conectividad básica
    console.log('🌐 2. PROBANDO CONECTIVIDAD BÁSICA:');
    try {
        const response = await fetch(`${BACKEND_URL}/api/auth/verify`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${sessionStorage.getItem('token') || 'test'}`
            }
        });
        
        console.log('   Status de respuesta:', response.status);
        console.log('   Status text:', response.statusText);
        
        if (response.ok) {
            console.log('   ✅ Servidor accesible');
        } else {
            console.log('   ⚠️  Servidor responde pero con error');
        }
    } catch (error) {
        console.log('   ❌ Error de conexión:', error.message);
        
        if (error.message.includes('CORS')) {
            console.log('   💡 Posible problema de CORS');
        } else if (error.message.includes('fetch')) {
            console.log('   💡 Posible problema de red o servidor no disponible');
        }
    }
    console.log('');
    
    // 3. Verificar CORS
    console.log('🔒 3. VERIFICANDO CORS:');
    try {
        const response = await fetch(`${BACKEND_URL}/api/casos`, {
            method: 'OPTIONS'
        });
        console.log('   Preflight CORS:', response.ok ? '✅ OK' : '❌ FALLO');
    } catch (error) {
        console.log('   ❌ Error en preflight CORS:', error.message);
    }
    console.log('');
    
    // 4. Información del navegador
    console.log('🌍 4. INFORMACIÓN DEL NAVEGADOR:');
    console.log('   URL actual:', window.location.href);
    console.log('   Protocolo:', window.location.protocol);
    console.log('   Host:', window.location.host);
    console.log('   User Agent:', navigator.userAgent.substring(0, 50) + '...');
    console.log('');
    
    // 5. Recomendaciones
    console.log('💡 5. RECOMENDACIONES:');
    
    if (!window.BACKEND_URL) {
        console.log('   ⚠️  Cargar config.js antes que otros scripts');
    }
    
    if (!sessionStorage.getItem('token')) {
        console.log('   ⚠️  Iniciar sesión para obtener token de autenticación');
    }
    
    console.log('   📝 Para cambiar IP: changeServerIP("nueva.ip.aqui")');
    console.log('   🔄 Después de cambios: recargar página con Ctrl+F5');
    console.log('   🛠️  Si persisten problemas: verificar que el servidor esté corriendo');
    
    console.log('\n🏁 DIAGNÓSTICO COMPLETADO');
}

// Función para probar una IP específica
async function probarIP(ip) {
    console.log(`🧪 PROBANDO IP: ${ip}`);
    
    const testURL = `http://${ip}:5000`;
    
    try {
        const response = await fetch(`${testURL}/api/auth/verify`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer test`
            }
        });
        
        console.log(`   Status: ${response.status} - ${response.statusText}`);
        
        if (response.status === 401) {
            console.log('   ✅ Servidor accesible (error 401 es normal sin token válido)');
            return true;
        } else if (response.ok) {
            console.log('   ✅ Servidor accesible y funcionando');
            return true;
        } else {
            console.log('   ⚠️  Servidor responde pero con error');
            return false;
        }
    } catch (error) {
        console.log(`   ❌ No se puede conectar: ${error.message}`);
        return false;
    }
}

// Función para probar múltiples IPs comunes
async function buscarServidor() {
    console.log('🔍 BUSCANDO SERVIDOR EN IPs COMUNES...\n');
    
    const ipsComunes = [
        '10.123.132.42',
        '192.168.1.100',
        '192.168.0.100',
        '192.168.1.1',
        '127.0.0.1',
        'localhost'
    ];
    
    for (const ip of ipsComunes) {
        const funciona = await probarIP(ip);
        if (funciona) {
            console.log(`\n🎯 SERVIDOR ENCONTRADO EN: ${ip}`);
            console.log(`   Para usar esta IP: changeServerIP("${ip}")`);
            break;
        }
    }
    
    console.log('\n🏁 BÚSQUEDA COMPLETADA');
}

// Hacer funciones disponibles globalmente
if (typeof window !== 'undefined') {
    window.diagnosticarConexion = diagnosticarConexion;
    window.probarIP = probarIP;
    window.buscarServidor = buscarServidor;
}

console.log('🔧 HERRAMIENTAS DE DIAGNÓSTICO CARGADAS');
console.log('   diagnosticarConexion() - Diagnóstico completo');
console.log('   probarIP("ip.aqui") - Probar IP específica');
console.log('   buscarServidor() - Buscar servidor en IPs comunes');