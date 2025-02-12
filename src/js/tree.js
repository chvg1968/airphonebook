import { fetchAllContacts } from "./Api.js";
import { getIcon } from "./utils.js";

// Variables globales para el estado de navegación
let currentSection = null;
let currentCategory = null;
let currentSubcategory = null;
let contactManager = null;
let contactsList = null;
let currentCategoryTitle = null;

// Función para determinar la ubicación actual
const getCurrentLocation = () => {
    if (currentSubcategory) return 'subcategory';
    if (currentCategory) return 'category';
    if (currentSection) return 'section';
    return 'menu';
};

// Función para renderizar contactos
const renderContacts = (contacts) => {
    console.log('Rendering contacts:', contacts.length);
    return contacts.map(contact => {
        console.log('Processing contact:', contact.name, contact.section);
        const contactDiv = document.createElement('div');
        contactDiv.className = 'contact';
        const html = contactManager.renderContactDetails(contact);
        console.log('Generated HTML for contact:', contact.name, html.length);
        contactDiv.innerHTML = html;
        return contactDiv;
    });
};

// Función para limpiar contactos
const clearContacts = () => {
    contactsList.innerHTML = '';
    document.getElementById('current-category-title').textContent = '';
    document.getElementById('contacts-display').classList.add('hidden');
};

// Función para manejar el click en una categoría
const handleCategoryClick = (category, sectionName) => (e) => {
    e.stopPropagation();

    // Limpiar selecciones previas
    document.querySelectorAll('.category').forEach(cat => {
        if (cat !== e.currentTarget) {
            cat.classList.remove('expanded');
        }
    });

    // Toggle la categoría actual
    const isExpanding = !e.currentTarget.classList.contains('expanded');
    e.currentTarget.classList.toggle('expanded');

    // Si estamos colapsando la categoría, limpiar los contactos y ocultar
    if (!isExpanding) {
        clearContacts();
        document.getElementById('contacts-display').classList.add('hidden');
        return;
    }
    // Asegurarnos que el display de contactos esté visible al expandir
    document.getElementById('contacts-display').classList.remove('hidden');

    // Actualizar estado
    currentCategory = category.name;
    currentCategoryTitle.textContent = `${sectionName} - ${category.name}`;

    // Preparar contenedor
    const contactsContainer = document.createElement('div');
    contactsContainer.className = 'category-contacts';

    // Obtener subcategorías únicas de los contactos de esta categoría
    const subcategories = contactManager.getSubcategoriesInCategory(sectionName, category.name);
    
    if (subcategories.length > 0) {
        // Mostrar subcategorías
        subcategories.forEach(subcategoryName => {
            const subcategoryDiv = document.createElement('div');
            subcategoryDiv.className = 'subcategory';
            const subcategoryIcon = getIcon('subcategories', subcategoryName);
            subcategoryDiv.innerHTML = `${subcategoryIcon} ${subcategoryName}`;

            subcategoryDiv.addEventListener('click', (e) => {
                e.stopPropagation();

                // Limpiar selecciones previas
                document.querySelectorAll('.subcategory').forEach(sub => sub.classList.remove('selected'));
                subcategoryDiv.classList.add('selected');

                // Actualizar estado
                currentSubcategory = subcategoryName;
                currentCategoryTitle.textContent = `${sectionName} - ${category.name} - ${subcategoryName}`;

                // Actualizar contenido
                contactsContainer.innerHTML = '';
                const contacts = contactManager.getContactsInSubcategory(sectionName, category.name, subcategoryName);
                const contactElements = renderContacts(contacts);
                contactElements.forEach(element => contactsContainer.appendChild(element));
            });

            contactsContainer.appendChild(subcategoryDiv);
        });
    } else {
        // Para "Aqua Tours and Boat Charters" no mostrar contactos directos
        if (category.name !== "Aqua Tours and Boat Charters") {
            // Mostrar contactos de la categoría directamente
            const contacts = contactManager.getContactsInCategory(sectionName, category.name);
            if (contacts && contacts.length > 0) {
                contactsContainer.appendChild(renderContacts(contacts));
            } else {
                // Si la categoría no tiene contactos, mostrar los contactos de la sección
                const sectionContacts = contactManager.contacts.filter(contact => contact.section === sectionName);
                contactsContainer.appendChild(renderContacts(sectionContacts));
            }
        }
    }

    // Actualizar vista
    contactsList.innerHTML = '';
    contactsList.appendChild(contactsContainer);
};

// Función para manejar la visibilidad del botón flotante
const handleFloatingButton = () => {
    const backButton = document.getElementById('back-to-menu-float');
    const menuSection = document.getElementById('sections-menu');

    if (!backButton || !menuSection) return;

    // Función para verificar la posición del scroll
    const checkScrollVisibility = () => {
        const menuTop = menuSection.getBoundingClientRect().top;
        const scrolled = window.scrollY > 100; // Mostrar después de 100px de scroll

        if (scrolled && menuTop < 0) {
            backButton.classList.add('visible');
        } else {
            backButton.classList.remove('visible');
        }
    };

    // Escuchar el evento de scroll
    window.addEventListener('scroll', checkScrollVisibility);

    // Click en el botón flotante
    backButton.addEventListener('click', () => {
        menuSection.scrollIntoView({ behavior: 'smooth' });
    });

    // Verificar inicialmente
    checkScrollVisibility();

};

export async function buildTree() {
    try {
        const contacts = await fetchAllContacts();
        console.log('📈 Contactos recuperados:', contacts.length);

        contactManager = new ContactManager(contacts);
        
        const phonebook = document.getElementById("phonebook");
        contactsList = document.getElementById("contacts-list");
        const backToMenuBtn = document.getElementById("back-to-menu");
        const globalSearch = document.getElementById("global-search");
        
        // Limpiar cualquier título existente
        const categoryTitle = document.getElementById("current-category-title");
        if (categoryTitle) {
            categoryTitle.style.display = 'none';
        }

        if (!phonebook || !contactsList || !backToMenuBtn || !globalSearch) {
            console.error('Elementos del DOM no encontrados');
            return;
        }

        phonebook.innerHTML = ''; // Limpiar contenido previo

        // Renderizado de secciones
        Object.entries(contactManager.structuredData).forEach(([sectionName, sectionData]) => {
            const sectionDiv = document.createElement('div');
            sectionDiv.className = 'section';
            sectionDiv.innerHTML = `${sectionData.icon} ${sectionName}`;

            // Crear el contenedor del árbol
            const treeItem = document.createElement('div');
            treeItem.className = 'tree-item';

            // Crear el contenido de la sección
            const treeContent = document.createElement('div');
            treeContent.className = 'tree-content';

            // Añadir icono de expansión
            const toggleIcon = document.createElement('span');
            toggleIcon.className = 'toggle-icon';
            toggleIcon.innerHTML = '▶'; // Triángulo derecha
            treeContent.appendChild(toggleIcon);

            // Añadir icono de la sección
            treeContent.innerHTML += `${sectionData.icon} ${sectionName}`;

            // Crear contenedor para los hijos (categorías)
            const treeChildren = document.createElement('div');
            treeChildren.className = 'tree-children';



            treeContent.addEventListener('click', () => {
                // Colapsar todas las demás secciones
                document.querySelectorAll('.tree-content').forEach(el => {
                    if (el !== treeContent) {
                        el.classList.remove('expanded');
                        el.querySelector('.toggle-icon')?.classList.remove('expanded');
                        el.nextElementSibling?.classList.remove('expanded');
                    }
                });

                // Actualizar estado
                currentSection = sectionName;
                currentCategory = null;
                currentSubcategory = null;
                
                // Limpiar lista de contactos
                clearContacts();
                
                // Toggle expansión de esta sección
                toggleIcon.classList.toggle('expanded');
                treeChildren.classList.toggle('expanded');
                treeContent.classList.toggle('expanded');

                // Si se está colapsando la sección, limpiar los contactos
                if (!treeContent.classList.contains('expanded')) {
                    clearContacts();
                }

                // Si es la primera vez que se expande
                if (treeChildren.children.length === 0) {
                    // Si es una sección especial o no tiene categorías, mostrar los contactos directamente
                    if (sectionData.isSpecial || sectionData.categories.length === 0) {
                        // Agregar botones de modales si es la sección de servicios
                        if (sectionName === 'Services') {
                            const serviceButtons = [
                                { name: 'Golf Cart Information', icon: '🛺', modalFunction: 'openGolfCartModal' },
                                { name: 'Golf Rates', icon: '⛳', modalFunction: 'openGolfRatesModal' },
                                { name: 'Tennis Services', icon: '🎾', modalFunction: 'openTennisModal' },
                                { name: "Kid's Club", icon: '👶', modalFunction: 'openKidsClubModal' }
                            ];

                            serviceButtons.forEach(service => {
                                const serviceItem = document.createElement('div');
                                serviceItem.className = 'tree-item service-button';
                                
                                const treeContent = document.createElement('div');
                                treeContent.className = 'tree-content';
                                
                                const iconSpan = document.createElement('span');
                                iconSpan.className = 'service-icon';
                                iconSpan.textContent = service.icon;
                                
                                treeContent.appendChild(iconSpan);
                                treeContent.appendChild(document.createTextNode(service.name));
                                
                                // Importar la función del módulo modals.js dinámicamente
                                import('../../js/modals.js')
                                    .then(modalsModule => {
                                        const modalFunction = modalsModule[service.modalFunction];
                                        if (modalFunction) {
                                            treeContent.addEventListener('click', () => modalFunction());
                                        } else {
                                            console.error(`Modal function ${service.modalFunction} not found`);
                                        }
                                    })
                                    .catch(error => console.error('Error loading modals.js:', error));
                                
                                serviceItem.appendChild(treeContent);
                                treeChildren.appendChild(serviceItem);
                            });
                        }

                        const contacts = sectionData.contacts || contactManager.contacts.filter(contact => contact.section === sectionName);
                        displayContacts(contacts);
                        return;
                    }

                    // Mostrar categorías si existen
                    if (sectionData.categories.length > 0) {
                        sectionData.categories.forEach(category => {
                            const categoryItem = document.createElement('div');
                            categoryItem.className = 'tree-item';

                            const categoryContent = document.createElement('div');
                            categoryContent.className = 'tree-content';

                            // Añadir icono de expansión si tiene subcategorías
                            const subcategories = contactManager.getSubcategoriesInCategory(sectionName, category.name);
                            if (subcategories.length > 0) {
                                const categoryToggle = document.createElement('span');
                                categoryToggle.className = 'toggle-icon';
                                categoryToggle.innerHTML = '▶';
                                categoryContent.appendChild(categoryToggle);
                            }

                            categoryContent.innerHTML += `${category.icon} ${category.name}`;

                            // Crear contenedor para subcategorías
                            const categoryChildren = document.createElement('div');
                            categoryChildren.className = 'tree-children';

                            categoryContent.addEventListener('click', (e) => {
                                e.stopPropagation();
                                
                                // Verificar si estamos expandiendo o colapsando
                                const isExpanding = !categoryContent.classList.contains('expanded');
                                
                                // Si estamos colapsando
                                if (!isExpanding) {
                                    clearContacts();
                                    document.getElementById('contacts-display').classList.add('hidden');
                                    currentCategory = null;
                                }
                                
                                // Colapsar otras categorías en la misma sección
                                const siblingCategories = treeChildren.querySelectorAll('.tree-content');
                                siblingCategories.forEach(el => {
                                    if (el !== categoryContent) {
                                        el.classList.remove('expanded');
                                        el.querySelector('.toggle-icon')?.classList.remove('expanded');
                                        el.nextElementSibling?.classList.remove('expanded');
                                    }
                                });

                                // Toggle expansión si hay subcategorías
                                const categoryToggle = categoryContent.querySelector('.toggle-icon');
                                if (subcategories.length > 0 && categoryToggle) {
                                    categoryToggle.classList.toggle('expanded');
                                    categoryChildren.classList.toggle('expanded');
                                    categoryContent.classList.toggle('expanded');
                                    
                                    // Solo actualizar estado y mostrar contactos si estamos expandiendo
                                    if (isExpanding) {
                                        currentCategory = category.name;
                                        document.getElementById('contacts-display').classList.remove('hidden');
                                    }

                                    // Cargar subcategorías si es la primera vez
                                    if (categoryChildren.children.length === 0) {
                                        subcategories.forEach(subcategoryName => {
                                            const subcategoryItem = document.createElement('div');
                                            subcategoryItem.className = 'tree-item';

                                            const subcategoryContent = document.createElement('div');
                                            subcategoryContent.className = 'tree-content';
                                            subcategoryContent.innerHTML = `${getIcon('subcategories', subcategoryName)} ${subcategoryName}`;

                                            subcategoryContent.addEventListener('click', (e) => {
                                                e.stopPropagation();
                                                currentSubcategory = subcategoryName;

                                                // Mostrar contactos de la subcategoría
                                                const contacts = contactManager.getContactsInSubcategory(sectionName, category.name, subcategoryName);
                                                displayContacts(contacts);
                                            });

                                            subcategoryItem.appendChild(subcategoryContent);
                                            categoryChildren.appendChild(subcategoryItem);
                                        });
                                    }
                                }

                                // Solo mostrar contactos si no hay subcategorías
                                if (subcategories.length === 0) {
                                    const contacts = contactManager.getContactsInCategory(sectionName, category.name);
                                    displayContacts(contacts);
                                }
                            });

                            categoryItem.appendChild(categoryContent);
                            categoryItem.appendChild(categoryChildren);
                            treeChildren.appendChild(categoryItem);
                        });
                    }

                    // Mostrar contactos de la sección si existen
                    if (sectionData.contacts && sectionData.contacts.length > 0) {
                        displayContacts(sectionData.contacts);
                    }
                }
            });

            // Ensamblar el árbol
            treeItem.appendChild(treeContent);
            treeItem.appendChild(treeChildren);
            phonebook.appendChild(treeItem);
        });

        // Función para mostrar contactos
const displayContacts = (contacts, shouldScroll = true) => {
    // Limpiar y mostrar contactos
    contactsList.innerHTML = '';
    if (contacts && contacts.length > 0) {
        const contactsContainer = document.createElement('div');
        contactsContainer.className = 'contacts-container';
        const contactElements = renderContacts(contacts);
        contactElements.forEach(element => contactsContainer.appendChild(element));
        contactsList.appendChild(contactsContainer);

        if (shouldScroll) {
            // Scroll automático al inicio de la lista de contactos
            setTimeout(() => {
                const contactsDisplay = document.getElementById('contacts-display');
                if (contactsDisplay) {
                    window.scrollTo({
                        top: contactsDisplay.offsetTop - 20,
                        behavior: 'smooth'
                    });
                }
            }, 100);
        }
    } else {
        const noContactsDiv = document.createElement('div');
        noContactsDiv.className = 'no-contacts';
        noContactsDiv.textContent = 'No hay contactos disponibles';
        contactsList.appendChild(noContactsDiv);
    }

    // Mostrar la sección de contactos
    document.getElementById('sections-menu').classList.remove('hidden');
    document.getElementById('contacts-display').classList.remove('hidden');
    
    // Limpiar el título
    const categoryTitle = document.getElementById("current-category-title");
    if (categoryTitle) {
        categoryTitle.textContent = '';    
    }
};

// Configurar observador para el botón flotante
handleFloatingButton();

// Función para manejar el retorno
const handleBack = () => {
    const location = getCurrentLocation();
    const globalSearch = document.getElementById('global-search');

    // Si hay una búsqueda activa, limpiarla primero
    if (globalSearch && globalSearch.value.trim().length > 0) {
        globalSearch.value = '';
        document.getElementById('contacts-display').classList.add('hidden');
        document.getElementById('sections-menu').classList.remove('hidden');
        // Scroll al tope del menú
        const sectionsMenu = document.getElementById('sections-menu');
        if (sectionsMenu) {
            sectionsMenu.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
        return;
    }

    if (location === 'subcategory') {
        // Volver a la vista de categoría
        currentSubcategory = null;
        
        // Colapsar la subcategoría seleccionada
        document.querySelector('.subcategory.selected')?.classList.remove('selected');
        
        // Solo mostrar contactos si la categoría no tiene subcategorías
        if (currentSection && currentCategory) {
            const categoryData = contactManager.structuredData[currentSection]?.categories?.find(c => c.name === currentCategory);
            if (categoryData && (!categoryData.subcategories || categoryData.subcategories.length === 0)) {
                const contacts = contactManager.getContactsInCategory(currentSection, currentCategory);
                displayContacts(contacts);
            }
        }
    } 
    else if (location === 'category') {
        // Volver a la vista de sección
        currentCategory = null;
        
        // Colapsar la categoría expandida
        document.querySelector('.category.expanded')?.classList.remove('expanded');
        
        // Solo mostrar contactos si la sección no tiene categorías
        if (currentSection && contactManager.structuredData[currentSection]) {
            const sectionData = contactManager.structuredData[currentSection];
            if (!sectionData.categories || sectionData.categories.length === 0) {
                displayContacts(sectionData.contacts || []);
            }
        }
    } 
    else if (location === 'section') {
        // Volver al menú principal
        currentSection = null;
        document.getElementById('contacts-display').classList.add('hidden');
        document.getElementById('sections-menu').classList.remove('hidden');

        // Scroll al tope del menú
        const sectionsMenu = document.getElementById('sections-menu');
        if (sectionsMenu) {
            sectionsMenu.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }

        // Colapsar todos los elementos expandidos
        document.querySelectorAll('.expanded').forEach(el => el.classList.remove('expanded'));
    }

    // Ocultar el botón flotante
    document.getElementById('back-to-menu-float')?.classList.remove('visible');
};

// Asignar el manejador al botón de retorno
        backToMenuBtn.addEventListener('click', handleBack);

        // Búsqueda global
        const performSearch = () => {
            const query = globalSearch.value.trim();
            
            if (query.length === 0) {
                // Si la búsqueda está vacía, volver al menú principal
                document.getElementById('contacts-display').classList.add('hidden');
                document.getElementById('sections-menu').classList.remove('hidden');
                currentSection = null;
                currentCategory = null;
                currentSubcategory = null;
                return;
            }

            const results = contactManager.search(query);
            
            // Limpiar y mostrar resultados
            contactsList.innerHTML = '';
            if (results.length === 0) {
                const noResultsDiv = document.createElement('div');
                noResultsDiv.className = 'no-results';
                noResultsDiv.textContent = 'No se encontraron contactos.';
                contactsList.appendChild(noResultsDiv);
            } else {
                const contactsContainer = document.createElement('div');
                contactsContainer.className = 'contacts-container';
                const contactElements = renderContacts(results);
                contactElements.forEach(element => contactsContainer.appendChild(element));
                contactsList.appendChild(contactsContainer);
            }

            // Mostrar vista de contactos
            document.getElementById('contacts-display').classList.remove('hidden');
            
            // Scroll a los resultados
            const contactsDisplay = document.getElementById('contacts-display');
            if (contactsDisplay) {
                contactsDisplay.scrollIntoView({ behavior: 'smooth' });
            }
        };

        // Manejar el click en la lupa
        const searchIcon = document.querySelector('.search-icon');
        if (searchIcon) {
            searchIcon.addEventListener('click', performSearch);
        }

        // Manejar el evento keyup
        globalSearch.addEventListener('keyup', (e) => {
            const query = e.target.value.trim();
            
            if (query.length === 0) {
                // Si la búsqueda está vacía, volver al menú principal
                document.getElementById('contacts-display').classList.add('hidden');
                document.getElementById('sections-menu').classList.remove('hidden');
                currentSection = null;
                currentCategory = null;
                currentSubcategory = null;
                return;
            }

            // Procesar la búsqueda cuando se presiona Enter
            if (e.key === 'Enter') {
                performSearch();
            }

        });

        // Inicializar el botón flotante
        handleFloatingButton();

    } catch (error) {
        console.error('Error al construir el árbol:', error);
    }
}
