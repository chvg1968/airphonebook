export async function fetchAllContacts() {
    try {
        console.log('🔄 Iniciando solicitud a la función de Netlify...');
        const response = await fetch('/api/fetchContacts');
        
        if (!response.ok) {
            const errorText = await response.text();
            console.error('📄 Respuesta del servidor:', errorText);
            throw new Error(`HTTP error! Status: ${response.status}. Response: ${errorText}`);
        }

        const data = await response.json();
        console.log("📋 Datos recibidos desde Netlify:", data);

        const validRecords = data.records
            .filter(record => record.fields && record.fields.name)
            .map(record => ({
                name: Array.isArray(record.fields.name) ? record.fields.name[0] : record.fields.name,
                phone: record.fields.phone ? (Array.isArray(record.fields.phone) ? record.fields.phone[0] : record.fields.phone) : '',
                section: Array.isArray(record.fields.section) ? record.fields.section[0] : (record.fields.section || 'Sin Sección'),
                category: Array.isArray(record.fields.category) ? record.fields.category[0] : (record.fields.category || 'Sin Categoría'),
                subcategory: record.fields.subcategories
                    ? (Array.isArray(record.fields.subcategories) ? record.fields.subcategories[0] : record.fields.subcategories)
                    : '',
                description: record.fields.description
                    ? (Array.isArray(record.fields.description) ? record.fields.description[0] : record.fields.description)
                    : '',
                icon: record.fields.icon
                    ? (Array.isArray(record.fields.icon) ? record.fields.icon[0] : record.fields.icon)
                    : ''
            }));

        console.log("📋 Contactos procesados:", validRecords.length);
        return validRecords;
    } catch (error) {
        console.error("❌ Error al recuperar contactos:", error);
        return [];
    }
}