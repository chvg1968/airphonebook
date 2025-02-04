export async function fetchAllContacts() {
    const fetchPage = async (offset = null) => {
        return new Promise((resolve, reject) => {
            const xhr = new XMLHttpRequest();
            let url = `https://api.airtable.com/v0/${AIRTABLE_BASE_ID}/${AIRTABLE_TABLE_NAME}?pageSize=100`;
            
            if (offset) {
                url += `&offset=${offset}`;
            }
            
            xhr.open('GET', url, true);
            xhr.setRequestHeader('Authorization', `Bearer ${AIRTABLE_API_KEY}`);
            
            xhr.onload = function() {
                if (xhr.status >= 200 && xhr.status < 300) {
                    try {
                        const data = JSON.parse(xhr.responseText);
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

                return {
                    name: Array.isArray(fields.name) ? fields.name[0] : fields.name,
                    phone: fields.phone ? (Array.isArray(fields.phone) ? fields.phone[0] : fields.phone) : '',
                    section: Array.isArray(fields.section) ? fields.section[0] : (fields.section || 'Sin Sección'),
                    category: Array.isArray(fields.category) ? fields.category[0] : (fields.category || 'Sin Categoría'),
                    subcategory: fields.subcategories 
                        ? (Array.isArray(fields.subcategories) ? fields.subcategories[0] : fields.subcategories)
                        : '',
                    description: fields.description 
                        ? (Array.isArray(fields.description) ? fields.description[0] : fields.description)
                        : ''
                };
            });

        console.log('Registros procesados:', validRecords.length);
        console.groupEnd();

        return validRecords;
    } catch (error) {
        console.error('❌ Error fatal al recuperar contactos:', error);
        return [];
    }
}