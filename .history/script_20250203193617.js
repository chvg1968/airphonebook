// Configuración de Airtable
const AIRTABLE_BASE_ID = "appz6a0uRGlALNl2B";
const AIRTABLE_TABLE_NAME = "Contacts";
const AIRTABLE_API_KEY = "patnq47h2PKTUVAnf.b0e53236836e40b87e9a648482933bc27216f7e0e4eac414d1a30526dc1cce61";

// Mapeo de emojis e iconos
const ICONS = {
    sections: {
        "Medical and Security Emergencies":"🚑",
        "Off Property Restaurants and Shopping": "🌍",
        "On Property Restaurants": "🍽️",
        "Beach and Pool": "🏖️",
        "Services": "🛠️",
        "Transportation": "🚗",
        "Fitness and Wellness": "💪",
        "Activities": "🎉",
        "Personal Chefs": "👨‍🍳"
    },
    categories: {
        // Off Property Restaurants and Shopping
        "Restaurants": "🍴",
        "Shopping": "🛍️",
        "Places to Visit": "🗺️",

        // On Property Restaurants
        "Signature Restaurant": "🌟",
        "Casual Dining": "🥗",
        "Bar and Lounge": "🍸",
        "Personal Chefs": "👨‍🍳",

        // Beach and Pool
        "Beach Access": "🌊",
        "Pool Areas": "🏊‍♀️",

        // Services
        "Concierge": "🤵",
        "Spa": "💆‍♀️",
        "Housekeeping": "🧹",
        "Personal Chefs": "👨‍🍳",

        // Transportation
        "Car Rental": "🚗",
        "Taxi Services": "🚕",
        "Airport Transfers": "✈️",

        // Fitness and Wellness
        "Gym": "🏋️‍♀️",
        "Yoga": "🧘‍♀️",
        "Personal Training": "💪",

        // Activities
        "Water Sports": "🏄‍♂️",
        "Tennis": "🎾",
        "Golf": "⛳"
    },
    subcategories: {
        // Restaurants
        "Near and Casual": "🍲",
        "Carolina - 30 min West": "🚗",
        "Fajardo - 30 min East": "🌅",
        "San Juan - 45 min West": "🏙️",

        // Shopping
        "On the way from the airport (more variety)": "🛒",
        "Near Bahia Beach": "🏖️",
        "Specialty Food, Wine and Liquors Stores": "🍷",
        "Shopping Malls": "🏢",

        // Personal Chefs
        "In-Villa Dining": "🏡",
        "Customized Menus": "📋",
        "Cooking Classes": "🥘"
    },
    contactTypes: {
        "restaurant": "🍽️",
        "shop": "🛍️",
        "service": "🛠️",
        "activity": "🎉",
        "contact": "👤",
        "phone": "📞",
        "email": "📧",
        "website": "🌐",
        "chef": "👨‍🍳"
    }
};

// Orden predefinido de secciones
const SECTION_ORDER = [
    "Medical and Security Emergencies",
    "Resort Restaurants and Venues",
    "Unit's Golf Cart",
    "Resort Activities and Adventures", 
    "Off Property Transportation and Airport Transfers",
    "Catering/Delivery/Special Services",
    "Off Property Restaurants and Shopping"
];

// Función para obtener emoji o ícono
function getIcon(type, key, defaultIcon = '📌') {
    return ICONS[type]?.[key] || defaultIcon;
}

// Clase para manejo de datos de contactos
class ContactManager {
    constructor(contacts) {
        this.contacts = contacts;
        this.sections = this.groupBySections(contacts);
        this.structuredData = this.processStructuredData();
    }

    // Método para procesar datos estructurados
    processStructuredData() {
        const structuredSections = {};
        
        this.contacts.forEach(contact => {
            const { section, category, subcategory } = contact;
            
            if (!structuredSections[section]) {
                structuredSections[section] = {
                    isSpecial: false,
                    icon: getIcon('sections', section),
                    order: SECTION_ORDER.indexOf(section),
                    categories: []
                };
            }

            // Buscar o crear categoría
            let categoryObj = structuredSections[section].categories.find(cat => cat.name === category);
            if (!categoryObj) {
                categoryObj = { 
                    name: category, 
                    icon: getIcon('categories', category),
                    subcategories: [], 
                    contacts: [] 
                };
                structuredSections[section].categories.push(categoryObj);
            }

            // Añadir subcategoría si existe
            if (subcategory) {
                if (!categoryObj.subcategories.some(sub => sub.name === subcategory)) {
                    categoryObj.subcategories.push({
                        name: subcategory,
                        icon: getIcon('subcategories', subcategory),
                        contacts: []
                    });
                }
            }

            // Añadir contacto
            categoryObj.contacts.push(contact);
        });

        // Ordenar secciones
        return Object.fromEntries(
            Object.entries(structuredSections)
                .sort(([, a], [, b]) => a.order - b.order)
        );
    }

    // Método para obtener secciones ordenadas
    getSections() {
        return Object.keys(this.structuredData);
    }

    // Método original de agrupación
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

    // Método de búsqueda más robusto
    search(query) {
        const lowerQuery = query.toLowerCase().trim();
        return this.contacts.filter(contact => 
            contact.name.toLowerCase().includes(lowerQuery) ||
            (contact.phone && contact.phone.includes(lowerQuery)) ||
            (contact.description && contact.description.toLowerCase().includes(lowerQuery)) ||
            (contact.category && contact.category.toLowerCase().includes(lowerQuery)) ||
            (contact.section && contact.section.toLowerCase().includes(lowerQuery)) ||
            (contact.subcategory && contact.subcategory.toLowerCase().includes(lowerQuery))
        );
    }

    // Método de depuración de subcategorías
    debugSubcategories() {
        console.group("🔍 Estructura Detallada de Contactos");
        
        Object.entries(this.structuredData).forEach(([sectionName, sectionData]) => {
            console.group(`📂 Sección: ${sectionName}`);
            
            sectionData.categories.forEach(category => {
                console.log(`🏷️ Categoría: ${category.name}`);
                console.log(`   Total Contactos: ${category.contacts.length}`);
                
                const subcategories = [...new Set(
                    category.contacts
                        .map(contact => contact.subcategory)
                        .filter(Boolean)
                )];
                
                console.log(`   Subcategorías: ${subcategories.join(', ')}`);
                
                subcategories.forEach(subcategory => {
                    const subcategoryContacts = category.contacts.filter(
                        contact => contact.subcategory === subcategory
                    );
                    
                    console.log(`     📌 Subcategoría: ${subcategory}`);
                    console.log(`        Contactos: ${subcategoryContacts.length}`);
                    subcategoryContacts.forEach(contact => {
                        console.log(`           👤 ${contact.name}`);
                    });
                });
            });
            
            console.groupEnd();
        });
        
        console.groupEnd();
    }

    // Método para obtener categorías de una sección
    getCategoriesInSection(sectionName) {
        return this.structuredData[sectionName]?.categories.map(cat => cat.name) || [];
    }

    // Método para obtener contactos de una categoría en una sección
    getContactsInCategory(sectionName, categoryName) {
        const section = this.structuredData[sectionName];
        const category = section?.categories.find(cat => cat.name === categoryName);
        return category?.contacts || [];
    }

    // Método para obtener subcategorías de una categoría
    getSubcategoriesInCategory(sectionName, categoryName) {
        const section = this.structuredData[sectionName];
        const category = section?.categories.find(cat => cat.name === categoryName);
        
        // Si no hay contactos, devolver un arreglo vacío
        if (!category || category.contacts.length === 0) return [];

        // Obtener subcategorías únicas de los contactos
        const subcategories = [...new Set(
            category.contacts
                .map(contact => contact.subcategory)
                .filter(Boolean)
        )];

        return subcategories;
    }

    // Método para obtener contactos de una subcategoría
    getContactsInSubcategory(sectionName, categoryName, subcategoryName) {
        const section = this.structuredData[sectionName];
        const category = section?.categories.find(cat => cat.name === categoryName);
        
        // Si no hay contactos, devolver un arreglo vacío
        if (!category || category.contacts.length === 0) return [];

        // Filtrar contactos por subcategoría
        return category.contacts.filter(contact => 
            contact.subcategory === subcategoryName
        );
    }

    // Método de renderizado actualizado
    renderContactDetails(contact) {
        const contactIcon = getIcon('contactTypes', 'contact');
        const phoneIcon = getIcon('contactTypes', 'phone');
        const descriptionIcon = '📝';

        return `
            <strong>${contactIcon} ${contact.name}</strong>
            ${contact.phone ? `<div>${phoneIcon} ${contact.phone}</div>` : ''}
            ${contact.description ? `<small>${descriptionIcon} ${contact.description}</small>` : ''}
        `;
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
        
        const phonebook = document.getElementById("phonebook");
        const contactsList = document.getElementById("contacts-list");
        const backToMenuBtn = document.getElementById("back-to-menu");
        const currentCategoryTitle = document.getElementById("current-category-title");
        const globalSearch = document.getElementById("global-search");

        phonebook.innerHTML = ''; // Limpiar contenido previo

        if (contacts.length === 0) {
            const noContactsLi = document.createElement("div");
            noContactsLi.className = "error";
            noContactsLi.textContent = "No se encontraron contactos. Verifica tu conexión o configuración de Airtable.";
            phonebook.appendChild(noContactsLi);
            return;
        }

        // Renderizado de secciones
        contactManager.getSections().forEach((sectionName, index) => {
            const sectionDiv = document.createElement("div");
            sectionDiv.className = "section";
            
            const sectionIcon = contactManager.structuredData[sectionName].icon;
            sectionDiv.textContent = `${sectionIcon} ${sectionName}`;

            // Evento para mostrar contactos de la sección
            sectionDiv.addEventListener("click", () => {
                // Desactivar otras secciones
                document.querySelectorAll('.section').forEach(sec => sec.classList.remove('expanded'));
                sectionDiv.classList.add('expanded');

                contactsList.innerHTML = ''; // Limpiar lista previa
                currentCategoryTitle.textContent = sectionName;

                const sectionCategories = contactManager.getCategoriesInSection(sectionName);

                sectionCategories.forEach(categoryName => {
                    const categoryDiv = document.createElement("div");
                    categoryDiv.className = "category";
                    
                    const categoryIcon = contactManager.structuredData[sectionName].categories
                        .find(cat => cat.name === categoryName).icon;
                    
                    categoryDiv.textContent = `${categoryIcon} ${categoryName}`;

                    // Evento para expandir categoría
                    categoryDiv.addEventListener("click", (e) => {
                        e.stopPropagation();
                        
                        // Limpiar categorías previas
                        document.querySelectorAll('.category').forEach(cat => cat.classList.remove('expanded'));
                        categoryDiv.classList.add('expanded');

                        const categoryContacts = contactManager.getContactsInCategory(sectionName, categoryName);
                        const subcategories = contactManager.getSubcategoriesInCategory(sectionName, categoryName);
                        
                        const contactsContainer = document.createElement("div");
                        contactsContainer.className = "category-contacts";

                        // Renderizar subcategorías
                        if (subcategories.length > 0) {
                            subcategories.forEach(subcategory => {
                                const subcategoryContacts = contactManager.getContactsInSubcategory(sectionName, categoryName, subcategory);
                                
                                const subcategoryHeader = document.createElement("h4");
                                const subcategoryIcon = getIcon('subcategories', subcategory);
                                subcategoryHeader.textContent = `${subcategoryIcon} ${subcategory} (${subcategoryContacts.length})`;
                                contactsContainer.appendChild(subcategoryHeader);

                                subcategoryContacts.sort((a, b) => a.name.localeCompare(b.name)).forEach(contact => {
                                    const contactDiv = document.createElement("div");
                                    contactDiv.className = "contact";
                                    contactDiv.innerHTML = contactManager.renderContactDetails(contact);
                                    contactsContainer.appendChild(contactDiv);
                                });
                            });
                        } else {
                            // Sin subcategorías
                            categoryContacts.sort((a, b) => a.name.localeCompare(b.name)).forEach(contact => {
                                const contactDiv = document.createElement("div");
                                contactDiv.className = "contact";
                                contactDiv.innerHTML = contactManager.renderContactDetails(contact);
                                contactsContainer.appendChild(contactDiv);
                            });
                        }

                        // Limpiar contenido previo y añadir nuevos contactos
                        contactsList.innerHTML = '';
                        contactsList.appendChild(contactsContainer);

                        // Mostrar sección de contactos
                        document.getElementById('sections-menu').classList.add('hidden');
                        document.getElementById('contacts-display').classList.remove('hidden');
                    });

                    contactsList.appendChild(categoryDiv);
                });

                // Mostrar sección de contactos
                document.getElementById('sections-menu').classList.add('hidden');
                document.getElementById('contacts-display').classList.remove('hidden');
            });

            phonebook.appendChild(sectionDiv);
        });

        // Botón de retorno al menú
        backToMenuBtn.addEventListener("click", () => {
            document.getElementById('contacts-display').classList.add('hidden');
            document.getElementById('sections-menu').classList.remove('hidden');
        });

        // Búsqueda global
        globalSearch.addEventListener('input', (e) => {
            const query = e.target.value;
            const results = contactManager.search(query);

            contactsList.innerHTML = ''; // Limpiar lista previa
            currentCategoryTitle.textContent = `Resultados de búsqueda: ${results.length}`;

            if (results.length === 0) {
                const noResultsDiv = document.createElement("div");
                noResultsDiv.className = "no-results";
                noResultsDiv.textContent = "No se encontraron contactos.";
                contactsList.appendChild(noResultsDiv);
            } else {
                results.forEach(contact => {
                    const contactDiv = document.createElement("div");
                    contactDiv.className = "contact";
                    contactDiv.innerHTML = contactManager.renderContactDetails(contact);
                    contactsList.appendChild(contactDiv);
                });
            }

            // Mostrar sección de contactos
            document.getElementById('sections-menu').classList.add('hidden');
            document.getElementById('contacts-display').classList.remove('hidden');
        });

    } catch (error) {
        console.error("❌ Error construyendo el árbol de contactos:", error);
    }
}

// Cargar phonebook cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', buildTree);

// Exponer ContactManager globalmente para pruebas
window.ContactManager = ContactManager;