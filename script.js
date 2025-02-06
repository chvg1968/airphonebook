import { fetchAllContacts } from "./src/js/Api.js";
import { buildTree } from "./src/js/Tree.js";
import { SECTION_ORDER } from "./src/js/constants.js";
import { getIcon } from "./src/js/utils.js"; 

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
        const SPECIAL_SECTIONS = ['Medical and Security Emergencies', 'Unit\'s Golf Cart'];
        
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
        const isKidsClub = contact.name.includes('St Regis Kid\'s Club');
        // Detectar la página de Villa Clara en cualquier ambiente
        const isVillaClaraPage = window.location.pathname.includes('villaclara') || 
                                window.location.href.includes('villaclara');
        console.log('Is Villa Clara page:', isVillaClaraPage, 'Path:', window.location.pathname, 'URL:', window.location.href);

        let html = `
            <strong>${contact.icon || ''} ${contact.name}</strong>
            ${contact.phone && contact.phone !== 'null' ? `<div>${phoneIcon} ${contact.phone}</div>` : '<div>Phone contact is not available</div>'}
            ${contact.description ? `<small>${descriptionIcon} ${contact.description}</small>` : ''}
        `;

        console.log('Rendering contact:', {
            name: contact.name,
            section: contact.section,
            isGolfCartSection,
            isGolfShop,
            isTennis,
            isKidsClub,
            isVillaClaraPage
        });

        if (isVillaClaraPage) {
            console.log('Adding modal button for:', contact.name);
            if (isGolfCartSection) {
                html += `<button class="view-more-btn" onclick="openGolfCartModal()"><i class="fas fa-info-circle"></i> View more information</button>`;
                console.log('Added Golf Cart button');
            } else if (isGolfShop) {
                console.log('Adding Golf Shop modal button');
                // Verificar que la función existe
                console.log('openGolfRatesModal exists:', typeof window.openGolfRatesModal === 'function');
                html += `<button class="view-more-btn" onclick="openGolfRatesModal()"><i class="fas fa-info-circle"></i> View rates and information</button>`;
                console.log('Added Golf Shop button');
            } else if (isTennis) {
                html += `<button class="view-more-btn" onclick="openTennisModal()"><i class="fas fa-info-circle"></i> View tennis information</button>`;
                console.log('Added Tennis button');
            } else if (isKidsClub) {
                html += `<button class="view-more-btn" onclick="openKidsClubModal()"><i class="fas fa-info-circle"></i> View Kids Club information</button>`;
                console.log('Added Kids Club button');
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
