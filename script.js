import { fetchAllContacts } from "./src/js/api.js";
import { buildTree } from "./src/js/tree.js";
import { SECTION_ORDER } from "./src/js/constants.js";
import { getIcon } from "./src/js/utils.js";

// Exponer funciones globalmente
window.buildTree = buildTree;
window.fetchAllContacts = fetchAllContacts;

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
        const SPECIAL_SECTIONS = ['Medical and Security Emergencies', 'Unit\'s Golf Cart', 'Off Property Transportation and Airport Transfers'];
        
        this.contacts.forEach(contact => {
            const { section, category, subcategory } = contact;
            
            // Inicializar la sección si no existe
            if (!structuredSections[section]) {
                structuredSections[section] = {
                    isSpecial: SPECIAL_SECTIONS.includes(section),
                    icon: getIcon('sections', section),
                    order: SECTION_ORDER.indexOf(section),
                    categories: [],
                    contacts: []
                };
            }

            // Si es una sección especial, agregar contactos directamente
            if (SPECIAL_SECTIONS.includes(section)) {
                structuredSections[section].contacts.push(contact);
                return;
            }

            // Para secciones normales, procesar categorías
            const processedCategory = (!category || category === 'Sin Categoria') ? 'General' : category;
            
            // Buscar o crear categoría
            let categoryObj = structuredSections[section].categories.find(cat => cat.name === processedCategory);
            if (!categoryObj) {
                categoryObj = { 
                    name: processedCategory,
                    icon: getIcon('categories', processedCategory),
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

        console.log('🔍 Estructura de Secciones Procesadas:', structuredSections);

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
    renderPhoneNumbers(phone, phoneIcon) {
        if (!phone || phone === 'null') {
            return '';
        }

        // Primero limpiamos el string de teléfono de cualquier <br> y lo reemplazamos por comas
        const cleanPhone = phone.replace(/<br\s*\/?>/gi, ',');
        
        // Luego procesamos las comas
        const phones = cleanPhone.includes(',') ? 
            cleanPhone.split(',').map(p => p.trim()).filter(p => p) :
            [cleanPhone.trim()];

        // Si hay múltiples números, ponemos el ícono solo en el contenedor
        if (phones.length > 1) {
            const phoneNumbersHtml = phones
                .map(p => `<div class="phone-number">${p}</div>`)
                .join('');
            return `<div class="phone-numbers-container">
                ${phoneIcon}
                <div>${phoneNumbersHtml}</div>
            </div>`;
        }

        // Si es solo un número, lo mostramos como antes
        return `<div class="phone-numbers-container">
            <div class="phone-number">${phoneIcon}${phones[0]}</div>
        </div>`;
    }

    renderContactDetails(contact) {
        const phoneIcon = getIcon('contactTypes', 'phone');
        const descriptionIcon = '';
        const isGolfCartSection = contact.section === 'Unit\'s Golf Cart';
        // Depurar la detección de Golf Shop
        const contactNameLower = contact.name.toLowerCase();
        const isGolfShop = contactNameLower.includes('golf shop');
        console.log('Golf Shop detection:', {
            originalName: contact.name,
            lowerName: contactNameLower,
            isGolfShop: isGolfShop
        });
        const isTennis = contact.name.includes('Tennis Reservations');
        const isKidsClub = contact.name.includes('Four Seasons Tortuga Kid\'s Club');
        const isGroceryShopping = contact.name === 'Grocery Shopping Services';
        const isCleaningFees = contact.name === 'During Stay Cleaning Fees';
        // Detectar si estamos en una página de propiedad
        const isPropertyPage = window.location.pathname.includes('/pages/model.html');
        console.log('Is Property page:', isPropertyPage, 'Path:', window.location.pathname, 'URL:', window.location.href);

        let html = `
            <strong>${contact.icon || ''} ${contact.name}</strong>
            ${this.renderPhoneNumbers(contact.phone, phoneIcon)}
            ${contact.description ? `<small>${descriptionIcon} ${contact.description}</small>` : ''}
        `;

        console.log('Rendering contact:', {
            name: contact.name,
            section: contact.section,
            isGolfCartSection,
            isGolfShop,
            isTennis,
            isKidsClub,
            isPropertyPage
        });

        if (isPropertyPage) {
            console.log('Adding modal button for:', contact.name);
            // Crear el botón base
            let buttonHtml = '';
            let modalType = '';
            
            if (isGolfCartSection) {
                buttonHtml = `
                    <div class="view-more-text">View more information:</div>
                    <div class="modal-links">
                        <button class="view-more-btn" data-modal-type="golfCartInfo"><i class="fas fa-info-circle"></i> Charging Instructions and Parking</button>
                        <button class="view-more-btn" data-modal-type="golfCartRules"><i class="fas fa-exclamation-triangle"></i> Rules and Regulations</button>
                    </div>`;
                modalType = 'golfCartInfo';
            } else if (isGolfShop) {
                buttonHtml = `<button class="view-more-btn" data-modal-type="golfRates"><i class="fas fa-info-circle"></i>View rates and schedules</button>`;
                modalType = 'golfRates';
            } else if (isTennis) {
                buttonHtml = `<button class="view-more-btn" data-modal-type="tennis"><i class="fas fa-info-circle"></i>View rates and schedules</button>`;
                modalType = 'tennis';
            } else if (isKidsClub) {
                buttonHtml = `<button class="view-more-btn" data-modal-type="kidsClub"><i class="fas fa-info-circle"></i> View Kids Club information</button>`;
                modalType = 'kidsClub';
            } else if (isGroceryShopping) {
                buttonHtml = `<button class="view-more-btn" data-modal-type="groceryShopping"><i class="fas fa-info-circle"></i> View rates and fees</button>`;
                modalType = 'groceryShopping';
            } else if (isCleaningFees) {
                buttonHtml = `<button class="view-more-btn" data-modal-type="cleaningFees"><i class="fas fa-info-circle"></i> View cleaning fees</button>`;
                modalType = 'cleaningFees';
            }

            if (buttonHtml) {
                html += buttonHtml;
                // Usar setTimeout para asegurarnos de que el botón existe en el DOM
                setTimeout(() => {
                    const buttons = document.querySelectorAll('.view-more-btn');
                    if (buttons.length > 0) {
                        import('./src/js/modals.js')
                            .then(modalsModule => {
                                const modalFunctions = {
                                    golfCartInfo: modalsModule.openGolfCartInfoModal,
                                    golfCartRules: modalsModule.openGolfCartRulesModal,
                                    golfRates: modalsModule.openGolfRatesModal,
                                    tennis: modalsModule.openTennisModal,
                                    kidsClub: modalsModule.openKidsClubModal,
                                    groceryShopping: modalsModule.openGroceryShoppingModal,
                                    cleaningFees: modalsModule.openCleaningFeesModal
                                };
                                
                                buttons.forEach(button => {
                                    const modalType = button.getAttribute('data-modal-type');
                                    const modalFunction = modalFunctions[modalType];
                                    if (modalFunction) {
                                        button.addEventListener('click', modalFunction);
                                    } else {
                                        console.error(`Modal function for ${modalType} not found`);
                                    }
                                });
                            })
                            .catch(error => console.error('Error loading modals.js:', error));
                    }
                }, 0);
            }
        } else {
            console.log('Not Villa Clara page, skipping modal buttons');
        }

        return html;
    }
}

fetchAllContacts(); 

buildTree();

// Cargar phonebook cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', buildTree);

// Exponer ContactManager globalmente para pruebas
window.ContactManager = ContactManager;
