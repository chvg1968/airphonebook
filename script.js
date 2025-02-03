// Configuración de Airtable
const AIRTABLE_BASE_ID = "appz6a0uRGlALNl2B";
const AIRTABLE_TABLE_NAME = "Contacts";
const AIRTABLE_API_KEY = "patnq47h2PKTUVAnf.b0e53236836e40b87e9a648482933bc27216f7e0e4eac414d1a30526dc1cce61";

// Clase para manejo de datos de contactos
class ContactManager {
    constructor(contacts) {
        this.contacts = contacts;
        this.sections = this.groupBySections(contacts);
    }

    // Agrupar contactos por secciones
    groupBySections(contacts) {
        return contacts.reduce((sections, contact) => {
            if (!sections[contact.section]) {
                sections[contact.section] = {};
            }
            if (!sections[contact.section][contact.category]) {
                sections[contact.section][contact.category] = [];
            }
            sections[contact.section][contact.category].push(contact);
            return sections;
        }, {});
    }

    // Método para consultar contactos (similar a SQL)
    query(filters = {}) {
        return this.contacts.filter(contact => 
            Object.entries(filters).every(([key, value]) => 
                contact[key] === value
            )
        );
    }

    // Método para obtener secciones
    getSections() {
        return Object.keys(this.sections);
    }

    // Método para obtener categorías de una sección
    getCategoriesInSection(sectionName) {
        return Object.keys(this.sections[sectionName] || {});
    }

    // Método para obtener contactos de una categoría en una sección
    getContactsInCategory(sectionName, categoryName) {
        return this.sections[sectionName]?.[categoryName] || [];
    }

    // Añadir método de depuración a ContactManager
    debugStructure() {
        console.group("🔍 Estructura Completa de Contactos");
        
        Object.entries(this.sections).forEach(([sectionName, categories]) => {
            console.group(`📂 Sección: ${sectionName}`);
            
            Object.entries(categories).forEach(([categoryName, contacts]) => {
                console.log(`  🏷️ Categoría: ${categoryName}`);
                console.log(`     Total Contactos: ${contacts.length}`);
                
                contacts.forEach((contact, index) => {
                    console.log(`     👤 Contacto ${index + 1}:`, {
                        name: contact.name,
                        phone: contact.phone,
                        description: contact.description
                    });
                });
            });
            
            console.groupEnd();
        });
        
        console.groupEnd();
    }
}

async function fetchAllContacts() {
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

async function buildTree() {
    try {
        const contacts = await fetchAllContacts();
        console.log('📊 Contactos recuperados:', contacts.length);

        const contactManager = new ContactManager(contacts);
        
        // Debug: Mostrar estructura completa
        contactManager.debugStructure();

        const phonebook = document.getElementById("phonebook");
        phonebook.innerHTML = ''; // Limpiar contenido previo

        if (contacts.length === 0) {
            const noContactsLi = document.createElement("li");
            noContactsLi.className = "error";
            noContactsLi.textContent = "No se encontraron contactos. Verifica tu conexión o configuración de Airtable.";
            phonebook.appendChild(noContactsLi);
            return;
        }

        // Renderizado jerárquico
        contactManager.getSections().forEach(sectionName => {
            const sectionLi = document.createElement("li");
            sectionLi.className = "section";
            sectionLi.textContent = sectionName;

            const sectionUl = document.createElement("ul");
            sectionUl.className = "section-content hidden";

            // Evento para expandir/contraer secciones
            sectionLi.addEventListener("click", (e) => {
                e.stopPropagation();
                sectionLi.classList.toggle("expanded");
                sectionUl.classList.toggle("hidden");
            });

            // Renderizar categorías
            contactManager.getCategoriesInSection(sectionName).forEach(categoryName => {
                const categoryLi = document.createElement("li");
                categoryLi.className = "category";
                
                const contacts = contactManager.getContactsInCategory(sectionName, categoryName);
                categoryLi.textContent = `${categoryName} (${contacts.length})`;

                const categoryUl = document.createElement("ul");
                categoryUl.className = "category-content hidden"; // Cambio: hidden por defecto

                // Evento para expandir categoría sin colapsar sección
                categoryLi.addEventListener("click", (e) => {
                    e.stopPropagation();
                    categoryLi.classList.toggle("expanded");
                    categoryUl.classList.toggle("hidden");
                });

                // Renderizar contactos
                contacts.sort((a, b) => a.name.localeCompare(b.name)).forEach(contact => {
                    const contactLi = document.createElement("li");
                    contactLi.className = "contact";
                    contactLi.innerHTML = `
                        <strong>${contact.name}</strong>
                        ${contact.phone ? `- ${contact.phone}` : ''}
                        ${contact.description ? `<small>(${contact.description})</small>` : ''}
                    `;
                    categoryUl.appendChild(contactLi);
                });

                categoryLi.appendChild(categoryUl);
                sectionUl.appendChild(categoryLi);
            });

            sectionLi.appendChild(sectionUl);
            phonebook.appendChild(sectionLi);
        });

        // Ejemplo de uso de consulta tipo SQL
        console.log("🔎 Ejemplo de Consulta:");
        const medicalContacts = contactManager.query({
            section: "Medical and Security Emergencies"
        });
        console.log("Contactos de Medical and Security Emergencies:", medicalContacts);

    } catch (error) {
        console.error("❌ Error construyendo el árbol de contactos:", error);
        const phonebook = document.getElementById("phonebook");
        const errorLi = document.createElement("li");
        errorLi.className = "error";
        errorLi.textContent = `Error al cargar contactos: ${error.message}`;
        phonebook.appendChild(errorLi);
    }
}

// Cargar phonebook cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', buildTree);

// Exponer ContactManager globalmente para pruebas
window.ContactManager = ContactManager;