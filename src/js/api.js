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

        // Supabase retorna datos planos, filtrar solo los que tienen nombre
        const validContacts = data.contacts
            .filter(contact => contact.name)
            .map(contact => ({
                name: contact.name,
                phone: contact.phone || '',
                section: contact.section || 'Sin Sección',
                category: contact.category || 'Sin Categoría',
                subcategory: contact.subcategories || '',
                description: contact.description || '',
                icon: contact.icon || ''
            }));

        console.log("📋 Contactos procesados:", validContacts.length);
        return validContacts;
    } catch (error) {
        console.error("❌ Error al recuperar contactos:", error);
        return [];
    }
}
