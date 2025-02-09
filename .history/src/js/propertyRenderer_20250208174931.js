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
                // Reemplazar las líneas de acomodación
                html = html.replace(
                    /<h3>4 bedroom\/ 4 bathroom[^<]*<\/h3>\s*<h3>Penthouse Villa[^<]*<\/h3>/,
                    `<h3>${bedrooms}</h3>\n                <h3>${type}</h3>`
                );
            }
        }

        // Función para crear una sección de información
        const createInfoSection = (title, data) => {
            if (!data) return '';
            
            const items = Object.entries(data)
                .map(([key, value]) => `
                    <div class="info-item">
                        <strong>${key}:</strong>
                        <span>${value}</span>
                    </div>`)
                .join('');

            return `
                <div class="info-section ${title.toLowerCase().replace(' ', '-')}">
                    <h2>${title}</h2>
                    <div class="info-content">
                        ${items}
                    </div>
                </div>`;
        };

        // Encontrar la columna de información de la propiedad
        const propertyColumnMatch = html.match(/<div class="property-column">([\s\S]*?)<\/div>/);
        if (propertyColumnMatch) {
            let propertyColumn = propertyColumnMatch[0];
            const infoSections = [];

            // Crear secciones de información
            if (propertyData['Wifi Information']) {
                infoSections.push(createInfoSection('Wifi Information', propertyData['Wifi Information']));
            }
            if (propertyData['Parking Information']) {
                infoSections.push(createInfoSection('Parking Information', propertyData['Parking Information']));
            }

            // Reemplazar el contenido de la columna de propiedades
            const newPropertyColumn = `
                <div class="property-column">
                    <div class="property-info">
                        ${infoSections.join('\n')}
                    </div>
                </div>`;

            html = html.replace(propertyColumnMatch[0], newPropertyColumn);
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

        const template = await loadTemplate();
        
        // Renderizar la propiedad
        const renderedHtml = renderProperty(template, propertyKey, propertyData);
        
        // Reemplazar todo el contenido del documento
        document.open();
        document.write(renderedHtml);
        document.close();

        // Volver a agregar los scripts
        const scripts = [
            { type: 'module', src: '/src/js/propertyRenderer.js' },
            { type: 'module', src: '/src/js/modals.js' }
        ];

        scripts.forEach(scriptInfo => {
            const script = document.createElement('script');
            script.type = scriptInfo.type;
            script.src = scriptInfo.src;
            document.body.appendChild(script);
        });

        console.log('Página renderizada completamente');
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
