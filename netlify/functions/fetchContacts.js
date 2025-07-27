const Airtable = require('airtable');
const crypto = require('crypto');

// Variables de caché en memoria
let cachedData = null;
let lastFetchTime = null;
let dataETag = null;
const CACHE_DURATION = 60 * 1000 * 5; // 5 minutos

// Función para generar ETag basado en los datos
function generateETag(data) {
    return crypto.createHash('md5').update(JSON.stringify(data)).digest('hex');
}

exports.handler = async (event, context) => {
    const now = Date.now();
    const clientETag = event.headers['if-none-match'];
    
    // Verificar si tenemos datos en caché válidos
    const isCacheValid = cachedData && (now - lastFetchTime < CACHE_DURATION);
    
    if (isCacheValid) {
        console.log('📦 Usando datos cacheados (Netlify memory)');
        
        // Verificar ETag para validación condicional
        if (clientETag && clientETag === dataETag) {
            console.log('🔄 Cliente tiene datos actualizados (304 Not Modified)');
            return {
                statusCode: 304,
                headers: {
                    'ETag': dataETag,
                    'Cache-Control': 'public, max-age=300', // 5 minutos
                    'Access-Control-Allow-Origin': '*'
                }
            };
        }
        
        return {
            statusCode: 200,
            headers: {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*',
                'ETag': dataETag,
                'Cache-Control': 'public, max-age=300', // 5 minutos
                'X-Cache': 'HIT'
            },
            body: JSON.stringify({ records: cachedData })
        };
    }

    try {
        console.log('🔄 Obteniendo datos frescos de Airtable...');
        
        // Validar variables de entorno
        if (!process.env.AIRTABLE_API_KEY || !process.env.AIRTABLE_BASE_ID || !process.env.AIRTABLE_TABLE_NAME) {
            throw new Error('Variables de entorno de Airtable no configuradas');
        }
        
        const base = new Airtable({ apiKey: process.env.AIRTABLE_API_KEY })
            .base(process.env.AIRTABLE_BASE_ID);

        const records = await base(process.env.AIRTABLE_TABLE_NAME)
            .select({
                pageSize: 100,
                sort: [{ field: 'id', direction: 'asc' }]
            })
            .all();

        // Actualizar caché
        cachedData = records;
        lastFetchTime = now;
        dataETag = generateETag(records);
        
        console.log(`✅ ${records.length} contactos obtenidos y cacheados`);

        return {
            statusCode: 200,
            headers: {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*',
                'ETag': dataETag,
                'Cache-Control': 'public, max-age=300', // 5 minutos
                'X-Cache': 'MISS'
            },
            body: JSON.stringify({ records })
        };
    } catch (error) {
        console.error('❌ Error al obtener contactos:', error);
        
        // Si tenemos datos cacheados antiguos, usarlos como fallback
        if (cachedData) {
            console.log('⚠️ Usando datos cacheados antiguos como fallback');
            return {
                statusCode: 200,
                headers: {
                    'Content-Type': 'application/json',
                    'Access-Control-Allow-Origin': '*',
                    'ETag': dataETag,
                    'Cache-Control': 'public, max-age=60', // 1 minuto para datos antiguos
                    'X-Cache': 'STALE'
                },
                body: JSON.stringify({ records: cachedData })
            };
        }
        
        // Determinar código de error específico
        let statusCode = 500;
        let errorMessage = 'Error interno del servidor';
        
        if (error.message.includes('Variables de entorno')) {
            statusCode = 503;
            errorMessage = 'Servicio no disponible: configuración incorrecta';
        } else if (error.statusCode) {
            statusCode = error.statusCode;
            errorMessage = 'Error de API de Airtable';
        }
        
        return {
            statusCode,
            headers: {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            },
            body: JSON.stringify({ 
                error: errorMessage,
                timestamp: new Date().toISOString()
            })
        };
    }
};