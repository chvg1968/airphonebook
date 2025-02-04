export async function buildTree() {
    try {
        const contacts = await fetchAllContacts();
        console.log('📊 Contactos recuperados:', contacts.length);

        const contactManager = new ContactManager(contacts);
        
        const phonebook = document.getElementById("phonebook");
        const contactsList = document.getElementById("contacts-list");
        const backToMenuBtn = document.getElementById("back-to-menu");
        const currentCategoryTitle = document.getElementById("current-category-title");
        const globalSearch = document.getElementById("global-search");

        // Variables para seguimiento de navegación
        let currentSection = null;
        let currentCategory = null;

        phonebook.innerHTML = ''; // Limpiar contenido previo

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
                currentSection = sectionName;
                currentCategory = null;

                const sectionCategories = contactManager.getCategoriesInSection(sectionName);

                if (sectionCategories.length === 0) {
                    // Si no hay categorías, mostrar directamente los contactos de la sección
                    const sectionContacts = contactManager.getContactsInCategory(sectionName, 'Sin Categoría');
                    sectionContacts.sort((a, b) => a.name.localeCompare(b.name)).forEach(contact => {
                        const contactDiv = document.createElement("div");
                        contactDiv.className = "contact";
                        contactDiv.innerHTML = contactManager.renderContactDetails(contact);
                        contactsList.appendChild(contactDiv);
                    });
                } else {
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

                            currentCategory = categoryName;

                            const categoryContacts = contactManager.getContactsInCategory(sectionName, categoryName);
                            const subcategories = contactManager.getSubcategoriesInCategory(sectionName, categoryName);
                            
                            const contactsContainer = document.createElement("div");
                            contactsContainer.className = "category-contacts";

                            // Renderizar subcategorías
                            if (subcategories.length > 0) {
                                subcategories.forEach(subcategory => {
                                    const subcategoryDiv = document.createElement("div");
                                    subcategoryDiv.className = "subcategory";
                                    const subcategoryIcon = getIcon('subcategories', subcategory);
                                    subcategoryDiv.textContent = `${subcategoryIcon} ${subcategory}`;

                                    // Evento para mostrar contactos de la subcategoría
                                    subcategoryDiv.addEventListener("click", (e) => {
                                        e.stopPropagation();

                                        const subcategoryContacts = contactManager.getContactsInSubcategory(sectionName, categoryName, subcategory);
                                        contactsContainer.innerHTML = ''; // Limpiar contactos previos

                                        subcategoryContacts.sort((a, b) => a.name.localeCompare(b.name)).forEach(contact => {
                                            const contactDiv = document.createElement("div");
                                            contactDiv.className = "contact";
                                            contactDiv.innerHTML = contactManager.renderContactDetails(contact);
                                            contactsContainer.appendChild(contactDiv);
                                        });
                                    });

                                    contactsContainer.appendChild(subcategoryDiv);
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
                }

                // Mostrar sección de contactos
                document.getElementById('sections-menu').classList.add('hidden');
                document.getElementById('contacts-display').classList.remove('hidden');
            });

            phonebook.appendChild(sectionDiv);
        });

        // Botón de retorno dinámico
        backToMenuBtn.addEventListener("click", () => {
            if (currentCategory) {
                // Si estamos en una categoría, volver a la lista de categorías de la sección
                contactsList.innerHTML = ''; // Limpiar lista previa
                currentCategoryTitle.textContent = currentSection;
                currentCategory = null;

                const sectionCategories = contactManager.getCategoriesInSection(currentSection);

                sectionCategories.forEach(categoryName => {
                    const categoryDiv = document.createElement("div");
                    categoryDiv.className = "category";
                    
                    const categoryIcon = contactManager.structuredData[currentSection].categories
                        .find(cat => cat.name === categoryName).icon;
                    
                    categoryDiv.textContent = `${categoryIcon} ${categoryName}`;

                    // Evento para expandir categoría (mismo que en renderizado original)
                    categoryDiv.addEventListener("click", (e) => {
                        e.stopPropagation();
                        
                        document.querySelectorAll('.category').forEach(cat => cat.classList.remove('expanded'));
                        categoryDiv.classList.add('expanded');

                        currentCategory = categoryName;

                        const categoryContacts = contactManager.getContactsInCategory(currentSection, categoryName);
                        const subcategories = contactManager.getSubcategoriesInCategory(currentSection, categoryName);
                        
                        const contactsContainer = document.createElement("div");
                        contactsContainer.className = "category-contacts";

                        // Renderizar subcategorías (código similar al anterior)
                        if (subcategories.length > 0) {
                            subcategories.forEach(subcategory => {
                                const subcategoryDiv = document.createElement("div");
                                subcategoryDiv.className = "subcategory";
                                const subcategoryIcon = getIcon('subcategories', subcategory);
                                subcategoryDiv.textContent = `${subcategoryIcon} ${subcategory}`;

                                // Evento para mostrar contactos de la subcategoría
                                subcategoryDiv.addEventListener("click", (e) => {
                                    e.stopPropagation();

                                    const subcategoryContacts = contactManager.getContactsInSubcategory(currentSection, categoryName, subcategory);
                                    contactsContainer.innerHTML = ''; // Limpiar contactos previos

                                    subcategoryContacts.sort((a, b) => a.name.localeCompare(b.name)).forEach(contact => {
                                        const contactDiv = document.createElement("div");
                                        contactDiv.className = "contact";
                                        contactDiv.innerHTML = contactManager.renderContactDetails(contact);
                                        contactsContainer.appendChild(contactDiv);
                                    });
                                });

                                contactsContainer.appendChild(subcategoryDiv);
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

                        contactsList.innerHTML = '';
                        contactsList.appendChild(contactsContainer);
                    });

                    contactsList.appendChild(categoryDiv);
                });
            } else {
                // Si estamos en una sección, volver al menú de secciones
                document.getElementById('contacts-display').classList.add('hidden');
                document.getElementById('sections-menu').classList.remove('hidden');
                currentSection = null;
            }
        });

        // Búsqueda global
        globalSearch.addEventListener('input', (e) => {
            const query = e.target.value;
            const results = contactManager.search(query);

            contactsList.innerHTML = ''; // Limpiar lista previa
            currentCategoryTitle.textContent = `Resultados de búsqueda: ${results.length}`;
            currentSection = null;
            currentCategory = null;

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