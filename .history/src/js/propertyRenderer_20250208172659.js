import { villas } from '../../../properties.js';

// Función para cargar la plantilla HTML
async function loadTemplate() {
    const response = await fetch('/src/html/pages/model.html');
    return await response.text();
}

// Función para renderizar una propiedad específica
function renderProperty(template, propertyData) {
    let html = template;
    
    // Reemplazar el título de la página y el encabezado
    html = html.replace(
        /<title>.*?<\/title>/,
        `<title>Luxe Properties - ${propertyData.property_title}</title>`
    );
    html = html.replace(
        /<h1[^>]*>.*?<\/h1>/,
        `<h1 id="propertyTitle">${propertyData.property_title}</h1>`
    );

    // Reemplazar la imagen de la propiedad
    html = html.replace(
        /<img[^>]*src="[^"]*"[^>]*>/,
        `<img src="${propertyData.image}" alt="${propertyData.property_title}" class="property-image">`
    );

    // Reemplazar la información de WiFi
    const wifiInfo = propertyData['Wifi Information'];
    const wifiReplacements = [
        ['Villa Network Name', wifiInfo['Villa Network Name']],
        ['Villa Password', wifiInfo['Villa Password']],
        ['Resort Network', wifiInfo['Resort Network']],
        ['Resort Password', wifiInfo['Resort Password']]
    ];

    wifiReplacements.forEach(([key, value]) => {
        const regex = new RegExp(`<li>${key}:.*?</li>`, 'g');
        html = html.replace(regex, `<li>${key}: ${value}</li>`);
    });

    // Reemplazar la información de estacionamiento
    const parkingInfo = propertyData['Parking Information'];
    const parkingReplacements = [
        ['Parking spots', parkingInfo['Parking spots']],
        ['Golf cart spot', parkingInfo['Golf cart spot']],
        ['Cart Number', parkingInfo['Cart Number']]
    ];

    parkingReplacements.forEach(([key, value]) => {
        const regex = new RegExp(`<li>${key}:.*?</li>`, 'g');
        html = html.replace(regex, `<li>${key}: ${value}</li>`);
    });


    return html;
}

// Función principal que maneja la carga de la página
async function initializeProperty() {
    try {
        const urlParams = new URLSearchParams(window.location.search);
        const propertyKey = urlParams.get('property');

        if (!propertyKey || !villas[propertyKey]) {
            console.error('Property not found');
            window.location.href = '/index.html';
            return;
        }

        const template = await loadTemplate();
        const propertyData = villas[propertyKey];
        
        // Renderizar la propiedad
        const renderedHtml = renderProperty(template, propertyData);
        
        // Reemplazar todo el contenido del documento
        document.documentElement.innerHTML = renderedHtml;

        // Volver a agregar los scripts después de reemplazar el HTML
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
    } catch (error) {
        console.error('Error loading property:', error);
        window.location.href = '/index.html';
    }
}

// Inicializar cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', initializeProperty);
