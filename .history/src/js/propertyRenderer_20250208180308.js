import { villas } from '../../../properties.js';

// Función para cargar la plantilla HTML
async function loadTemplate() {
    try {
        const response = await fetch('/src/html/pages/model.html');
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const template = await response.text();
        console.log('Template cargado correctamente');
        return template;
    } catch (error) {
        console.error('Error cargando template:', error);
        throw error;
    }
}

// Función para renderizar una propiedad específica
function renderProperty(template, propertyKey, propertyData) {
    console.log('Renderizando propiedad:', propertyKey);
    console.log('Datos de la propiedad:', JSON.stringify(propertyData, null, 2));
    let html = template;

    try {
        // Reemplazos básicos
        const basicReplacements = [
            {
                selector: /<title>.*?<\/title>/,
                value: `<title>Luxe Properties - ${propertyData.property_title}</title>`
            },
            {
                selector: /<h1[^>]*>.*?<\/h1>/,
                value: `<h1 id="propertyTitle">${propertyData.property_title}</h1>`
            },
            {
                selector: /<img[^>]*class="property-image"[^>]*>/,
                value: `<img src="${propertyData.image}" alt="${propertyData.property_title}" class="property-image">`
            }
        ];

        // Aplicar reemplazos básicos
        basicReplacements.forEach(({ selector, value }) => {
            html = html.replace(selector, value);
        });

        // Procesar información de acomodación
        if (propertyData['Property Information']?.Accomodation) {
            const [bedrooms, type] = propertyData['Property Information'].Accomodation.split('<br>');
            if (bedrooms && type) {
                html = html.replace(
                    /<h3>4 bedroom\/ 4 bathroom[^<]*<\/h3>/,
                    `<h3>${bedrooms}</h3>`
                );
                html = html.replace(
                    /<h3>Penthouse Villa[^<]*<\/h3>/,
                    `<h3>${type}</h3>`
                );
            }
        }

        // Función para crear lista de información
        const createInfoList = (data) => {
            if (!data) return '';
            return Object.entries(data)
                .map(([key, value]) => `<li><strong>${key}:</strong> ${value}</li>`)
                .join('\n');
        };

        // Actualizar información de WiFi
        if (propertyData['Wifi Information']) {
            const wifiListHtml = createInfoList(propertyData['Wifi Information']);
            html = html.replace(
                /(<div class="info-group">\s*<h3>Wifi Information<\/h3>\s*<ul class="info-list"[^>]*>)[\s\S]*?(<\/ul>)/,
                `$1\n${wifiListHtml}$2`
            );
        }

        // Actualizar información de estacionamiento
        if (propertyData['Parking Information']) {
            const parkingListHtml = createInfoList(propertyData['Parking Information']);
            html = html.replace(
                /(<div class="info-group">\s*<h3>Parking Information<\/h3>\s*<ul class="info-list"[^>]*>)[\s\S]*?(<\/ul>)/,
                `$1\n${parkingListHtml}$2`
            );
        }

        return html;

    } catch (error) {
        console.error('Error al renderizar la propiedad:', error);
        throw error;
    }
}

// Función principal que maneja la carga de la página
async function initializeProperty() {
    try {
        const urlParams = new URLSearchParams(window.location.search);
        const propertyKey = decodeURIComponent(urlParams.get('property'));

        console.log('Property Key from URL:', propertyKey);
        console.log('Available properties:', Object.keys(villas));

        if (!propertyKey) {
            throw new Error('No property key provided');
        }

        if (!villas[propertyKey]) {
            throw new Error(`Property not found: ${propertyKey}`);
        }

        const propertyData = villas[propertyKey];
        console.log('Property Data:', JSON.stringify(propertyData, null, 2));

        // Actualizar el título
        document.title = `Luxe Properties - ${propertyData.property_title}`;

        // Actualizar la imagen y el título de la propiedad
        const propertyImage = document.querySelector('.property-image');
        if (propertyImage) {
            propertyImage.src = propertyData.image;
            propertyImage.alt = propertyData.property_title;
        }

        const propertyTitle = document.querySelector('#propertyTitle');
        if (propertyTitle) {
            propertyTitle.textContent = propertyData.property_title;
        }

        // Actualizar la información de acomodación
        if (propertyData['Property Information']?.Accomodation) {
            const [bedrooms, type] = propertyData['Property Information'].Accomodation.split('<br>');
            const h3Elements = document.querySelectorAll('.property-welcome h3');
            if (h3Elements.length >= 2) {
                h3Elements[0].textContent = bedrooms;
                h3Elements[1].textContent = type;
            }
        }

        // Función para actualizar una lista de información
        const updateInfoList = (sectionTitle, data) => {
            console.log(`Buscando sección: ${sectionTitle}`);
            console.log('Datos disponibles:', data);

            const infoGroups = document.querySelectorAll('.info-group');
            console.log(`Encontrados ${infoGroups.length} grupos de información`);

            for (const group of infoGroups) {
                const h3 = group.querySelector('h3');
                console.log('Título encontrado:', h3?.textContent);

                if (h3 && h3.textContent.trim() === sectionTitle) {
                    const ul = group.querySelector('ul.info-list');
                    if (ul && data) {
                        const items = Object.entries(data).map(([key, value]) => {
                            return `<li><strong>${key}:</strong> ${value}</li>`;
                        });
                        ul.innerHTML = items.join('');
                        console.log(`Actualizada sección ${sectionTitle} con:`, items);
                    } else {
                        console.log('No se encontró la lista o no hay datos para:', sectionTitle);
                    }
                    break;
                }
            }
        };

        // Actualizar información de WiFi y Parking
        console.log('Datos de la propiedad:', propertyData);
        
        const wifiInfo = propertyData['Wifi Information'] || {};
        console.log('Actualizando WiFi Information...', wifiInfo);
        updateInfoList('Wifi Information', wifiInfo);
        
        const parkingInfo = propertyData['Parking Information'] || {};
        console.log('Actualizando Parking Information...', parkingInfo);
        updateInfoList('Parking Information', parkingInfo);

        // Cargar los scripts necesarios en orden
        const loadScript = (src) => {
            return new Promise((resolve, reject) => {
                const script = document.createElement('script');
                script.type = 'module';
                script.src = src;
                script.onload = resolve;
                script.onerror = reject;
                document.body.appendChild(script);
            });
        };

        // Asegurarse de que los modales estén disponibles
        await loadScript('/src/js/modals.js');
        
        // Importar y exponer las funciones modales
        const modalModule = await import('/src/js/modals.js');
        Object.assign(window, modalModule);

        // Verificar que los modales estén presentes
        const modalIds = ['golfCartModal', 'golfRatesModal', 'tennisModal', 'kidsClubModal'];
        modalIds.forEach(id => {
            const modal = document.getElementById(id);
            console.log(`Modal ${id} presente:`, !!modal);
        });

        console.log('Página actualizada completamente');
    } catch (error) {
        console.error('Error loading property:', error);
        alert(`Error cargando la propiedad: ${error.message}`);
        window.location.href = '/index.html';
    }
}

// Inicializar la página cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', initializeProperty);

// Inicializar cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', initializeProperty);
