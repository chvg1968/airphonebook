// Configuración de Airtable
const AIRTABLE_BASE_ID = "appz6a0uRGlALNl2B";
const AIRTABLE_TABLE_NAME = "Contacts";
const AIRTABLE_API_KEY = "patnq47h2PKTUVAnf.b0e53236836e40b87e9a648482933bc27216f7e0e4eac414d1a30526dc1cce61";


export async function fetchAllContacts() {
    const fetchPage = async (offset = null) => {
        return new Promise((resolve, reject) => {
            const xhr = new XMLHttpRequest();
            let url = `https://api.airtable.com/v0/${AIRTABLE_BASE_ID}/${AIRTABLE_TABLE_NAME}?pageSize=100&sort%5B0%5D%5Bfield%5D=id&sort%5B0%5D%5Bdirection%5D=asc`;
            
            if (offset) {
                url += `&offset=${offset}`;
            }
            
            xhr.open('GET', url, true);
            xhr.setRequestHeader('Authorization', `Bearer ${AIRTABLE_API_KEY}`);
            
            xhr.onload = function() {
                if (xhr.status >= 200 && xhr.status < 300) {
                    try {
                        const data = JSON.parse(xhr.responseText);
                        // Log de la estructura del primer registro para ver los campos
                        if (data.records && data.records.length > 0) {
                            console.log('📋 Estructura del primer registro:', JSON.stringify(data.records[0], null, 2));
                            console.log('📋 Campos disponibles:', Object.keys(data.records[0].fields));
                        }
                        resolve(data);
                    } catch (error) {
                        console.error('❌ Error parsing JSON:', error);
                        reject(error);
                    }
                } else {
                    console.error('❌ HTTP Error:', xhr.status, xhr.responseText);
                    reject(new Error(`HTTP error! status: ${xhr.status}`));
                }
            };
            
            xhr.onerror = function(error) {
                console.error('❌ Network error:', error);
                reject(new Error('Network error'));
            };
            
            xhr.send();
        });
    };

    try {
        let allRecords = [];
        let offset = null;
        let pageCount = 0;

        do {
            const pageData = await fetchPage(offset);
            
            console.group(`📄 Página ${++pageCount}`);
            console.log('Registros en esta página:', pageData.records.length);
            console.log('Offset:', pageData.offset);
            console.groupEnd();

            allRecords = allRecords.concat(pageData.records);
            offset = pageData.offset;
        } while (offset);

        console.group('🔍 Resumen de Contactos');
        console.log('Total de registros:', allRecords.length);
        
        const validRecords = allRecords
            .filter(record => record.fields && record.fields.name)
            .map(record => {
                const fields = record.fields;

                const contact = {
                    name: Array.isArray(fields.name) ? fields.name[0] : fields.name,
                    phone: fields.phone ? (Array.isArray(fields.phone) ? fields.phone[0] : fields.phone) : '',
                    section: Array.isArray(fields.section) ? fields.section[0] : (fields.section || 'Sin Sección'),
                    category: Array.isArray(fields.category) ? fields.category[0] : (fields.category || 'Sin Categoría'),
                    subcategory: fields.subcategories 
                        ? (Array.isArray(fields.subcategories) ? fields.subcategories[0] : fields.subcategories)
                        : '',
                    description: fields.description 
                        ? (Array.isArray(fields.description) ? fields.description[0] : fields.description)
                        : '',
                    icon: fields.icon 
                        ? (Array.isArray(fields.icon) ? fields.icon[0] : fields.icon)
                        : ''
                };

                // Log para Tennis Reservations
                if (contact.name.includes('Tennis')) {
                    console.log('🎾 Tennis contact found:', contact);
                }

                return contact;
            });

        console.log('Registros procesados:', validRecords.length);
        console.groupEnd();

        return validRecords;
    } catch (error) {
        console.error('❌ Error fatal al recuperar contactos:', error);
        return [];
    }
}