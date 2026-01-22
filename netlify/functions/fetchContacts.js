const { createClient } = require('@supabase/supabase-js');

exports.handler = async (event, context) => {
    try {

        // Validar variables de entorno
        if (!process.env.SUPABASE_URL || !process.env.SUPABASE_ANON_KEY || !process.env.SUPABASE_TABLE_NAME) {
            throw new Error('Variables de entorno de Supabase no configuradas');
        }

        const supabase = createClient(
            process.env.SUPABASE_URL,
            process.env.SUPABASE_ANON_KEY
        );

        const { data, error } = await supabase
            .from(process.env.SUPABASE_TABLE_NAME)
            .select('*')
            .order('id', { ascending: true });

        if (error) {
            throw error;
        }

        return {
            statusCode: 200,
            headers: {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            },
            body: JSON.stringify({ contacts: data })
        };
    } catch (error) {
        console.error('❌ Error al obtener contactos:', error);

        let statusCode = 500;
        let errorMessage = 'Error interno del servidor';

        if (error.message.includes('Variables de entorno')) {
            statusCode = 503;
            errorMessage = 'Servicio no disponible: configuración incorrecta';
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
