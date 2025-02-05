import { fetchAllContacts } from "./src/js/api.js";
import { buildTree } from "./src/js/tree.js";
import { SECTION_ORDER } from "./src/js/constants.js";
import { getIcon } from "./src/js/utils.js"; 

// Función para obtener emoji o ícono


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
        const SPECIAL_SECTIONS = ['Medical and Security Emergencies'];
        
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
        const contactIcon = getIcon('contactTypes', 'contact');
        const phoneIcon = getIcon('contactTypes', 'phone');
        const descriptionIcon = '';

        return `
            <strong>${contactIcon} ${contact.name}</strong>
            ${contact.phone && contact.phone !== 'null' ? `<div>${phoneIcon} ${contact.phone}</div>` : '<div>Phone contact isn’t available</div>'}
            ${contact.description ? `<small>${descriptionIcon} ${contact.description}</small>` : ''}
        `;
    }
}

fetchAllContacts(); 

buildTree();

// Cargar phonebook cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', buildTree);

// Exponer ContactManager globalmente para pruebas
window.ContactManager = ContactManager;