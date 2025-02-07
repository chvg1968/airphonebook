const Airtable = require('airtable');

exports.handler = async (event, context) => {
    try {
        // Configurar Airtable
        const base = new Airtable({ apiKey: process.env.AIRTABLE_API_KEY })
            .base(process.env.AIRTABLE_BASE_ID);

        // Obtener registros de la tabla
        const records = await base(process.env.AIRTABLE_TABLE_NAME)
            .select({
                pageSize: 100,
                sort: [{ field: 'id', direction: 'asc' }]
            })
            .all();

        return {
            statusCode: 200,
            headers: {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            },
            body: JSON.stringify({ records })
        };
    } catch (error) {
        console.error('❌ Error al obtener contactos:', error);
        return {
            statusCode: 500,
            body: JSON.stringify({ error: 'Error al obtener contactos' })
        };
    }
};