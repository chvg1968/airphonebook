import { villas } from '../../../properties.js';

// Función para cargar la plantilla HTML
async function loadTemplate() {
    const response = await fetch('/src/html/pages/model.html');
    return await response.text();
}

// Función para renderizar una propiedad específica
function renderProperty(template, propertyData) {
    let html = template;
    
    // Reemplazar el título
    html = html.replace(
        /<title>.*?<\/title>/,
        `<title>Luxe Properties - ${propertyData.property_title}</title>`
    );

    // Reemplazar la imagen de la propiedad
    html = html.replace(
        /src="\/assets\/images\/properties\/.*?"/,
        `src="${propertyData.image}"`
    );

    // Reemplazar el título de la propiedad
    html = html.replace(
        /<h1 id="propertyTitle">.*?<\/h1>/,
        `<h1 id="propertyTitle">${propertyData.property_title}</h1>`
    );

    // Reemplazar la información de WiFi
    const wifiInfo = propertyData['Wifi Information'];
    html = html.replace(
        /<li>Villa Network Name:.*?<\/li>/,
        `<li>Villa Network Name: ${wifiInfo['Villa Network Name']}</li>`
    );
    html = html.replace(
        /<li>Villa Password:.*?<\/li>/,
        `<li>Villa Password: ${wifiInfo['Villa Password']}</li>`
    );
    html = html.replace(
        /<li>Resort Network:.*?<\/li>/,
        `<li>Resort Network: ${wifiInfo['Resort Network']}</li>`
    );
    html = html.replace(
        /<li>Resort Password:.*?<\/li>/,
        `<li>Resort Password: ${wifiInfo['Resort Password']}</li>`
    );

    // Reemplazar la información de estacionamiento
    const parkingInfo = propertyData['Parking Information'];
    if (parkingInfo) {
        html = html.replace(
            /<li>Parking spots:.*?<\/li>/,
            `<li>Parking spots: ${parkingInfo['Parking spots']}</li>`
        );
        html = html.replace(
            /<li>Golf cart spot:.*?<\/li>/,
            `<li>Golf cart spot: ${parkingInfo['Golf cart spot']}</li>`
        );
        html = html.replace(
            /<li>Cart Number:.*?<\/li>/,
            `<li>Cart Number: ${parkingInfo['Cart Number']}</li>`
        );
    }

    return html;
}

// Función principal que maneja la carga de la página
async function initializeProperty() {
    // Obtener el nombre de la propiedad de la URL
    const urlParams = new URLSearchParams(window.location.search);
    const propertyName = urlParams.get('property');

    if (!propertyName || !villas[propertyName]) {
        window.location.href = '/index.html';
        return;
    }

    const template = await loadTemplate();
    const propertyData = villas[propertyName];
    const renderedHtml = renderProperty(template, propertyData);

    // Reemplazar el contenido de la página
    document.documentElement.innerHTML = renderedHtml;

    // Volver a cargar los scripts necesarios
    const scripts = document.getElementsByTagName('script');
    for (let script of scripts) {
        if (script.src) {
            const newScript = document.createElement('script');
            newScript.src = script.src;
            document.body.appendChild(newScript);
        }
    }
}

// Inicializar cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', initializeProperty);
